/**
 * Bundle Analysis Script
 * 
 * Analyzes Next.js build output and generates bundle size reports.
 * Run with: npm run analyze
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

function analyzeBuild() {
  console.log(`${colors.bright}${colors.blue}Analyzing Next.js Build...${colors.reset}\n`);

  const buildDir = path.join(process.cwd(), '.next');
  
  if (!fs.existsSync(buildDir)) {
    console.error(`${colors.red}Error: Build directory not found. Run 'npm run build' first.${colors.reset}`);
    process.exit(1);
  }

  // Analyze static chunks
  const staticDir = path.join(buildDir, 'static', 'chunks');
  let totalSize = 0;
  const chunks = [];

  if (fs.existsSync(staticDir)) {
    const files = fs.readdirSync(staticDir, { recursive: true });
    
    files.forEach(file => {
      const filePath = path.join(staticDir, file);
      if (fs.statSync(filePath).isFile() && file.endsWith('.js')) {
        const size = getFileSize(filePath);
        totalSize += size;
        chunks.push({ name: file, size });
      }
    });
  }

  // Sort by size
  chunks.sort((a, b) => b.size - a.size);

  // Display results
  console.log(`${colors.bright}JavaScript Bundle Analysis${colors.reset}`);
  console.log('─'.repeat(60));
  console.log(`${colors.bright}File${' '.repeat(46)}Size${colors.reset}`);
  console.log('─'.repeat(60));

  // Show top 15 largest chunks
  chunks.slice(0, 15).forEach(chunk => {
    const nameDisplay = chunk.name.length > 45 
      ? '...' + chunk.name.slice(-42) 
      : chunk.name;
    const sizeDisplay = formatBytes(chunk.size);
    const color = chunk.size > 100000 ? colors.red : 
                  chunk.size > 50000 ? colors.yellow : 
                  colors.green;
    
    console.log(`${nameDisplay.padEnd(48)} ${color}${sizeDisplay.padStart(10)}${colors.reset}`);
  });

  console.log('─'.repeat(60));
  console.log(`${colors.bright}Total Chunks:${colors.reset} ${chunks.length}`);
  console.log(`${colors.bright}Total Size:${colors.reset} ${formatBytes(totalSize)}`);

  // Check build pages
  const pagesManifest = path.join(buildDir, 'server', 'pages-manifest.json');
  if (fs.existsSync(pagesManifest)) {
    const manifest = JSON.parse(fs.readFileSync(pagesManifest, 'utf8'));
    console.log(`\n${colors.bright}Pages Built:${colors.reset} ${Object.keys(manifest).length}`);
  }

  // Performance recommendations
  console.log(`\n${colors.bright}${colors.blue}Recommendations:${colors.reset}`);
  
  const largeChunks = chunks.filter(c => c.size > 100000);
  if (largeChunks.length > 0) {
    console.log(`${colors.yellow}⚠${colors.reset} Found ${largeChunks.length} chunks larger than 100KB`);
    console.log('  Consider code splitting or dynamic imports');
  }

  if (totalSize > 500000) {
    console.log(`${colors.yellow}⚠${colors.reset} Total bundle size is ${formatBytes(totalSize)}`);
    console.log('  Target: < 500KB for optimal performance');
  } else {
    console.log(`${colors.green}✓${colors.reset} Total bundle size is within target`);
  }

  // Check for duplicate dependencies
  console.log(`\n${colors.bright}${colors.blue}Checking for common issues...${colors.reset}`);
  
  const packageJson = require(path.join(process.cwd(), 'package.json'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  // Check for large libraries
  const largeLibs = ['moment', 'lodash', 'aws-sdk', 'firebase'];
  const foundLargeLibs = largeLibs.filter(lib => deps[lib]);
  
  if (foundLargeLibs.length > 0) {
    console.log(`${colors.yellow}⚠${colors.reset} Large libraries detected: ${foundLargeLibs.join(', ')}`);
    console.log('  Consider lighter alternatives:');
    if (foundLargeLibs.includes('moment')) console.log('    - moment → date-fns or day.js');
    if (foundLargeLibs.includes('lodash')) console.log('    - lodash → lodash-es (tree-shakeable)');
  }

  // Generate JSON report
  const report = {
    timestamp: new Date().toISOString(),
    totalSize,
    totalChunks: chunks.length,
    chunks: chunks.slice(0, 20), // Top 20
    recommendations: [],
  };

  if (largeChunks.length > 0) {
    report.recommendations.push(`${largeChunks.length} chunks exceed 100KB - consider code splitting`);
  }
  if (totalSize > 500000) {
    report.recommendations.push('Total bundle exceeds 500KB target');
  }
  if (foundLargeLibs.length > 0) {
    report.recommendations.push(`Large libraries detected: ${foundLargeLibs.join(', ')}`);
  }

  const reportPath = path.join(process.cwd(), 'reports', 'bundle-analysis.json');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`\n${colors.green}✓${colors.reset} Full report saved to: ${reportPath}`);

  // Run webpack-bundle-analyzer if available
  console.log(`\n${colors.bright}${colors.blue}Generating visual bundle analysis...${colors.reset}`);
  console.log('Run: npm run analyze:visual (if webpack-bundle-analyzer is installed)\n');
}

// Run analysis
if (require.main === module) {
  try {
    analyzeBuild();
  } catch (error) {
    console.error(`${colors.red}Error analyzing build:${colors.reset}`, error.message);
    process.exit(1);
  }
}

module.exports = { analyzeBuild };
