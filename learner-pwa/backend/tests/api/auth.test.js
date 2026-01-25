const request = require('supertest');
const { app } = require('../../server');
const User = require('../../models/User');

describe('Auth API', () => {
    describe('POST /api/v1/auth/register', () => {
        it('should register a new user', async () => {
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    email: 'newuser@test.com',
                    password: 'password123',
                    profile: {
                        firstName: 'New',
                        lastName: 'User'
                    }
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.token).toBeDefined();
            expect(response.body.user.email).toBe('newuser@test.com');
        });

        it('should not register user with existing email', async () => {
            await User.create({
                email: 'existing@test.com',
                password: 'password123',
                profile: { firstName: 'Existing', lastName: 'User' }
            });

            const response = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    email: 'existing@test.com',
                    password: 'password123',
                    profile: { firstName: 'New', lastName: 'User' }
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /api/v1/auth/login', () => {
        beforeEach(async () => {
            await User.create({
                email: 'test@test.com',
                password: 'password123',
                profile: { firstName: 'Test', lastName: 'User' }
            });
        });

        it('should login with correct credentials', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'test@test.com',
                    password: 'password123'
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.token).toBeDefined();
        });

        it('should not login with incorrect password', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'test@test.com',
                    password: 'wrongpassword'
                });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it('should not login with non-existent email', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'nonexistent@test.com',
                    password: 'password123'
                });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });
});
