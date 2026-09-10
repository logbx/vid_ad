#!/usr/bin/env node

/**
 * Smoke Test - Verify basic project functionality
 * 
 * This script performs basic validation without requiring API keys:
 * 1. Check if the build output exists
 * 2. Verify critical modules can be imported
 * 3. Validate configuration files
 * 4. Check environment setup
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Running Vid_Ad Smoke Tests\n');

let passed = 0;
let failed = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`✅ ${description}`);
    passed++;
  } catch (error) {
    console.log(`❌ ${description}`);
    console.log(`   Error: ${error.message}`);
    failed++;
  }
}

// Test 1: Build output exists
test('Build output exists', () => {
  const nextDir = path.join(__dirname, '..', '.next');
  if (!fs.existsSync(nextDir)) {
    throw new Error('.next directory not found');
  }
});

// Test 2: Package.json is valid
test('package.json is valid', () => {
  const packageJson = require('../package.json');
  if (!packageJson.name || !packageJson.version) {
    throw new Error('Invalid package.json');
  }
  if (!packageJson.dependencies.next) {
    throw new Error('Next.js dependency missing');
  }
});

// Test 3: Firebase config exists
test('Firebase config file exists', () => {
  const configPath = path.join(__dirname, '..', 'lib', 'firebase', 'config.ts');
  if (!fs.existsSync(configPath)) {
    throw new Error('Firebase config not found');
  }
});

// Test 4: API routes exist
test('API routes directory exists', () => {
  const apiDir = path.join(__dirname, '..', 'app', 'api');
  if (!fs.existsSync(apiDir)) {
    throw new Error('API directory not found');
  }
  const routes = fs.readdirSync(apiDir);
  if (routes.length === 0) {
    throw new Error('No API routes found');
  }
});

// Test 5: Main pages exist
test('Main pages exist', () => {
  const pages = ['page.tsx', 'layout.tsx'];
  const appDir = path.join(__dirname, '..', 'app');
  
  pages.forEach(page => {
    const pagePath = path.join(appDir, page);
    if (!fs.existsSync(pagePath)) {
      throw new Error(`${page} not found`);
    }
  });
});

// Test 6: Generate flow exists
test('Generate flow exists', () => {
  const generateDir = path.join(__dirname, '..', 'app', 'generate');
  if (!fs.existsSync(generateDir)) {
    throw new Error('Generate directory not found');
  }
  
  const requiredFiles = ['page.tsx'];
  requiredFiles.forEach(file => {
    const filePath = path.join(generateDir, file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`${file} not found in generate flow`);
    }
  });
});

// Test 7: Schema validation exists
test('Zod schemas exist', () => {
  const schemaPath = path.join(__dirname, '..', 'lib', 'schemas', 'adGenerationSchema.ts');
  if (!fs.existsSync(schemaPath)) {
    throw new Error('Ad generation schema not found');
  }
});

// Test 8: Environment example exists
test('Environment example exists', () => {
  const envExample = path.join(__dirname, '..', '.env.example');
  if (!fs.existsSync(envExample)) {
    throw new Error('.env.example not found');
  }
  
  const content = fs.readFileSync(envExample, 'utf8');
  const requiredVars = [
    'OPENAI_API_KEY',
    'REPLICATE_API_TOKEN',
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'AWS_ACCESS_KEY_ID'
  ];
  
  requiredVars.forEach(varName => {
    if (!content.includes(varName)) {
      throw new Error(`${varName} not in .env.example`);
    }
  });
});

// Test 9: README exists
test('README.md exists and is not empty', () => {
  const readme = path.join(__dirname, '..', 'README.md');
  if (!fs.existsSync(readme)) {
    throw new Error('README.md not found');
  }
  
  const content = fs.readFileSync(readme, 'utf8');
  if (content.length < 100) {
    throw new Error('README.md is too short');
  }
  
  // Check for key sections
  const requiredSections = [
    '# Vid_Ad',
    '## Installation',
    '## Prerequisites',
    '## Development'
  ];
  
  requiredSections.forEach(section => {
    if (!content.includes(section)) {
      throw new Error(`README.md missing section: ${section}`);
    }
  });
});

// Test 10: TypeScript config is valid
test('TypeScript config is valid', () => {
  const tsconfigPath = path.join(__dirname, '..', 'tsconfig.json');
  if (!fs.existsSync(tsconfigPath)) {
    throw new Error('tsconfig.json not found');
  }
  
  const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
  if (!tsconfig.compilerOptions) {
    throw new Error('Invalid tsconfig.json');
  }
});

// Summary
console.log(`\n${'='.repeat(50)}`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`${'='.repeat(50)}\n`);

if (failed > 0) {
  console.log('❌ Smoke tests failed. Please fix the issues above.');
  process.exit(1);
} else {
  console.log('✅ All smoke tests passed!');
  console.log('\n📋 Next steps:');
  console.log('   1. Copy .env.example to .env.local');
  console.log('   2. Add your API keys');
  console.log('   3. Run: npm run dev');
  console.log('   4. Visit: http://localhost:3000\n');
  process.exit(0);
}
