const certificateService = require('../../services/certificateService');
const Certificate = require('../../models/Certificate');
const User = require('../../models/User');
const Module = require('../../models/Module');
const Progress = require('../../models/Progress');

describe('CertificateService', () => {
    let user, module, progress;

    beforeEach(async () => {
        // Create test user
        user = await User.create({
            email: 'test@test.com',
            password: 'password123',
            profile: { firstName: 'Test', lastName: 'User' }
        });

        // Create test module
        module = await Module.create({
            moduleId: 'MOD-TEST',
            title: 'Test Module',
            description: 'Test Description',
            category: 'Testing',
            difficulty: 1,
            estimatedTime: 5
        });

        // Create completed progress
        progress = await Progress.create({
            user: user._id,
            module: module._id,
            status: 'completed',
            score: 85,
            completedAt: new Date()
        });
    });

    describe('generateCertificate', () => {
        it('should generate certificate for completed module', async () => {
            const result = await certificateService.generateCertificate(user._id, module._id);

            expect(result.success).toBe(true);
            expect(result.certificate).toBeDefined();
            expect(result.certificate.user._id.toString()).toBe(user._id.toString());
            expect(result.certificate.module._id.toString()).toBe(module._id.toString());
            expect(result.certificate.score).toBe(85);
        });

        it('should not generate duplicate certificate', async () => {
            await certificateService.generateCertificate(user._id, module._id);
            const result = await certificateService.generateCertificate(user._id, module._id);

            expect(result.success).toBe(false);
            expect(result.message).toContain('already issued');
        });

        it('should fail if module not completed', async () => {
            const newModule = await Module.create({
                moduleId: 'MOD-INCOMPLETE',
                title: 'Incomplete Module',
                description: 'Test',
                category: 'Testing',
                difficulty: 1,
                estimatedTime: 10
            });

            await expect(
                certificateService.generateCertificate(user._id, newModule._id)
            ).rejects.toThrow('Module not completed');
        });
    });

    describe('getUserCertificates', () => {
        it('should return user certificates', async () => {
            await certificateService.generateCertificate(user._id, module._id);
            const result = await certificateService.getUserCertificates(user._id);

            expect(result.success).toBe(true);
            expect(result.certificates).toHaveLength(1);
            expect(result.certificates[0].user.toString()).toBe(user._id.toString());
        });

        it('should return empty array for user with no certificates', async () => {
            const newUser = await User.create({
                email: 'new@test.com',
                password: 'password123',
                profile: { firstName: 'New', lastName: 'User' }
            });

            const result = await certificateService.getUserCertificates(newUser._id);

            expect(result.success).toBe(true);
            expect(result.certificates).toHaveLength(0);
        });
    });

    describe('verifyCertificate', () => {
        it('should verify valid certificate', async () => {
            const { certificate } = await certificateService.generateCertificate(user._id, module._id);
            const result = await certificateService.verifyCertificate(certificate.verificationCode);

            expect(result.success).toBe(true);
            expect(result.certificate).toBeDefined();
        });

        it('should fail for invalid verification code', async () => {
            const result = await certificateService.verifyCertificate('INVALID_CODE');

            expect(result.success).toBe(false);
            expect(result.message).toContain('not found');
        });
    });
});
