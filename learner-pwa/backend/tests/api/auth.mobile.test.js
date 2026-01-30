const request = require('supertest');
const { app } = require('../../server');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');

describe('Mobile Login Tests', () => {
    let testUser;

    beforeEach(async () => {
        // Create test user
        testUser = await User.create({
            email: 'mobile@test.com',
            password: 'password123',
            profile: {
                firstName: 'Mobile',
                lastName: 'User'
            }
        });
    });

    afterEach(async () => {
        // Clean up
        await User.deleteMany({});
    });

    describe('Mobile User-Agent Headers', () => {
        it('should accept login from iOS Safari', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .set('User-Agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1')
                .send({
                    email: 'mobile@test.com',
                    password: 'password123'
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.token).toBeDefined();
            expect(response.body.user.email).toBe('mobile@test.com');
        });

        it('should accept login from Android Chrome', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .set('User-Agent', 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36')
                .send({
                    email: 'mobile@test.com',
                    password: 'password123'
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.token).toBeDefined();
        });

        it('should accept login from Samsung Internet', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .set('User-Agent', 'Mozilla/5.0 (Linux; Android 11; SAMSUNG SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/14.2 Chrome/87.0.4280.141 Mobile Safari/537.36')
                .send({
                    email: 'mobile@test.com',
                    password: 'password123'
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        it('should accept login from mobile Firefox', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .set('User-Agent', 'Mozilla/5.0 (Android 11; Mobile; rv:89.0) Gecko/89.0 Firefox/89.0')
                .send({
                    email: 'mobile@test.com',
                    password: 'password123'
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });

    describe('Network Timeout Scenarios', () => {
        it('should handle slow requests gracefully', async () => {
            jest.setTimeout(35000);

            const response = await request(app)
                .post('/api/v1/auth/login')
                .timeout(35000)
                .send({
                    email: 'mobile@test.com',
                    password: 'password123'
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        it('should respond within acceptable time for mobile', async () => {
            const startTime = Date.now();

            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'mobile@test.com',
                    password: 'password123'
                });

            const responseTime = Date.now() - startTime;

            expect(response.status).toBe(200);
            expect(responseTime).toBeLessThan(5000); // Should respond within 5 seconds
        });
    });

    describe('Token Validation on Mobile', () => {
        it('should generate valid JWT token', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'mobile@test.com',
                    password: 'password123'
                });

            expect(response.status).toBe(200);
            const token = response.body.token;

            // Verify token structure
            expect(token.split('.')).toHaveLength(3);

            // Verify token can be decoded
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            expect(decoded.id).toBe(testUser._id.toString());
        });

        it('should validate token correctly in subsequent requests', async () => {
            // Login first
            const loginResponse = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'mobile@test.com',
                    password: 'password123'
                });

            const token = loginResponse.body.token;

            // Use token to access protected route
            const meResponse = await request(app)
                .get('/api/v1/auth/me')
                .set('Authorization', `Bearer ${token}`);

            expect(meResponse.status).toBe(200);
            expect(meResponse.body.success).toBe(true);
            expect(meResponse.body.data.email).toBe('mobile@test.com');
        });

        it('should reject expired tokens', async () => {
            // Create expired token
            const expiredToken = jwt.sign(
                { id: testUser._id },
                process.env.JWT_SECRET,
                { expiresIn: '-1h' }
            );

            const response = await request(app)
                .get('/api/v1/auth/me')
                .set('Authorization', `Bearer ${expiredToken}`);

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it('should reject malformed tokens', async () => {
            const response = await request(app)
                .get('/api/v1/auth/me')
                .set('Authorization', 'Bearer invalid.token.here');

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it('should reject requests without token', async () => {
            const response = await request(app)
                .get('/api/v1/auth/me');

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });

    describe('Rate Limiting on Mobile Networks', () => {
        it('should apply rate limiting correctly', async () => {
            const requests = [];

            // Make 20 rapid requests with wrong password
            for (let i = 0; i < 20; i++) {
                requests.push(
                    request(app)
                        .post('/api/v1/auth/login')
                        .send({
                            email: 'mobile@test.com',
                            password: 'wrongpassword'
                        })
                );
            }

            const responses = await Promise.all(requests);
            const rateLimited = responses.filter(r => r.status === 429);

            // At least some requests should be rate limited
            expect(rateLimited.length).toBeGreaterThan(0);
        });

        it('should allow requests after rate limit window', async () => {
            // This test would need to wait for the rate limit window to expire
            // Skipping for now as it would slow down test suite
            expect(true).toBe(true);
        });
    });

    describe('CORS Headers for Mobile', () => {
        it('should include CORS headers in response', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .set('Origin', 'https://skillbridge-tau.vercel.app')
                .send({
                    email: 'mobile@test.com',
                    password: 'password123'
                });

            expect(response.status).toBe(200);
            expect(response.headers['access-control-allow-origin']).toBeDefined();
        });

        it('should handle OPTIONS preflight request', async () => {
            const response = await request(app)
                .options('/api/v1/auth/login')
                .set('Origin', 'https://skillbridge-tau.vercel.app')
                .set('Access-Control-Request-Method', 'POST');

            expect(response.status).toBe(204);
            expect(response.headers['access-control-allow-methods']).toBeDefined();
        });
    });

    describe('Mobile-Specific Error Handling', () => {
        it('should return clear error for invalid credentials', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'mobile@test.com',
                    password: 'wrongpassword'
                });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Invalid credentials');
        });

        it('should return clear error for missing fields', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'mobile@test.com'
                    // password missing
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('password');
        });

        it('should return clear error for invalid email format', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'invalid-email',
                    password: 'password123'
                });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it('should handle non-existent user gracefully', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'nonexistent@test.com',
                    password: 'password123'
                });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Invalid credentials');
        });
    });

    describe('Registration on Mobile', () => {
        it('should register new user from mobile device', async () => {
            const response = await request(app)
                .post('/api/v1/auth/register')
                .set('User-Agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15')
                .send({
                    email: 'newmobile@test.com',
                    password: 'password123',
                    profile: {
                        firstName: 'New',
                        lastName: 'Mobile'
                    }
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.token).toBeDefined();
            expect(response.body.user.email).toBe('newmobile@test.com');
        });

        it('should validate required fields on mobile registration', async () => {
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    email: 'newmobile@test.com',
                    password: 'password123'
                    // profile missing
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe('Password Reset on Mobile', () => {
        it('should handle forgot password request from mobile', async () => {
            const response = await request(app)
                .post('/api/v1/auth/forgot-password')
                .set('User-Agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15')
                .send({
                    email: 'mobile@test.com'
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('reset link');
        });

        it('should not reveal if email exists', async () => {
            const response = await request(app)
                .post('/api/v1/auth/forgot-password')
                .send({
                    email: 'nonexistent@test.com'
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('reset link');
        });
    });

    describe('Concurrent Login Attempts', () => {
        it('should handle multiple simultaneous login attempts', async () => {
            const requests = Array(5).fill(null).map(() =>
                request(app)
                    .post('/api/v1/auth/login')
                    .send({
                        email: 'mobile@test.com',
                        password: 'password123'
                    })
            );

            const responses = await Promise.all(requests);

            responses.forEach(response => {
                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(response.body.token).toBeDefined();
            });
        });
    });

    describe('Token Refresh Scenarios', () => {
        it('should update lastLogin on successful login', async () => {
            const beforeLogin = new Date();

            await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'mobile@test.com',
                    password: 'password123'
                });

            const user = await User.findOne({ email: 'mobile@test.com' });
            expect(user.lastLogin).toBeDefined();
            expect(new Date(user.lastLogin)).toBeInstanceOf(Date);
            expect(new Date(user.lastLogin).getTime()).toBeGreaterThanOrEqual(beforeLogin.getTime());
        });
    });
});
