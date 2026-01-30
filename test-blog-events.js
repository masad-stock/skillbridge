/**
 * Blog & Events Testing Script
 * Run this after starting the backend server to verify API endpoints
 * 
 * Usage: node test-blog-events.js
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api/v1';

// Colors for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(method, url, description, data = null, token = null) {
    try {
        const config = {
            method,
            url: `${API_BASE_URL}${url}`,
            headers: {}
        };

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (data) {
            config.data = data;
        }

        const response = await axios(config);
        log(`✓ ${description}`, 'green');
        return { success: true, data: response.data };
    } catch (error) {
        const status = error.response?.status || 'N/A';
        const message = error.response?.data?.message || error.message;
        log(`✗ ${description} (Status: ${status}, Error: ${message})`, 'red');
        return { success: false, error: message };
    }
}

async function runTests() {
    log('\n=== Blog & Events API Testing ===\n', 'blue');

    // Test Blog Endpoints
    log('Testing Blog Endpoints:', 'yellow');
    await testEndpoint('GET', '/blog', 'GET /blog - List all blog posts');
    await testEndpoint('GET', '/blog/test-slug', 'GET /blog/:slug - Get post by slug (should 404)');
    await testEndpoint('GET', '/blog/category/test', 'GET /blog/category/:category - Get posts by category');

    log('\nTesting Blog Admin Endpoints (will fail without auth):', 'yellow');
    await testEndpoint('POST', '/blog', 'POST /blog - Create post (should fail - no auth)', {
        title: 'Test Post',
        content: 'Test content'
    });

    // Test Event Endpoints
    log('\nTesting Event Endpoints:', 'yellow');
    await testEndpoint('GET', '/events', 'GET /events - List all events');
    await testEndpoint('GET', '/events?upcoming=true', 'GET /events?upcoming=true - List upcoming events');

    log('\nTesting Event Admin Endpoints (will fail without auth):', 'yellow');
    await testEndpoint('POST', '/events', 'POST /events - Create event (should fail - no auth)', {
        title: 'Test Event',
        description: 'Test description',
        startDate: new Date()
    });

    log('\n=== Testing Complete ===\n', 'blue');
    log('Note: Admin endpoints should fail with 401/403 without authentication', 'yellow');
    log('To test admin endpoints, login first and use the token\n', 'yellow');
}

// Run tests
runTests().catch(error => {
    log(`\nFatal error: ${error.message}`, 'red');
    process.exit(1);
});
