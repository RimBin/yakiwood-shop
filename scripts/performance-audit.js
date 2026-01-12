const fs = require('fs');
const path = require('path');

let cachedLighthouse;
let cachedChromeLauncher;

async function getLighthouse() {
  if (cachedLighthouse) return cachedLighthouse;
  const mod = await import('lighthouse');
  cachedLighthouse = mod?.default ?? mod;
  return cachedLighthouse;
}

async function getChromeLauncher() {
  if (cachedChromeLauncher) return cachedChromeLauncher;
  const mod = await import('chrome-launcher');
  cachedChromeLauncher = mod?.default ?? mod;
  return cachedChromeLauncher;
}

async function runLighthouse(url, config) {
  const lighthouse = await getLighthouse();
  const chromeLauncher = await getChromeLauncher();

  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const options = {
    logLevel: 'info',
    output: 'html',
    port: chrome.port,
  };

  try {
    const runnerResult = await lighthouse(url, options, config);
    await chrome.kill();
    return runnerResult.lhr;
  } catch (error) {
    await chrome.kill();
    throw error;
  }
}

function calculateScore(category) {
  return Math.round(category.score * 100);
}

async function auditPage(url, name) {
  console.log(`\nAuditing: ${name} (${url})`);
  
  try {
    const results = await runLighthouse(url);
    
    const metrics = {
      performance: calculateScore(results.categories.performance),
      accessibility: calculateScore(results.categories.accessibility),
      bestPractices: calculateScore(results.categories['best-practices']),
      seo: calculateScore(results.categories.seo),
      fcp: results.audits['first-contentful-paint'].numericValue,
      lcp: results.audits['largest-contentful-paint'].numericValue,
      cls: results.audits['cumulative-layout-shift'].numericValue,
      tti: results.audits['interactive'].numericValue,
      tbt: results.audits['total-blocking-time'].numericValue,
      si: results.audits['speed-index'].numericValue,
    };
    
    console.log(`  Performance: ${metrics.performance}`);
    console.log(`  Accessibility: ${metrics.accessibility}`);
    console.log(`  Best Practices: ${metrics.bestPractices}`);
    console.log(`  SEO: ${metrics.seo}`);
    console.log(`  FCP: ${Math.round(metrics.fcp)}ms`);
    console.log(`  LCP: ${Math.round(metrics.lcp)}ms`);
    console.log(`  CLS: ${metrics.cls.toFixed(3)}`);
    
    return { name, url, metrics };
  } catch (error) {
    console.error(`  Error auditing ${name}:`, error.message);
    return { name, url, error: error.message };
  }
}

async function runAudits() {
  const pages = [
    { url: 'http://localhost:3000', name: 'Homepage' },
    { url: 'http://localhost:3000/produktai', name: 'Products Page' },
    { url: 'http://localhost:3000/produktai/burnt-wood-plank', name: 'Product Detail' },
    { url: 'http://localhost:3000/sprendimai', name: 'Solutions' },
    { url: 'http://localhost:3000/projektai', name: 'Projects' },
  ];

  console.log('Starting Performance Audit...');
  console.log('=' .repeat(50));

  const results = [];
  for (const page of pages) {
    const result = await auditPage(page.url, page.name);
    results.push(result);
    
    // Wait between audits to avoid overwhelming the system
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Generate summary report
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportDir = path.join(process.cwd(), 'reports');
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const summaryPath = path.join(reportDir, `performance-summary-${timestamp}.json`);
  fs.writeFileSync(summaryPath, JSON.stringify(results, null, 2));

  // Generate markdown report
  const markdownReport = generateMarkdownReport(results);
  const mdPath = path.join(reportDir, `performance-summary-${timestamp}.md`);
  fs.writeFileSync(mdPath, markdownReport);

  console.log('\n' + '='.repeat(50));
  console.log(`Reports saved to:`);
  console.log(`  JSON: ${summaryPath}`);
  console.log(`  Markdown: ${mdPath}`);
  
  return results;
}

function generateMarkdownReport(results) {
  let markdown = `# Performance Audit Report\n\n`;
  markdown += `**Generated:** ${new Date().toISOString()}\n\n`;
  markdown += `## Summary\n\n`;
  markdown += `| Page | Performance | Accessibility | Best Practices | SEO | LCP | CLS |\n`;
  markdown += `|------|-------------|---------------|----------------|-----|-----|-----|\n`;

  results.forEach(result => {
    if (result.error) {
      markdown += `| ${result.name} | Error | - | - | - | - | - |\n`;
    } else {
      const m = result.metrics;
      markdown += `| ${result.name} | ${m.performance} | ${m.accessibility} | ${m.bestPractices} | ${m.seo} | ${Math.round(m.lcp)}ms | ${m.cls.toFixed(3)} |\n`;
    }
  });

  markdown += `\n## Core Web Vitals Targets\n\n`;
  markdown += `- **LCP** (Largest Contentful Paint): < 2.5s ⚡\n`;
  markdown += `- **FID** (First Input Delay): < 100ms 🎯\n`;
  markdown += `- **CLS** (Cumulative Layout Shift): < 0.1 📐\n\n`;

  markdown += `## Detailed Metrics\n\n`;

  results.forEach(result => {
    if (result.error) {
      markdown += `### ${result.name}\n\n`;
      markdown += `**Error:** ${result.error}\n\n`;
    } else {
      const m = result.metrics;
      markdown += `### ${result.name}\n\n`;
      markdown += `- **Performance Score:** ${m.performance}/100\n`;
      markdown += `- **First Contentful Paint:** ${Math.round(m.fcp)}ms\n`;
      markdown += `- **Largest Contentful Paint:** ${Math.round(m.lcp)}ms ${m.lcp < 2500 ? '✅' : '⚠️'}\n`;
      markdown += `- **Cumulative Layout Shift:** ${m.cls.toFixed(3)} ${m.cls < 0.1 ? '✅' : '⚠️'}\n`;
      markdown += `- **Time to Interactive:** ${Math.round(m.tti)}ms\n`;
      markdown += `- **Total Blocking Time:** ${Math.round(m.tbt)}ms\n`;
      markdown += `- **Speed Index:** ${Math.round(m.si)}ms\n\n`;
    }
  });

  markdown += `## Recommendations\n\n`;
  markdown += `1. **Images**: Optimize all images with WebP/AVIF formats\n`;
  markdown += `2. **Code Splitting**: Implement dynamic imports for heavy components\n`;
  markdown += `3. **Fonts**: Ensure font-display: swap is set\n`;
  markdown += `4. **Caching**: Implement aggressive caching for static assets\n`;
  markdown += `5. **Database**: Add indexes and query result caching\n`;
  markdown += `6. **Bundle Size**: Analyze and reduce JavaScript bundle size\n\n`;

  return markdown;
}

// Run the audit
if (require.main === module) {
  runAudits()
    .then(() => {
      console.log('\nAudit completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Audit failed:', error);
      process.exit(1);
    });
}

module.exports = { runAudits, auditPage };
