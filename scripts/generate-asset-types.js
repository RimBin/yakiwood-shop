#!/usr/bin/env node

/**
 * Auto-generate TypeScript asset definitions from Figma MCP output
 * 
 * Usage:
 *   1. Copy Figma MCP output (asset definitions)
 *   2. Paste into stdin
 *   3. Script generates lib/assets/figma-assets.ts
 * 
 * Example:
 *   node scripts/generate-asset-types.js < figma-output.js
 */

const fs = require('fs');
const readline = require('readline');

// Parse asset definitions from Figma MCP output
function parseAssetDefinitions(input) {
  const assetMap = {};
  
  // Match: const imgXxxx = "https://..."
  const assetRegex = /const\s+(img\w+)\s*=\s*['"]([^'"]+)['"]/g;
  let match;
  
  while ((match = assetRegex.exec(input)) !== null) {
    const varName = match[1];
    const url = match[2];
    assetMap[varName] = url;
  }
  
  return assetMap;
}

// Categorize assets based on variable names
function categorizeAssets(assetMap) {
  const categories = {
    certifications: {},
    payments: {},
    projects: {},
    about: {},
    header: {},
    contact: {},
    ui: {},
    other: {},
  };
  
  const lowercaseNames = {
    epd: 'certifications',
    fsc: 'certifications',
    esparama: 'certifications',
    
    mastercard: 'payments',
    visa: 'payments',
    maestro: 'payments',
    stripe: 'payments',
    paypal: 'payments',
    
    project: 'projects',
    leliju: 'projects',
    
    team: 'about',
    video: 'about',
    
    logo: 'header',
    cart: 'header',
    package: 'header',
    coins: 'header',
    plant: 'header',
    
    eye: 'contact',
    statusbar: 'contact',
    
    mask: 'ui',
    vector: 'ui',
    input: 'ui',
    button: 'ui',
  };
  
  for (const [varName, url] of Object.entries(assetMap)) {
    let categorized = false;
    
    for (const [keyword, category] of Object.entries(lowercaseNames)) {
      if (varName.toLowerCase().includes(keyword)) {
        const key = varName
          .replace(/^img/, '')           // Remove 'img' prefix
          .replace(/\d+$/, '')           // Remove trailing numbers
          .replace(/([A-Z])/g, '-$1')    // Add hyphens before capitals
          .toLowerCase()
          .replace(/^-/, '');            // Remove leading hyphen
        
        if (!categories[category][key]) {
          categories[category][key] = url;
        }
        categorized = true;
        break;
      }
    }
    
    if (!categorized) {
      categories.other[varName] = url;
    }
  }
  
  return categories;
}

// Generate TypeScript file content
function generateTypeScriptFile(categories, timestamp) {
  const lines = [
    '/**',
    ' * Auto-generated Figma asset definitions',
    ` * Generated: ${timestamp}`,
    ' * Source: Figma MCP API',
    ' * Figma file: ttxSg4wMtXPqfcQEh6B405',
    ' */',
    '',
    '// ===== CERTIFICATION LOGOS =====',
    `export const certifications = {`,
    ...Object.entries(categories.certifications || {}).map(
      ([key, url]) => `  ${key}: '${url}',`
    ),
    `} as const;`,
    '',
    '// ===== PAYMENT LOGOS =====',
    `export const payments = {`,
    ...Object.entries(categories.payments || {}).map(
      ([key, url]) => `  ${key}: '${url}',`
    ),
    `} as const;`,
    '',
    '// ===== PRODUCT ASSETS =====',
    `export const productAssets = {`,
    ...Object.entries(categories.projects || {}).map(
      ([key, url]) => `  ${key}: '${url}',`
    ),
    `} as const;`,
    '',
    '// ===== ABOUT PAGE ASSETS =====',
    `export const aboutAssets = {`,
    ...Object.entries(categories.about || {}).map(
      ([key, url]) => `  ${key}: '${url}',`
    ),
    `} as const;`,
    '',
    '// ===== HEADER/NAV ASSETS =====',
    `export const headerIcons = {`,
    ...Object.entries(categories.header || {}).map(
      ([key, url]) => `  ${key}: '${url}',`
    ),
    `} as const;`,
    '',
    '// ===== CONTACT FORM ASSETS =====',
    `export const contactIcons = {`,
    ...Object.entries(categories.contact || {}).map(
      ([key, url]) => `  ${key}: '${url}',`
    ),
    `} as const;`,
    '',
    '// ===== UI COMPONENTS =====',
    `export const uiAssets = {`,
    ...Object.entries(categories.ui || {}).map(
      ([key, url]) => `  ${key}: '${url}',`
    ),
    `} as const;`,
    '',
    'export default {',
    '  certifications,',
    '  payments,',
    '  productAssets,',
    '  aboutAssets,',
    '  headerIcons,',
    '  contactIcons,',
    '  uiAssets,',
    '};',
    '',
  ];
  
  return lines.join('\n');
}

// Main function
async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });
  
  let input = '';
  
  for await (const line of rl) {
    input += line + '\n';
  }
  
  if (!input.trim()) {
    console.error('Error: No input received. Pipe Figma MCP output to this script.');
    process.exit(1);
  }
  
  // Parse and categorize
  const assetMap = parseAssetDefinitions(input);
  const categories = categorizeAssets(assetMap);
  
  // Generate file
  const timestamp = new Date().toISOString();
  const content = generateTypeScriptFile(categories, timestamp);
  
  // Write to file
  const outputPath = `${__dirname}/../lib/assets/figma-assets.ts`;
  fs.writeFileSync(outputPath, content);
  
  console.log('✓ Generated: lib/assets/figma-assets.ts');
  console.log(`✓ Total assets: ${Object.keys(assetMap).length}`);
  console.log(`✓ Categories:`);
  for (const [cat, assets] of Object.entries(categories)) {
    const count = Object.keys(assets).length;
    if (count > 0) {
      console.log(`  - ${cat}: ${count}`);
    }
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Error:', err.message);
    process.exit(1);
  });
}

module.exports = { parseAssetDefinitions, categorizeAssets, generateTypeScriptFile };
