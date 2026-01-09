#!/usr/bin/env node

/**
 * Environment Variable Validation Script
 * 
 * Checks if all required environment variables are set and validates their format.
 * Run with: node scripts/check-env.js
 * 
 * Options:
 *   --validate    Also test API connections (slower)
 *   --fix         Interactive mode to help set missing variables
 *   --strict      Exit with error if optional vars are missing
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Minimal .env loader (no external deps)
function loadDotEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');

  content.split(/\r?\n/).forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) return;
    const eqIndex = line.indexOf('=');
    if (eqIndex <= 0) return;

    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();

    // Strip surrounding quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  });
}

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const { reset, bright, red, green, yellow, blue, cyan } = colors;

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  validate: args.includes('--validate'),
  fix: args.includes('--fix'),
  strict: args.includes('--strict'),
  help: args.includes('--help') || args.includes('-h'),
};

// Environment variable definitions
const envVars = {
  // Next.js & Build
  NEXT_PUBLIC_SITE_URL: {
    required: true,
    type: 'url',
    description: 'Public site URL',
    example: 'http://localhost:3011 or https://yakiwood.lt',
    category: 'Next.js & Build',
  },
  NODE_ENV: {
    required: false,
    type: 'enum',
    values: ['development', 'production', 'test'],
    description: 'Application environment',
    default: 'development',
    category: 'Next.js & Build',
  },

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: {
    required: 'conditional',
    condition: 'database',
    type: 'url',
    pattern: /^https:\/\/[a-z0-9-]+\.supabase\.co$/,
    description: 'Supabase project URL',
    example: 'https://abcdefghijk.supabase.co',
    category: 'Supabase',
    getLink: 'https://app.supabase.com/project/_/settings/api',
  },
  NEXT_PUBLIC_SUPABASE_ANON_KEY: {
    required: 'conditional',
    condition: 'database',
    type: 'jwt',
    description: 'Supabase anonymous/public key',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    category: 'Supabase',
    getLink: 'https://app.supabase.com/project/_/settings/api',
  },
  SUPABASE_SERVICE_ROLE_KEY: {
    required: 'conditional',
    condition: 'database',
    type: 'jwt',
    description: 'Supabase service role key (server-side only)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    category: 'Supabase',
    sensitive: true,
  },
  SUPABASE_STORAGE_BUCKET: {
    required: false,
    type: 'string',
    description: 'Storage bucket name',
    default: 'product-images',
    category: 'Supabase',
  },

  // Stripe
  STRIPE_SECRET_KEY: {
    required: 'conditional',
    condition: 'payments',
    type: 'string',
    pattern: /^sk_(test|live)_[a-zA-Z0-9]+$/,
    description: 'Stripe secret key (server-side only)',
    example: 'sk_test_... or sk_live_...',
    category: 'Stripe',
    sensitive: true,
    getLink: 'https://dashboard.stripe.com/apikeys',
  },
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: {
    required: 'conditional',
    condition: 'payments',
    type: 'string',
    pattern: /^pk_(test|live)_[a-zA-Z0-9]+$/,
    description: 'Stripe publishable key',
    example: 'pk_test_... or pk_live_...',
    category: 'Stripe',
    getLink: 'https://dashboard.stripe.com/apikeys',
  },
  STRIPE_WEBHOOK_SECRET: {
    required: 'conditional',
    condition: 'payments',
    type: 'string',
    pattern: /^whsec_[a-zA-Z0-9]+$/,
    description: 'Stripe webhook signing secret',
    example: 'whsec_...',
    category: 'Stripe',
    sensitive: true,
    getLink: 'https://dashboard.stripe.com/webhooks',
  },

  // Email (Resend)
  RESEND_API_KEY: {
    required: 'conditional',
    condition: 'emails',
    type: 'string',
    pattern: /^re_[a-zA-Z0-9_]+$/,
    description: 'Resend API key',
    example: 're_...',
    category: 'Email',
    sensitive: true,
    getLink: 'https://resend.com/api-keys',
  },
  FROM_EMAIL: {
    required: 'conditional',
    condition: 'emails',
    type: 'email',
    description: 'Sender email address',
    example: 'noreply@yakiwood.lt',
    category: 'Email',
  },
  SYSTEM_EMAIL: {
    required: false,
    type: 'email',
    description: 'System notifications recipient',
    example: 'admin@yakiwood.lt',
    category: 'Email',
  },
  SYSTEM_EMAIL_FROM: {
    required: false,
    type: 'string',
    description: 'System email sender name and address',
    example: 'Yakiwood <noreply@yakiwood.lt>',
    category: 'Email',
  },

  // reCAPTCHA (Contact form)
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY: {
    required: 'conditional',
    condition: 'contact-form',
    type: 'string',
    description: 'Google reCAPTCHA v2 site key (public, used in contact form UI)',
    example: '6Lc... (site key from Google reCAPTCHA admin)',
    category: 'reCAPTCHA',
    getLink: 'https://www.google.com/recaptcha/admin',
  },
  RECAPTCHA_SECRET_KEY: {
    required: 'conditional',
    condition: 'contact-form',
    type: 'string',
    description: 'Google reCAPTCHA secret key (server-side verification for contact form)',
    example: '6Lc... (secret key from Google reCAPTCHA admin)',
    category: 'reCAPTCHA',
    sensitive: true,
    getLink: 'https://www.google.com/recaptcha/admin',
  },

  // Analytics
  NEXT_PUBLIC_GA_MEASUREMENT_ID: {
    required: false,
    type: 'string',
    pattern: /^G-[A-Z0-9]+$/,
    description: 'Google Analytics 4 Measurement ID',
    example: 'G-XXXXXXXXXX',
    category: 'Analytics',
    getLink: 'https://analytics.google.com/',
  },
  NEXT_PUBLIC_GA_DEBUG: {
    required: false,
    type: 'boolean',
    description: 'Enable GA in development mode',
    default: 'false',
    category: 'Analytics',
  },

  // Newsletter
  NEWSLETTER_PROVIDER: {
    required: false,
    type: 'enum',
    values: ['database', 'mailchimp', 'resend'],
    description: 'Newsletter provider',
    default: 'database',
    category: 'Newsletter',
  },
  MAILCHIMP_API_KEY: {
    required: 'conditional',
    condition: 'NEWSLETTER_PROVIDER=mailchimp',
    type: 'string',
    pattern: /^[a-z0-9]+-[a-z]{2}[0-9]+$/,
    description: 'Mailchimp API key',
    example: 'xxxxxxxxxxxxxxxxxxxx-us19',
    category: 'Newsletter',
    sensitive: true,
    getLink: 'https://mailchimp.com/help/about-api-keys/',
  },
  MAILCHIMP_AUDIENCE_ID: {
    required: 'conditional',
    condition: 'NEWSLETTER_PROVIDER=mailchimp',
    type: 'string',
    description: 'Mailchimp audience/list ID',
    example: 'a1b2c3d4e5',
    category: 'Newsletter',
  },
  MAILCHIMP_SERVER_PREFIX: {
    required: 'conditional',
    condition: 'NEWSLETTER_PROVIDER=mailchimp',
    type: 'string',
    description: 'Mailchimp server prefix',
    example: 'us19',
    default: 'us19',
    category: 'Newsletter',
  },
  RESEND_AUDIENCE_ID: {
    required: 'conditional',
    condition: 'NEWSLETTER_PROVIDER=resend',
    type: 'string',
    description: 'Resend audience ID',
    category: 'Newsletter',
  },

  // Admin
  ADMIN_EMAILS: {
    required: true,
    type: 'email-list',
    description: 'Comma-separated admin email addresses',
    example: 'admin@yakiwood.lt,owner@yakiwood.lt',
    category: 'Admin',
  },

  // Sanity CMS
  NEXT_PUBLIC_SANITY_PROJECT_ID: {
    required: 'conditional',
    condition: 'cms',
    type: 'string',
    description: 'Sanity project ID',
    example: 'abc123de',
    category: 'Sanity CMS',
    getLink: 'https://www.sanity.io/manage',
  },
  NEXT_PUBLIC_SANITY_DATASET: {
    required: 'conditional',
    condition: 'cms',
    type: 'string',
    description: 'Sanity dataset name',
    example: 'production',
    default: 'production',
    category: 'Sanity CMS',
  },
  NEXT_PUBLIC_SANITY_API_VERSION: {
    required: false,
    type: 'date',
    pattern: /^\d{4}-\d{2}-\d{2}$/,
    description: 'Sanity API version (YYYY-MM-DD)',
    default: '2025-12-10',
    category: 'Sanity CMS',
  },
  SANITY_API_TOKEN: {
    required: false,
    type: 'string',
    description: 'Sanity API token (for private datasets)',
    category: 'Sanity CMS',
    sensitive: true,
  },

  // Image CDN
  NEXT_PUBLIC_CDN_URL: {
    required: false,
    type: 'url',
    description: 'CDN base URL for images',
    example: 'https://cdn.yakiwood.lt',
    category: 'Image CDN',
  },

  // Development
  ENABLE_EXPERIMENTAL_FEATURES: {
    required: false,
    type: 'boolean',
    description: 'Enable experimental features',
    default: 'false',
    category: 'Development',
  },
  LOG_LEVEL: {
    required: false,
    type: 'enum',
    values: ['debug', 'info', 'warn', 'error'],
    description: 'Logging level',
    default: 'info',
    category: 'Development',
  },
  DEBUG: {
    required: false,
    type: 'boolean',
    description: 'Enable verbose debugging',
    default: 'false',
    category: 'Development',
  },
};

// Results tracking
const results = {
  errors: [],
  warnings: [],
  info: [],
  passed: [],
};

// Utility functions
function log(message, color = reset) {
  console.log(`${color}${message}${reset}`);
}

function logSection(title) {
  console.log(`\n${bright}${blue}═══ ${title} ═══${reset}\n`);
}

function validateUrl(value) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateJWT(value) {
  return /^eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*$/.test(value);
}

function validateBoolean(value) {
  return ['true', 'false', '1', '0'].includes(value.toLowerCase());
}

function validateDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(Date.parse(value));
}

function maskSensitive(value) {
  if (!value || value.length < 10) return '***';
  return value.slice(0, 8) + '...' + value.slice(-4);
}

// Check if env file exists
function checkEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    log(`⚠️  No .env.local file found`, yellow);
    log(`   Create one at project root:`, reset);
    log(`   ${cyan}.env.local${reset}\n`, reset);
    return false;
  }
  log(`✓ .env.local file exists`, green);
  return true;
}

// Validate individual variable
function validateVariable(name, config) {
  const value = process.env[name];
  
  // Check if variable is set
  if (!value) {
    if (config.required === true) {
      results.errors.push({
        name,
        message: `Required variable not set`,
        help: config.example ? `Example: ${config.example}` : null,
        link: config.getLink,
      });
      return false;
    } else if (config.required === 'conditional') {
      results.warnings.push({
        name,
        message: `Conditional variable not set (needed for: ${config.condition})`,
        help: config.example ? `Example: ${config.example}` : null,
      });
      return true; // Don't fail, just warn
    } else {
      if (options.strict) {
        results.warnings.push({
          name,
          message: `Optional variable not set`,
          help: config.default ? `Default: ${config.default}` : null,
        });
      }
      return true;
    }
  }

  // Validate type/format
  const validationChecks = {
    url: () => validateUrl(value),
    email: () => validateEmail(value),
    'email-list': () => value.split(',').every(e => validateEmail(e.trim())),
    jwt: () => validateJWT(value),
    boolean: () => validateBoolean(value),
    date: () => validateDate(value),
    enum: () => config.values.includes(value),
    string: () => value.length > 0,
  };

  const validator = validationChecks[config.type];
  if (validator && !validator()) {
    results.errors.push({
      name,
      message: `Invalid format for type: ${config.type}`,
      help: config.example ? `Example: ${config.example}` : null,
      value: config.sensitive ? maskSensitive(value) : value,
    });
    return false;
  }

  // Check pattern if specified
  if (config.pattern && !config.pattern.test(value)) {
    results.errors.push({
      name,
      message: `Value doesn't match required pattern`,
      help: config.example ? `Example: ${config.example}` : null,
      value: config.sensitive ? maskSensitive(value) : null,
    });
    return false;
  }

  results.passed.push({
    name,
    value: config.sensitive ? maskSensitive(value) : value,
  });
  return true;
}

// Test API connections
async function testConnections() {
  logSection('Testing API Connections');

  const tests = [];

  // Test Supabase
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    tests.push(testSupabase());
  }

  // Test Stripe
  if (process.env.STRIPE_SECRET_KEY) {
    tests.push(testStripe());
  }

  // Test Resend
  if (process.env.RESEND_API_KEY) {
    tests.push(testResend());
  }

  const testResults = await Promise.allSettled(tests);
  
  testResults.forEach((result) => {
    if (result.status === 'fulfilled') {
      log(result.value, green);
    } else {
      log(`✗ ${result.reason}`, red);
    }
  });
}

function testSupabase() {
  return new Promise((resolve, reject) => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    https.get(`${url}/rest/v1/`, {
      headers: { apikey: key },
      timeout: 5000,
    }, (res) => {
      if (res.statusCode === 200 || res.statusCode === 401) {
        resolve('✓ Supabase connection successful');
      } else {
        reject(`Supabase returned status ${res.statusCode}`);
      }
    }).on('error', (err) => {
      reject(`Supabase connection failed: ${err.message}`);
    });
  });
}

function testStripe() {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${process.env.STRIPE_SECRET_KEY}:`).toString('base64');

    https.get('https://api.stripe.com/v1/charges?limit=1', {
      headers: { Authorization: `Basic ${auth}` },
      timeout: 5000,
    }, (res) => {
      if (res.statusCode === 200) {
        resolve('✓ Stripe connection successful');
      } else {
        reject(`Stripe returned status ${res.statusCode}`);
      }
    }).on('error', (err) => {
      reject(`Stripe connection failed: ${err.message}`);
    });
  });
}

function testResend() {
  return new Promise((resolve, reject) => {
    https.get('https://api.resend.com/domains', {
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
      timeout: 5000,
    }, (res) => {
      if (res.statusCode === 200 || res.statusCode === 401) {
        resolve('✓ Resend connection successful');
      } else {
        reject(`Resend returned status ${res.statusCode}`);
      }
    }).on('error', (err) => {
      reject(`Resend connection failed: ${err.message}`);
    });
  });
}

// Print results
function printResults() {
  // Group by category
  const byCategory = {};
  Object.entries(envVars).forEach(([name, config]) => {
    const category = config.category || 'Other';
    if (!byCategory[category]) byCategory[category] = [];
    byCategory[category].push(name);
  });

  // Print passed variables by category
  if (results.passed.length > 0) {
    logSection('Environment Variables Status');
    Object.entries(byCategory).forEach(([category, varNames]) => {
      const categoryVars = results.passed.filter(v => varNames.includes(v.name));
      if (categoryVars.length > 0) {
        log(`\n${bright}${category}:${reset}`, cyan);
        categoryVars.forEach(({ name, value }) => {
          log(`  ${green}✓${reset} ${name}${value ? ` = ${value}` : ''}`, reset);
        });
      }
    });
  }

  // Print warnings
  if (results.warnings.length > 0) {
    logSection('Warnings');
    results.warnings.forEach(({ name, message, help }) => {
      log(`${yellow}⚠${reset}  ${bright}${name}${reset}: ${message}`, yellow);
      if (help) log(`   ${help}`, reset);
    });
  }

  // Print errors
  if (results.errors.length > 0) {
    logSection('Errors');
    results.errors.forEach(({ name, message, help, value, link }) => {
      log(`${red}✗${reset}  ${bright}${name}${reset}: ${message}`, red);
      if (value) log(`   Current value: ${value}`, reset);
      if (help) log(`   ${help}`, reset);
      if (link) log(`   Get it from: ${cyan}${link}${reset}`, reset);
    });
  }

  // Summary
  logSection('Summary');
  log(`${green}✓${reset} Passed: ${results.passed.length}`, green);
  if (results.warnings.length > 0) {
    log(`${yellow}⚠${reset} Warnings: ${results.warnings.length}`, yellow);
  }
  if (results.errors.length > 0) {
    log(`${red}✗${reset} Errors: ${results.errors.length}`, red);
  }

  // Exit code
  const exitCode = results.errors.length > 0 ? 1 : 0;
  
  if (exitCode === 0) {
    log(`\n${green}${bright}All checks passed!${reset}`, green);
  } else {
    log(`\n${red}${bright}Environment configuration has errors${reset}`, red);
    log(`Fix the errors above and run again.`, reset);
    log(`\nFor help, see: ${cyan}docs/ENVIRONMENT.md${reset}`, reset);
  }

  return exitCode;
}

// Show help
function showHelp() {
  console.log(`
${bright}Environment Variable Checker${reset}

${bright}USAGE:${reset}
  node scripts/check-env.js [options]

${bright}OPTIONS:${reset}
  --validate    Test API connections (Supabase, Stripe, Resend)
  --strict      Treat missing optional variables as warnings
  --help, -h    Show this help message

${bright}EXAMPLES:${reset}
  ${cyan}node scripts/check-env.js${reset}
    Basic check of all environment variables

  ${cyan}node scripts/check-env.js --validate${reset}
    Check variables and test API connections

  ${cyan}node scripts/check-env.js --strict${reset}
    Warn about missing optional variables

${bright}DOCUMENTATION:${reset}
  See ${cyan}docs/ENVIRONMENT.md${reset} for complete setup guide

${bright}QUICK FIX:${reset}
  1. Create ${cyan}.env.local${reset} in project root
  
  2. Fill it with your values
  
  3. Restart your dev server:
     ${cyan}npm run dev${reset}
`);
}

// Main function
async function main() {
  if (options.help) {
    showHelp();
    process.exit(0);
  }

  // Load `.env.local` (and `.env`) so checks work out-of-the-box in dev
  loadDotEnvFile(path.join(process.cwd(), '.env.local'));
  loadDotEnvFile(path.join(process.cwd(), '.env'));

  log(`${bright}${blue}╔═══════════════════════════════════════════════════════════╗${reset}`);
  log(`${bright}${blue}║     Yakiwood Environment Configuration Checker          ║${reset}`);
  log(`${bright}${blue}╚═══════════════════════════════════════════════════════════╝${reset}\n`);

  log(`Environment: ${bright}${process.env.NODE_ENV || 'development'}${reset}`);
  log(`Working directory: ${process.cwd()}\n`);

  // Check if .env.local exists
  checkEnvFile();

  // Validate all variables
  logSection('Validating Variables');
  Object.entries(envVars).forEach(([name, config]) => {
    validateVariable(name, config);
  });

  // Test connections if requested
  if (options.validate) {
    await testConnections();
  }

  // Print results and exit
  const exitCode = printResults();
  process.exit(exitCode);
}

// Run
main().catch((error) => {
  console.error(`${red}Fatal error:${reset}`, error);
  process.exit(1);
});
