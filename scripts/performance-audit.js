const fs = require('fs');
const path = require('path');

function getArgValue(name) {
  const idx = process.argv.indexOf(name);
  if (idx === -1) return undefined;
  const value = process.argv[idx + 1];
  if (!value || value.startsWith('--')) return undefined;
  return value;
}

function hasFlag(name) {
  return process.argv.includes(name);
}

function getBaseUrl() {
  const fromArg = getArgValue('--baseUrl');
  const fromEnv = process.env.PERF_BASE_URL;
  const base = (fromArg || fromEnv || 'http://localhost:3000').trim();
  return base.endsWith('/') ? base.slice(0, -1) : base;
}

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
    // Keep output quiet on Windows PowerShell (LH status logs can be treated as errors)
    // and to reduce noise in CI/local runs.
    logLevel: 'silent',
    // We only read the LHR; no need to generate a full HTML report.
    output: 'json',
    port: chrome.port,
  };

  try {
    const timeoutMs = 120_000;
    const runnerResult = await Promise.race([
      lighthouse(url, options, config),
      new Promise((_, reject) => setTimeout(() => reject(new Error(`Lighthouse timed out after ${timeoutMs}ms: ${url}`)), timeoutMs)),
    ]);
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

function safeFilenameSegment(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]+/g, '')
    .slice(0, 80);
}

function findFirstNodeLike(value) {
  const queue = [value];
  const visited = new Set();

  while (queue.length) {
    const current = queue.shift();
    if (!current || (typeof current !== 'object' && typeof current !== 'function')) continue;
    if (visited.has(current)) continue;
    visited.add(current);

    // Lighthouse node details can be either:
    // - {type: 'node', snippet, selector, ...}
    // - {node: {type: 'node', ...}, ...}
    if (current.type === 'node' && (current.snippet || current.selector || current.path)) {
      return current;
    }
    if (current.node && current.node.type === 'node') {
      return current.node;
    }

    if (Array.isArray(current)) {
      for (const item of current) queue.push(item);
      continue;
    }

    for (const key of Object.keys(current)) {
      queue.push(current[key]);
    }
  }

  return null;
}

function findFirstStringField(value, fieldNames) {
  const queue = [value];
  const visited = new Set();

  while (queue.length) {
    const current = queue.shift();
    if (!current || (typeof current !== 'object' && typeof current !== 'function')) continue;
    if (visited.has(current)) continue;
    visited.add(current);

    if (!Array.isArray(current)) {
      for (const field of fieldNames) {
        if (typeof current[field] === 'string' && current[field]) return current[field];
      }
    }

    if (Array.isArray(current)) {
      for (const item of current) queue.push(item);
      continue;
    }

    for (const key of Object.keys(current)) {
      queue.push(current[key]);
    }
  }

  return null;
}

function extractLcpDiagnostics(lhr) {
  const audits = lhr?.audits ?? {};

  const lcpElementAudit =
    audits['largest-contentful-paint-element'] ||
    Object.values(audits).find(
      (audit) =>
        audit &&
        typeof audit.title === 'string' &&
        audit.title.toLowerCase().includes('largest contentful paint element')
    );

  const lcpElementDetails = lcpElementAudit?.details ?? null;
  const lcpElementNode = findFirstNodeLike(lcpElementDetails);

  // In Lighthouse, the LCP *resource URL* is commonly exposed on the *element* audit.
  // The timing audit is primarily numeric and often does not contain a resource URL.
  const lcpResourceUrlFromElement = findFirstStringField(lcpElementDetails, ['url', 'resourceUrl']);

  const lcpTimingAudit = audits['largest-contentful-paint'] ?? null;
  const lcpResourceUrlFromTiming =
    (typeof lcpTimingAudit?.details?.url === 'string' && lcpTimingAudit.details.url) ||
    (typeof lcpTimingAudit?.details?.resourceUrl === 'string' && lcpTimingAudit.details.resourceUrl) ||
    null;

  const lcpResourceUrl = lcpResourceUrlFromElement || lcpResourceUrlFromTiming || null;

  return {
    resourceUrl: lcpResourceUrl,
    element:
      lcpElementNode
        ? {
            snippet: lcpElementNode.snippet || null,
            selector: lcpElementNode.selector || null,
            path: lcpElementNode.path || null,
          }
        : null,
    debug: {
      elementAuditId: lcpElementAudit?.id ?? null,
      elementAuditTitle: lcpElementAudit?.title ?? null,
      hasNode: Boolean(lcpElementNode),
      resourceUrlFromElement: lcpResourceUrlFromElement,
      resourceUrlFromTiming: lcpResourceUrlFromTiming,
    },
  };
}

async function auditPage(url, name) {
  console.log(`\nAuditing: ${name} (${url})`);
  
  try {
    const results = await runLighthouse(url);

    const lcp = extractLcpDiagnostics(results);

    // Optional debug dump to help troubleshoot Lighthouse audit shape.
    if (hasFlag('--saveLhr') || process.env.PERF_SAVE_LHR === '1') {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const reportDir = path.join(process.cwd(), 'reports');
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
      }

      const audits = results?.audits ?? {};
      const lcpAuditIds = Object.keys(audits).filter((id) => id.includes('largest-contentful-paint') || id.startsWith('lcp-'));
      const lcpAuditSubset = Object.fromEntries(lcpAuditIds.map((id) => [id, audits[id]]));
      const dump = {
        requestedUrl: results?.requestedUrl ?? null,
        finalDisplayedUrl: results?.finalDisplayedUrl ?? null,
        fetchTime: results?.fetchTime ?? null,
        lcpDebug: lcp.debug,
        lcpAudits: lcpAuditSubset,
      };

      const outPath = path.join(
        reportDir,
        `lhr-lcp-${safeFilenameSegment(name)}-${timestamp}.json`
      );
      fs.writeFileSync(outPath, JSON.stringify(dump, null, 2));
      console.log(`  Saved LCP debug: ${outPath}`);
    }
    
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
    
    return {
      name,
      url,
      metrics,
      lcp: {
        resourceUrl: lcp.resourceUrl,
        element: lcp.element,
      },
    };
  } catch (error) {
    console.error(`  Error auditing ${name}:`, error.message);
    return { name, url, error: error.message };
  }
}

async function runAudits() {
  const baseUrl = getBaseUrl();
  const onlyArg = getArgValue('--only');
  const onlyNames = onlyArg
    ? onlyArg
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
    : null;
  const pages = [
    // Use canonical Lithuanian routes directly to avoid redirect overhead.
    { url: `${baseUrl}/lt`, name: 'Homepage' },
    { url: `${baseUrl}/lt/produktai`, name: 'Products Page' },
    { url: `${baseUrl}/lt/produktai/burnt-wood-plank`, name: 'Product Detail' },
    { url: `${baseUrl}/lt/sprendimai`, name: 'Solutions' },
    { url: `${baseUrl}/lt/projektai`, name: 'Projects' },
  ];

  const filteredPages =
    onlyNames && onlyNames.length
      ? pages.filter((p) => onlyNames.some((needle) => p.name.toLowerCase().includes(needle)))
      : pages;

  console.log('Starting Performance Audit...');
  console.log('=' .repeat(50));
  console.log(`Base URL: ${baseUrl}`);

  const results = [];
  for (const page of filteredPages) {
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
      if (result.lcp?.resourceUrl) {
        markdown += `- **LCP Resource:** ${result.lcp.resourceUrl}\n`;
      }
      if (result.lcp?.element?.snippet) {
        markdown += `- **LCP Element:** ${result.lcp.element.snippet.replace(/\s+/g, ' ').trim()}\n`;
      }
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
