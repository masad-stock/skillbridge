#!/usr/bin/env node

// Force environment variables for production build
process.env.CI = 'false';
process.env.DISABLE_ESLINT_PLUGIN = 'true';
process.env.ESLINT_NO_DEV_ERRORS = 'true';
process.env.GENERATE_SOURCEMAP = 'false';

console.log('🚀 Starting production build with ESLint disabled...');
console.log('Environment:', {
    CI: process.env.CI,
    DISABLE_ESLINT_PLUGIN: process.env.DISABLE_ESLINT_PLUGIN,
    ESLINT_NO_DEV_ERRORS: process.env.ESLINT_NO_DEV_ERRORS
});

// Run the build
const { spawn } = require('child_process');
const build = spawn('npm', ['run', 'build:react'], {
    stdio: 'inherit',
    shell: true,
    env: process.env
});

build.on('close', (code) => {
    if (code !== 0) {
        console.error(`❌ Build failed with code ${code}`);
        process.exit(code);
    }
    console.log('✅ Build completed successfully!');
});
