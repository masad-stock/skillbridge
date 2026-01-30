const https = require('https');

console.log('🔍 Diagnosing Production Registration Issue\n');
console.log('Backend URL: https://skillbridge-backend-t35r.onrender.com\n');
console.log('=' .repeat(60));

// Test 1: Health Check
console.log('\n📝 Test 1: Health Check');
https.get('https://skillbridge-backend-t35r.onrender.com/health', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Response: ${data}`);
        if (res.statusCode === 200) {
            console.log('✅ Backend is running');
        } else {
            console.log('❌ Backend health check failed');
        }
        
        // Test 2: Check CORS headers
        console.log('\n📝 Test 2: Check CORS Headers');
        const options = {
            hostname: 'skillbridge-backend-t35r.onrender.com',
            port: 443,
            path: '/api/v1/auth/login',
            method: 'OPTIONS',
            headers: {
                'Origin': 'https://skillbridge-tau.vercel.app',
                'Access-Control-Request-Method': 'POST'
            }
        };
        
        const req = https.request(options, (res) => {
            console.log(`Status: ${res.statusCode}`);
            console.log('CORS Headers:');
            console.log(`  Access-Control-Allow-Origin: ${res.headers['access-control-allow-origin'] || 'MISSING'}`);
            console.log(`  Access-Control-Allow-Methods: ${res.headers['access-control-allow-methods'] || 'MISSING'}`);
            console.log(`  Access-Control-Allow-Headers: ${res.headers['access-control-allow-headers'] || 'MISSING'}`);
            
            if (res.headers['access-control-allow-origin']) {
                console.log('✅ CORS configured');
            } else {
                console.log('❌ CORS not configured properly');
            }
            
            // Test 3: Attempt registration with detailed error
            console.log('\n📝 Test 3: Attempt Registration (to see detailed error)');
            const testEmail = `diagnostic${Date.now()}@test.com`;
            const postData = JSON.stringify({
                email: testEmail,
                password: 'TestPass123!',
                profile: {
                    firstName: 'Diagnostic',
                    lastName: 'Test'
                }
            });
            
            const regOptions = {
                hostname: 'skillbridge-backend-t35r.onrender.com',
                port: 443,
                path: '/api/v1/auth/register',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': postData.length
                }
            };
            
            const regReq = https.request(regOptions, (res) => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => {
                    console.log(`Status: ${res.statusCode}`);
                    try {
                        const response = JSON.parse(body);
                        console.log('Response:', JSON.stringify(response, null, 2));
                        
                        if (res.statusCode === 500) {
                            console.log('\n🔴 DIAGNOSIS:');
                            console.log('Registration is failing with 500 error.');
                            console.log('\nMost likely causes:');
                            console.log('1. JWT_SECRET not set or too short (must be 32+ characters)');
                            console.log('2. MONGODB_URI incorrect or database unreachable');
                            console.log('3. MongoDB Atlas IP not whitelisted');
                            console.log('\n📋 ACTION REQUIRED:');
                            console.log('1. Go to Render Dashboard: https://dashboard.render.com');
                            console.log('2. Select your backend service');
                            console.log('3. Go to Environment tab');
                            console.log('4. Verify these variables are set:');
                            console.log('   - JWT_SECRET (minimum 32 characters)');
                            console.log('   - MONGODB_URI (correct connection string)');
                            console.log('   - JWT_EXPIRE=30d');
                            console.log('5. Check Render logs for the exact error message');
                            console.log('6. Verify MongoDB Atlas Network Access allows 0.0.0.0/0');
                        } else if (res.statusCode === 201) {
                            console.log('✅ Registration working! Issue may have been resolved.');
                        }
                    } catch (e) {
                        console.log('Raw response:', body);
                    }
                    
                    console.log('\n' + '='.repeat(60));
                    console.log('\n📊 Summary:');
                    console.log('To view detailed error logs:');
                    console.log('1. Go to: https://dashboard.render.com');
                    console.log('2. Select your backend service');
                    console.log('3. Click "Logs" tab');
                    console.log('4. Look for errors around the time of this test');
                    console.log('\nFor step-by-step fix instructions, see:');
                    console.log('ENVIRONMENT_SETUP_CHECKLIST.md');
                });
            });
            
            regReq.on('error', (error) => {
                console.error('❌ Request failed:', error.message);
            });
            
            regReq.write(postData);
            regReq.end();
        });
        
        req.on('error', (error) => {
            console.error('❌ CORS check failed:', error.message);
        });
        
        req.end();
    });
}).on('error', (error) => {
    console.error('❌ Health check failed:', error.message);
    console.log('\n🔴 Backend may be down or unreachable');
});
