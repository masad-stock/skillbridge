#!/usr/bin/env node

/**
 * Deployment Configuration Checker
 * 
 * This script checks your deployment configuration and identifies issues
 * Run with: node check-deployment-config.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Deployment Configuration...\n');

// Colors for terminal output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function success(msg) {
    console.log(`${colors.green}✅ ${msg}${colors.reset}`);
}

function error(msg) {
    console.log(`${colors.red}❌ ${msg}${colors.reset}`);
}

function warning(msg) {
    console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`);
}

function info(msg) {
    console.log(`${colors.cyan}ℹ️  ${msg}${colors.reset}`);
}

function section(msg) {
    console.log(`\n${colors.blue}━━━ ${msg} ━━━${colors.reset}\n`);
}

let issuesFound = 0;

// Check 1: Backend .env file
section('Backend Environment Configuration');

const backendEnvPath = path.join(__dirname, 'learner-pwa', 'backend', '.env');
const backendEnvExamplePath = path.join(__dirname, 'learner-pwa', 'backend', '.env.example');

if (fs.existsSync(backendEnvPath)) {
    success('Backend .env file exists');

    const envContent = fs.readFileSync(backendEnvPath, 'utf8');
    const requiredVars = [
        'MONGODB_URI',
        'JWT_SECRET',
        'GROQ_API_KEY',
        'FRONTEND_URL'
    ];

    requiredVars.forEach(varName => {
        const regex = new RegExp(`^${varName}=.+`, 'm');
        if (regex.test(envContent)) {
            const value = envContent.match(regex)[0].split('=')[1];
            if (value && value.trim() && !value.includes('your-') && !value.includes('change-this')) {
                success(`${varName} is set`);
            } else {
                error(`${varName} is set but appears to be a placeholder value`);
                issuesFound++;
            }
        } else {
            error(`${varName} is NOT set in backend .env`);
            issuesFound++;
        }
    });

    // Check for localhost in FRONTEND_URL
    if (/FRONTEND_URL=.*localhost/m.test(envContent)) {
        warning('FRONTEND_URL contains "localhost" - this should be your Vercel URL in production');
        issuesFound++;
    }
} else {
    error('Backend .env file NOT found');
    if (fs.existsSync(backendEnvExamplePath)) {
        info('Copy .env.example to .env and fill in the values');
    }
    issuesFound++;
}

// Check 2: Frontend .env file
section('Frontend Environment Configuration');

const frontendEnvPath = path.join(__dirname, 'learner-pwa', '.env');
const frontendEnvExamplePath = path.join(__dirname, 'learner-pwa', '.env.example');

if (fs.existsSync(frontendEnvPath)) {
    success('Frontend .env file exists');

    const envContent = fs.readFileSync(frontendEnvPath, 'utf8');

    if (/REACT_APP_API_URL=.+/m.test(envContent)) {
        const apiUrl = envContent.match(/REACT_APP_API_URL=(.+)/m)[1];
        success(`REACT_APP_API_URL is set: ${apiUrl}`);

        if (apiUrl.includes('localhost')) {
            warning('REACT_APP_API_URL points to localhost - this will NOT work in production!');
            info('For production, set this to your Render backend URL in Vercel environment variables');
            issuesFound++;
        }
    } else {
        error('REACT_APP_API_URL is NOT set in frontend .env');
        issuesFound++;
    }
} else {
    warning('Frontend .env file NOT found (this is OK if using Vercel environment variables)');
    info('Make sure REACT_APP_API_URL is set in Vercel dashboard');
}

// Check 3: API service configuration
section('Frontend API Configuration');

const apiServicePath = path.join(__dirname, 'learner-pwa', 'src', 'services', 'api.js');

if (fs.existsSync(apiServicePath)) {
    success('API service file exists');

    const apiContent = fs.readFileSync(apiServicePath, 'utf8');

    if (/const API_BASE_URL = process\.env\.REACT_APP_API_URL/.test(apiContent)) {
        success('API service uses REACT_APP_API_URL environment variable');
    } else {
        error('API service does NOT use environment variable');
        issuesFound++;
    }

    if (/localhost:5001/.test(apiContent)) {
        warning('API service has hardcoded localhost:5001 as fallback');
        info('This is OK for development, but ensure REACT_APP_API_URL is set in production');
    }
} else {
    error('API service file NOT found');
    issuesFound++;
}

// Check 4: Backend server configuration
section('Backend Server Configuration');

const serverPath = path.join(__dirname, 'learner-pwa', 'backend', 'server.js');

if (fs.existsSync(serverPath)) {
    success('Backend server file exists');

    const serverContent = fs.readFileSync(serverPath, 'utf8');

    if (/require\('dotenv'\)\.config\(\)/.test(serverContent)) {
        success('Server loads environment variables with dotenv');
    } else {
        error('Server does NOT load dotenv');
        issuesFound++;
    }

    if (/process\.env\.MONGODB_URI/.test(serverContent)) {
        success('Server uses MONGODB_URI environment variable');
    } else {
        error('Server does NOT use MONGODB_URI');
        issuesFound++;
    }

    if (/cors/.test(serverContent)) {
        success('Server has CORS configured');
    } else {
        error('Server does NOT have CORS configured');
        issuesFound++;
    }
} else {
    error('Backend server file NOT found');
    issuesFound++;
}

// Check 5: Chatbot configuration
section('Chatbot Configuration');

const chatbotRoutesPath = path.join(__dirname, 'learner-pwa', 'backend', 'routes', 'chatbot.js');

if (fs.existsSync(chatbotRoutesPath)) {
    success('Chatbot routes file exists');

    const chatbotContent = fs.readFileSync(chatbotRoutesPath, 'utf8');

    if (/process\.env\.GROQ_API_KEY/.test(chatbotContent)) {
        success('Chatbot uses GROQ_API_KEY environment variable');
    } else {
        error('Chatbot does NOT use GROQ_API_KEY');
        issuesFound++;
    }

    if (/\/health/.test(chatbotContent)) {
        success('Chatbot has health check endpoint');
    } else {
        warning('Chatbot does NOT have health check endpoint');
    }
} else {
    error('Chatbot routes file NOT found');
    issuesFound++;
}

// Check 6: Package.json scripts
section('Build Scripts');

const packageJsonPath = path.join(__dirname, 'learner-pwa', 'package.json');

if (fs.existsSync(packageJsonPath)) {
    success('Frontend package.json exists');

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    if (packageJson.scripts && packageJson.scripts.build) {
        success('Build script exists');
    } else {
        error('Build script NOT found');
        issuesFound++;
    }

    if (packageJson.scripts && packageJson.scripts.start) {
        success('Start script exists');
    } else {
        warning('Start script NOT found');
    }
} else {
    error('Frontend package.json NOT found');
    issuesFound++;
}

const backendPackageJsonPath = path.join(__dirname, 'learner-pwa', 'backend', 'package.json');

if (fs.existsSync(backendPackageJsonPath)) {
    success('Backend package.json exists');

    const packageJson = JSON.parse(fs.readFileSync(backendPackageJsonPath, 'utf8'));

    if (packageJson.scripts && packageJson.scripts.start) {
        success('Backend start script exists');
    } else {
        error('Backend start script NOT found');
        issuesFound++;
    }
} else {
    error('Backend package.json NOT found');
    issuesFound++;
}

// Summary
section('Summary');

if (issuesFound === 0) {
    success('No issues found! Your configuration looks good.');
    info('Make sure to set environment variables in Vercel and Render dashboards');
} else {
    error(`Found ${issuesFound} issue(s) that need to be fixed`);
    console.log('\n📖 Next Steps:\n');
    console.log('1. Fix the issues listed above');
    console.log('2. Follow the DEPLOYMENT_FIX_GUIDE.md for step-by-step instructions');
    console.log('3. Deploy backend to Render');
    console.log('4. Set REACT_APP_API_URL in Vercel');
    console.log('5. Redeploy frontend\n');
}

// Production deployment checklist
section('Production Deployment Checklist');

console.log('Before deploying to production, ensure:\n');
console.log('Backend (Render):');
console.log('  [ ] MONGODB_URI is set');
console.log('  [ ] JWT_SECRET is set (minimum 32 characters)');
console.log('  [ ] GROQ_API_KEY is set');
console.log('  [ ] FRONTEND_URL is set to your Vercel URL');
console.log('  [ ] NODE_ENV=production');
console.log('  [ ] PORT=5000 (or let Render set it)');
console.log('');
console.log('Frontend (Vercel):');
console.log('  [ ] REACT_APP_API_URL is set to your Render backend URL');
console.log('  [ ] Environment variable is set for Production, Preview, and Development');
console.log('  [ ] Redeploy without cache after setting environment variable');
console.log('');
console.log('MongoDB Atlas:');
console.log('  [ ] IP whitelist includes 0.0.0.0/0 (allow from anywhere)');
console.log('  [ ] Database user has read/write permissions');
console.log('  [ ] Connection string is correct');
console.log('');
console.log('Verification:');
console.log('  [ ] Backend health endpoint returns 200 OK');
console.log('  [ ] Chatbot health shows "configured": true');
console.log('  [ ] Can register new user');
console.log('  [ ] Can login');
console.log('  [ ] Chatbot responds');
console.log('  [ ] No console errors');
console.log('');

process.exit(issuesFound > 0 ? 1 : 0);
