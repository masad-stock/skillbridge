const https = require('https');

// Test production backend login
const testLogin = (email, password) => {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({ email, password });

        const options = {
            hostname: 'skillbridge-backend-t35r.onrender.com',
            port: 443,
            path: '/api/v1/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = https.request(options, (res) => {
            let body = '';

            res.on('data', (chunk) => {
                body += chunk;
            });

            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: response
                    });
                } catch (e) {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: body
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(data);
        req.end();
    });
};

// Test registration
const testRegister = (email, password, firstName, lastName) => {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            email,
            password,
            profile: { firstName, lastName }
        });

        const options = {
            hostname: 'skillbridge-backend-t35r.onrender.com',
            port: 443,
            path: '/api/v1/auth/register',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = https.request(options, (res) => {
            let body = '';

            res.on('data', (chunk) => {
                body += chunk;
            });

            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: response
                    });
                } catch (e) {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: body
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(data);
        req.end();
    });
};

// Run tests
async function runTests() {
    console.log('🔍 Testing Production Backend Authentication\n');
    console.log('Backend URL: https://skillbridge-backend-t35r.onrender.com\n');
    console.log('=' .repeat(60));

    // Test 1: Login with non-existent user (should fail)
    console.log('\n📝 Test 1: Login with non-existent user');
    try {
        const result = await testLogin('nonexistent@test.com', 'password123');
        console.log(`Status: ${result.statusCode}`);
        console.log(`Response:`, JSON.stringify(result.body, null, 2));
        
        if (result.statusCode === 401) {
            console.log('✅ PASS: Correctly rejected non-existent user');
        } else {
            console.log('❌ FAIL: Unexpected status code');
        }
    } catch (error) {
        console.log('❌ ERROR:', error.message);
    }

    // Test 2: Register new user
    console.log('\n📝 Test 2: Register new user');
    const testEmail = `test${Date.now()}@example.com`;
    try {
        const result = await testRegister(testEmail, 'TestPass123!', 'Test', 'User');
        console.log(`Status: ${result.statusCode}`);
        console.log(`Response:`, JSON.stringify(result.body, null, 2));
        
        if (result.statusCode === 201 && result.body.success && result.body.token) {
            console.log('✅ PASS: User registered successfully');
            console.log(`Token received: ${result.body.token.substring(0, 20)}...`);
            
            // Test 3: Login with newly created user
            console.log('\n📝 Test 3: Login with newly created user');
            const loginResult = await testLogin(testEmail, 'TestPass123!');
            console.log(`Status: ${loginResult.statusCode}`);
            console.log(`Response:`, JSON.stringify(loginResult.body, null, 2));
            
            if (loginResult.statusCode === 200 && loginResult.body.success && loginResult.body.token) {
                console.log('✅ PASS: Login successful');
                console.log(`Token received: ${loginResult.body.token.substring(0, 20)}...`);
            } else {
                console.log('❌ FAIL: Login failed');
            }
        } else {
            console.log('❌ FAIL: Registration failed');
        }
    } catch (error) {
        console.log('❌ ERROR:', error.message);
    }

    // Test 4: Login with wrong password
    console.log('\n📝 Test 4: Login with wrong password');
    try {
        const result = await testLogin(testEmail, 'WrongPassword123!');
        console.log(`Status: ${result.statusCode}`);
        console.log(`Response:`, JSON.stringify(result.body, null, 2));
        
        if (result.statusCode === 401) {
            console.log('✅ PASS: Correctly rejected wrong password');
        } else {
            console.log('❌ FAIL: Unexpected status code');
        }
    } catch (error) {
        console.log('❌ ERROR:', error.message);
    }

    // Test 5: Register with duplicate email
    console.log('\n📝 Test 5: Register with duplicate email');
    try {
        const result = await testRegister(testEmail, 'TestPass123!', 'Test', 'User');
        console.log(`Status: ${result.statusCode}`);
        console.log(`Response:`, JSON.stringify(result.body, null, 2));
        
        if (result.statusCode === 400) {
            console.log('✅ PASS: Correctly rejected duplicate email');
        } else {
            console.log('❌ FAIL: Unexpected status code');
        }
    } catch (error) {
        console.log('❌ ERROR:', error.message);
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Production backend authentication tests completed!\n');
}

runTests().catch(console.error);
