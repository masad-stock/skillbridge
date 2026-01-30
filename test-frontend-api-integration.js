const https = require('https');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test frontend API endpoint configuration
async function testFrontendAPIConfig() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'skillbridge-tau.vercel.app',
            port: 443,
            path: '/',
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        };

        const req = https.request(options, (res) => {
            let body = '';

            res.on('data', (chunk) => {
                body += chunk;
            });

            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: body
                });
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.setTimeout(30000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        req.end();
    });
}

// Test backend health from frontend perspective
async function testBackendFromFrontend() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'skillbridge-backend-t35r.onrender.com',
            port: 443,
            path: '/api/v1/health',
            method: 'GET',
            headers: {
                'Origin': 'https://skillbridge-tau.vercel.app',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
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

        req.setTimeout(30000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        req.end();
    });
}

// Test registration endpoint with CORS
async function testRegistrationWithCORS() {
    const timestamp = Date.now();
    const testEmail = `frontendtest${timestamp}@example.com`;
    
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            email: testEmail,
            password: 'TestPass123!',
            profile: {
                firstName: 'Frontend',
                lastName: 'Test'
            }
        });

        const options = {
            hostname: 'skillbridge-backend-t35r.onrender.com',
            port: 443,
            path: '/api/v1/auth/register',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length,
                'Origin': 'https://skillbridge-tau.vercel.app',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
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
                        body: response,
                        testEmail: testEmail
                    });
                } catch (e) {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: body,
                        testEmail: testEmail
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.setTimeout(60000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        req.write(data);
        req.end();
    });
}

// Test login endpoint with CORS
async function testLoginWithCORS(email, password) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            email: email,
            password: password
        });

        const options = {
            hostname: 'skillbridge-backend-t35r.onrender.com',
            port: 443,
            path: '/api/v1/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length,
                'Origin': 'https://skillbridge-tau.vercel.app',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
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

        req.setTimeout(60000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        req.write(data);
        req.end();
    });
}

// Verify JWT token structure and expiration
function verifyJWTToken(token) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return { valid: false, error: 'Invalid JWT format' };
        }

        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        const iat = payload.iat;
        const exp = payload.exp;
        const daysValid = Math.floor((exp - iat) / (60 * 60 * 24));

        return {
            valid: true,
            payload: payload,
            issuedAt: new Date(iat * 1000),
            expiresAt: new Date(exp * 1000),
            daysValid: daysValid,
            expiresImmediately: iat === exp
        };
    } catch (error) {
        return { valid: false, error: error.message };
    }
}

// Main test execution
async function runFrontendTests() {
    log('\n' + '='.repeat(70), 'cyan');
    log('  FRONTEND API INTEGRATION TESTS', 'cyan');
    log('='.repeat(70) + '\n', 'cyan');

    let passedTests = 0;
    let failedTests = 0;
    let testEmail = '';
    let testToken = '';

    // Test 1: Frontend Deployment
    log('📝 Test 1: Frontend Deployment Check', 'blue');
    try {
        const result = await testFrontendAPIConfig();
        if (result.statusCode === 200) {
            log('✅ PASS: Frontend is deployed and accessible', 'green');
            log(`   Status: ${result.statusCode}`, 'green');
            passedTests++;
        } else {
            log(`❌ FAIL: Unexpected status code: ${result.statusCode}`, 'red');
            failedTests++;
        }
    } catch (error) {
        log(`❌ FAIL: ${error.message}`, 'red');
        failedTests++;
    }

    // Test 2: Backend Health Check with CORS
    log('\n📝 Test 2: Backend Health Check (with CORS headers)', 'blue');
    try {
        const result = await testBackendFromFrontend();
        if (result.statusCode === 200 && result.body.status === 'ok') {
            log('✅ PASS: Backend is accessible from frontend origin', 'green');
            log(`   Status: ${result.statusCode}`, 'green');
            log(`   Response: ${JSON.stringify(result.body)}`, 'green');
            
            // Check CORS headers
            if (result.headers['access-control-allow-origin']) {
                log(`   CORS Header: ${result.headers['access-control-allow-origin']}`, 'green');
            }
            passedTests++;
        } else {
            log(`❌ FAIL: Backend health check failed`, 'red');
            log(`   Status: ${result.statusCode}`, 'red');
            failedTests++;
        }
    } catch (error) {
        log(`❌ FAIL: ${error.message}`, 'red');
        failedTests++;
    }

    // Test 3: Registration with CORS
    log('\n📝 Test 3: User Registration (with CORS headers)', 'blue');
    try {
        const result = await testRegistrationWithCORS();
        testEmail = result.testEmail;
        
        if (result.statusCode === 201 && result.body.success && result.body.token) {
            log('✅ PASS: Registration successful', 'green');
            log(`   Status: ${result.statusCode}`, 'green');
            log(`   Email: ${testEmail}`, 'green');
            log(`   Token received: ${result.body.token.substring(0, 20)}...`, 'green');
            
            // Verify token
            const tokenInfo = verifyJWTToken(result.body.token);
            if (tokenInfo.valid) {
                log(`   Token valid for: ${tokenInfo.daysValid} days`, 'green');
                if (tokenInfo.expiresImmediately) {
                    log(`   ⚠️  WARNING: Token expires immediately!`, 'yellow');
                } else {
                    log(`   ✅ Token expiration: OK`, 'green');
                }
            }
            
            testToken = result.body.token;
            passedTests++;
        } else {
            log(`❌ FAIL: Registration failed`, 'red');
            log(`   Status: ${result.statusCode}`, 'red');
            log(`   Response: ${JSON.stringify(result.body)}`, 'red');
            failedTests++;
        }
    } catch (error) {
        log(`❌ FAIL: ${error.message}`, 'red');
        failedTests++;
    }

    // Test 4: Login with newly created user
    if (testEmail) {
        log('\n📝 Test 4: Login with newly created user', 'blue');
        try {
            const result = await testLoginWithCORS(testEmail, 'TestPass123!');
            
            if (result.statusCode === 200 && result.body.success && result.body.token) {
                log('✅ PASS: Login successful', 'green');
                log(`   Status: ${result.statusCode}`, 'green');
                log(`   Token received: ${result.body.token.substring(0, 20)}...`, 'green');
                
                // Verify token
                const tokenInfo = verifyJWTToken(result.body.token);
                if (tokenInfo.valid) {
                    log(`   Token valid for: ${tokenInfo.daysValid} days`, 'green');
                    if (tokenInfo.expiresImmediately) {
                        log(`   ⚠️  WARNING: Token expires immediately!`, 'yellow');
                    } else {
                        log(`   ✅ Token expiration: OK`, 'green');
                    }
                }
                
                passedTests++;
            } else {
                log(`❌ FAIL: Login failed`, 'red');
                log(`   Status: ${result.statusCode}`, 'red');
                log(`   Response: ${JSON.stringify(result.body)}`, 'red');
                failedTests++;
            }
        } catch (error) {
            log(`❌ FAIL: ${error.message}`, 'red');
            failedTests++;
        }
    }

    // Test 5: Login with wrong password
    if (testEmail) {
        log('\n📝 Test 5: Login with wrong password', 'blue');
        try {
            const result = await testLoginWithCORS(testEmail, 'WrongPassword123!');
            
            if (result.statusCode === 401) {
                log('✅ PASS: Correctly rejected wrong password', 'green');
                log(`   Status: ${result.statusCode}`, 'green');
                log(`   Message: ${result.body.message}`, 'green');
                passedTests++;
            } else {
                log(`❌ FAIL: Unexpected status code`, 'red');
                log(`   Expected: 401, Got: ${result.statusCode}`, 'red');
                failedTests++;
            }
        } catch (error) {
            log(`❌ FAIL: ${error.message}`, 'red');
            failedTests++;
        }
    }

    // Test 6: Duplicate email registration
    if (testEmail) {
        log('\n📝 Test 6: Duplicate email registration', 'blue');
        try {
            const data = JSON.stringify({
                email: testEmail,
                password: 'TestPass123!',
                profile: {
                    firstName: 'Duplicate',
                    lastName: 'Test'
                }
            });

            const options = {
                hostname: 'skillbridge-backend-t35r.onrender.com',
                port: 443,
                path: '/api/v1/auth/register',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': data.length,
                    'Origin': 'https://skillbridge-tau.vercel.app'
                }
            };

            const result = await new Promise((resolve, reject) => {
                const req = https.request(options, (res) => {
                    let body = '';
                    res.on('data', (chunk) => { body += chunk; });
                    res.on('end', () => {
                        try {
                            resolve({
                                statusCode: res.statusCode,
                                body: JSON.parse(body)
                            });
                        } catch (e) {
                            resolve({ statusCode: res.statusCode, body: body });
                        }
                    });
                });
                req.on('error', reject);
                req.setTimeout(60000, () => {
                    req.destroy();
                    reject(new Error('Timeout'));
                });
                req.write(data);
                req.end();
            });

            if (result.statusCode === 400) {
                log('✅ PASS: Correctly rejected duplicate email', 'green');
                log(`   Status: ${result.statusCode}`, 'green');
                log(`   Message: ${result.body.message}`, 'green');
                passedTests++;
            } else {
                log(`❌ FAIL: Unexpected status code`, 'red');
                log(`   Expected: 400, Got: ${result.statusCode}`, 'red');
                failedTests++;
            }
        } catch (error) {
            log(`❌ FAIL: ${error.message}`, 'red');
            failedTests++;
        }
    }

    // Summary
    log('\n' + '='.repeat(70), 'cyan');
    log('  TEST SUMMARY', 'cyan');
    log('='.repeat(70), 'cyan');
    log(`\nTotal Tests: ${passedTests + failedTests}`, 'blue');
    log(`Passed: ${passedTests}`, 'green');
    log(`Failed: ${failedTests}`, failedTests > 0 ? 'red' : 'green');
    log(`Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%\n`, 
        failedTests === 0 ? 'green' : 'yellow');

    if (failedTests === 0) {
        log('✅ ALL FRONTEND API INTEGRATION TESTS PASSED!', 'green');
        log('\n📋 Next Steps:', 'blue');
        log('1. Open https://skillbridge-tau.vercel.app in your browser', 'blue');
        log('2. Test the registration flow manually', 'blue');
        log('3. Verify the success message shows correctly', 'blue');
        log('4. Test login and token persistence', 'blue');
        log('5. Use FRONTEND_TESTING_GUIDE.md for complete testing\n', 'blue');
    } else {
        log('❌ SOME TESTS FAILED - Please review the errors above\n', 'red');
    }

    log('Test credentials for manual testing:', 'cyan');
    if (testEmail) {
        log(`Email: ${testEmail}`, 'cyan');
        log(`Password: TestPass123!`, 'cyan');
    }
    log(`\nExisting test user:`, 'cyan');
    log(`Email: test1769801993674@example.com`, 'cyan');
    log(`Password: TestPass123!\n`, 'cyan');
}

// Run tests
runFrontendTests().catch(console.error);
