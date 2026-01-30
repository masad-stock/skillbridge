require('dotenv').config();
const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost:5000/api/v1';

async function testApiEndpoints() {
    console.log('🧪 Testing API Endpoints...\n');
    console.log(`Base URL: ${BASE_URL}\n`);

    const tests = [];
    let passed = 0;
    let failed = 0;

    // Helper function to test endpoint
    async function testEndpoint(name, url, expectedStatus = 200) {
        try {
            const response = await axios.get(`${BASE_URL}${url}`);
            if (response.status === expectedStatus) {
                console.log(`✅ ${name}: PASS (${response.status})`);
                if (response.data) {
                    if (Array.isArray(response.data)) {
                        console.log(`   → Returned ${response.data.length} items`);
                    } else if (response.data.data && Array.isArray(response.data.data)) {
                        console.log(`   → Returned ${response.data.data.length} items`);
                    }
                }
                passed++;
                return true;
            } else {
                console.log(`❌ ${name}: FAIL (Expected ${expectedStatus}, got ${response.status})`);
                failed++;
                return false;
            }
        } catch (error) {
            console.log(`❌ ${name}: FAIL`);
            console.log(`   → Error: ${error.message}`);
            if (error.response) {
                console.log(`   → Status: ${error.response.status}`);
            }
            failed++;
            return false;
        }
    }

    console.log('📋 Testing Instructor Endpoints...\n');
    await testEndpoint('GET /instructors', '/instructors');
    await testEndpoint('GET /instructors (with search)', '/instructors?search=Sarah');
    await testEndpoint('GET /instructors (with filter)', '/instructors?expertise=Web Development');

    console.log('\n📝 Testing Blog Endpoints...\n');
    await testEndpoint('GET /blog', '/blog');
    await testEndpoint('GET /blog (with search)', '/blog?search=Digital');
    await testEndpoint('GET /blog (with category)', '/blog?category=Digital Literacy');

    console.log('\n📅 Testing Event Endpoints...\n');
    await testEndpoint('GET /events', '/events');
    await testEndpoint('GET /events (with status)', '/events?status=upcoming');
    await testEndpoint('GET /events (with category)', '/events?category=Workshop');

    console.log('\n' + '='.repeat(60));
    console.log('TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total: ${passed + failed}`);
    console.log('='.repeat(60));

    if (failed === 0) {
        console.log('\n🎉 All API endpoints are working correctly!');
        console.log('\nNext steps:');
        console.log('1. Start the frontend: cd learner-pwa && npm start');
        console.log('2. Test pages in browser:');
        console.log('   - http://localhost:3000/instructors');
        console.log('   - http://localhost:3000/blog');
        console.log('   - http://localhost:3000/events');
    } else {
        console.log('\n⚠️  Some tests failed. Please check:');
        console.log('1. Is the backend server running?');
        console.log('2. Is MongoDB connected?');
        console.log('3. Has the database been seeded?');
        process.exit(1);
    }
}

// Check if server is running first
async function checkServer() {
    try {
        await axios.get(BASE_URL.replace('/api/v1', '/health') || 'http://localhost:5000/health');
        return true;
    } catch (error) {
        console.log('❌ Backend server is not running!');
        console.log('\nPlease start the backend server:');
        console.log('  cd learner-pwa/backend');
        console.log('  npm start');
        console.log('\nThen run this test again.');
        return false;
    }
}

// Run tests
(async () => {
    const serverRunning = await checkServer();
    if (serverRunning) {
        await testApiEndpoints();
    } else {
        process.exit(1);
    }
})();
