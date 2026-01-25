const User = require('../../models/User');

describe('User Model', () => {
    describe('Password Hashing', () => {
        it('should hash password before saving', async () => {
            const user = await User.create({
                email: 'test@test.com',
                password: 'plainPassword123',
                profile: { firstName: 'Test', lastName: 'User' }
            });

            expect(user.password).not.toBe('plainPassword123');
            expect(user.password).toMatch(/^\$2[aby]\$/); // bcrypt hash pattern
        });

        it('should not rehash password if not modified', async () => {
            const user = await User.create({
                email: 'test@test.com',
                password: 'password123',
                profile: { firstName: 'Test', lastName: 'User' }
            });

            const originalHash = user.password;
            user.profile.firstName = 'Updated';
            await user.save();

            expect(user.password).toBe(originalHash);
        });
    });

    describe('Password Comparison', () => {
        it('should correctly compare passwords', async () => {
            const user = await User.create({
                email: 'test@test.com',
                password: 'password123',
                profile: { firstName: 'Test', lastName: 'User' }
            });

            const isMatch = await user.comparePassword('password123');
            expect(isMatch).toBe(true);

            const isNotMatch = await user.comparePassword('wrongpassword');
            expect(isNotMatch).toBe(false);
        });
    });

    describe('Reset Token Generation', () => {
        it('should generate reset token', () => {
            const user = new User({
                email: 'test@test.com',
                password: 'password123',
                profile: { firstName: 'Test', lastName: 'User' }
            });

            const token = user.generateResetToken();

            expect(token).toBeDefined();
            expect(token).toHaveLength(64); // 32 bytes = 64 hex characters
            expect(user.resetPasswordToken).toBeDefined();
            expect(user.resetPasswordExpire).toBeDefined();
            expect(user.resetPasswordExpire.getTime()).toBeGreaterThan(Date.now());
        });
    });

    describe('Validation', () => {
        it('should require email', async () => {
            const user = new User({
                password: 'password123',
                profile: { firstName: 'Test', lastName: 'User' }
            });

            await expect(user.save()).rejects.toThrow();
        });

        it('should require valid email format', async () => {
            const user = new User({
                email: 'invalid-email',
                password: 'password123',
                profile: { firstName: 'Test', lastName: 'User' }
            });

            await expect(user.save()).rejects.toThrow();
        });

        it('should require password', async () => {
            const user = new User({
                email: 'test@test.com',
                profile: { firstName: 'Test', lastName: 'User' }
            });

            await expect(user.save()).rejects.toThrow();
        });
    });
});
