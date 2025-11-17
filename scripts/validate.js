#!/usr/bin/env node

/**
 * Pre-deployment validation script
 * Checks that all critical configurations and dependencies are in place
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Running pre-deployment validation...\n');

let hasErrors = false;

// Check critical files exist
const criticalFiles = [
  'server.js',
  'package.json',
  '.env.example',
  'README.md',
  'API_DOCUMENTATION.md',
  'config/swagger.js',
  'middleware/rateLimiter.js',
  'middleware/errorHandler.js',
  'middleware/logger.js',
  'routes/auth.js'
];

console.log('✓ Checking critical files...');
criticalFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) {
    console.error(`  ✗ Missing: ${file}`);
    hasErrors = true;
  } else {
    console.log(`  ✓ Found: ${file}`);
  }
});

// Check critical directories
const criticalDirs = [
  'Controllers',
  'models',
  'middleware',
  'routes',
  'config',
  'uploads'
];

console.log('\n✓ Checking critical directories...');
criticalDirs.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(dirPath)) {
    console.error(`  ✗ Missing: ${dir}/`);
    hasErrors = true;
  } else {
    console.log(`  ✓ Found: ${dir}/`);
  }
});

// Check package.json for critical dependencies
console.log('\n✓ Checking critical dependencies...');
const packageJson = require('../package.json');
const criticalDeps = [
  'express',
  'mongoose',
  'jsonwebtoken',
  'bcryptjs',
  'helmet',
  'compression',
  'express-rate-limit',
  'swagger-ui-express',
  'swagger-jsdoc',
  'cors',
  'dotenv'
];

criticalDeps.forEach(dep => {
  if (!packageJson.dependencies[dep]) {
    console.error(`  ✗ Missing dependency: ${dep}`);
    hasErrors = true;
  } else {
    console.log(`  ✓ Found: ${dep}@${packageJson.dependencies[dep]}`);
  }
});

// Check environment variables template
console.log('\n✓ Checking .env.example...');
const envExample = fs.readFileSync(path.join(__dirname, '..', '.env.example'), 'utf8');
const requiredEnvVars = [
  'PORT',
  'MONGODB_URI',
  'JWT_SECRET',
  'EMAIL_USER',
  'EMAIL_PASS',
  'BASE_URL',
  'FRONTEND_URL',
  'ALLOWED_ORIGINS'
];

requiredEnvVars.forEach(envVar => {
  if (!envExample.includes(envVar)) {
    console.error(`  ✗ Missing in .env.example: ${envVar}`);
    hasErrors = true;
  } else {
    console.log(`  ✓ Found: ${envVar}`);
  }
});

// Check key security features in code
console.log('\n✓ Checking security implementations...');
const serverJs = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');

const securityChecks = [
  { name: 'Helmet.js', pattern: /require\(['"]helmet['"]\)/ },
  { name: 'Rate limiting', pattern: /require\(['"].*rateLimiter['"]\)/ },
  { name: 'CORS configuration', pattern: /cors\(corsOptions\)/ },
  { name: 'Compression', pattern: /require\(['"]compression['"]\)/ },
  { name: 'Error handler', pattern: /require\(['"].*errorHandler['"]\)/ }
];

securityChecks.forEach(check => {
  if (check.pattern.test(serverJs)) {
    console.log(`  ✓ ${check.name} implemented`);
  } else {
    console.error(`  ✗ ${check.name} not found`);
    hasErrors = true;
  }
});

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.error('❌ Validation FAILED - Please fix the errors above');
  process.exit(1);
} else {
  console.log('✅ All validations PASSED - Ready for deployment!');
  console.log('\nNext steps:');
  console.log('1. Copy .env.example to .env and configure');
  console.log('2. Run: npm install');
  console.log('3. Run: npm start');
  console.log('4. Visit: http://localhost:5001/api-docs');
  process.exit(0);
}
