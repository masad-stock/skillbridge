const userService = require('../../services/userService');
const userRepository = require('../../repositories/userRepository');
const assessmentRepository = require('../../repositories/assessmentRepository');
const progressRepository = require('../../repositories/progressRepository');
const User = require('../../models/User');

describe('UserService', () => {
    let testUser;

    beforeEach(async () => {
        testUser = await User.create({
            email: 'test@test.com',
            password: 'password123',
            profile: { firstName: 'Test', lastName: 'User' }
        });
    });

    describe('getAllUsers', () => {
        it('should return paginated users', async () => {
            const result = await userService.getAllUsers({}, { page: 1, limit: 10 });

            expect(result).toHaveProperty('users');
            expect(result).toHaveProperty('pagination');
            expect(result.pagination).toHaveProperty('page', 1);
            expect(result.pagination).toHaveProperty('limit', 10);
            expect(result.pagination).toHaveProperty('total');
            expect(result.pagination).toHaveProperty('pages');
        });

        it('should filter by search term', async () => {
            const result = await userService.getAllUsers({ search: 'Test' });

            expect(result.users.length).toBeGreaterThan(0);
            expect(result.users[0].profile.firstName).toBe('Test');
        });

        it('should filter by role', async () => {
            const result = await userService.getAllUsers({ role: 'user' });

            expect(result.users.length).toBeGreaterThan(0);
            expect(result.users[0].role).toBe('user');
        });

        it('should filter by active status', async () => {
            const result = await userService.getAllUsers({ isActive: 'true' });

            expect(result.users.length).toBeGreaterThan(0);
            expect(result.users[0].isActive).toBe(true);
        });
    });

    describe('getUserById', () => {
        it('should return user with assessments and progress', async () => {
            const result = await userService.getUserById(testUser._id);

            expect(result).toHaveProperty('user');
            expect(result).toHaveProperty('assessments');
            expect(result).toHaveProperty('progress');
            expect(result.user._id.toString()).toBe(testUser._id.toString());
        });

        it('should throw error for non-existent user', async () => {
            const fakeId = new require('mongoose').Types.ObjectId();

            await expect(userService.getUserById(fakeId)).rejects.toThrow('User not found');
        });
    });

    describe('updateUser', () => {
        it('should update allowed fields', async () => {
            const updates = {
                profile: { firstName: 'Updated', lastName: 'Name' },
                role: 'instructor'
            };

            const result = await userService.updateUser(testUser._id, updates);

            expect(result.profile.firstName).toBe('Updated');
            expect(result.role).toBe('instructor');
        });

        it('should ignore non-allowed fields', async () => {
            const updates = {
                email: 'newemail@test.com',
                password: 'newpassword'
            };

            const result = await userService.updateUser(testUser._id, updates);

            expect(result.email).toBe('test@test.com');
            expect(result.password).not.toBe('newpassword');
        });

        it('should throw error for non-existent user', async () => {
            const fakeId = new require('mongoose').Types.ObjectId();

            await expect(userService.updateUser(fakeId, {})).rejects.toThrow('User not found');
        });
    });

    describe('deleteUser', () => {
        it('should delete user and related data', async () => {
            const anotherUser = await User.create({
                email: 'another@test.com',
                password: 'password123',
                profile: { firstName: 'Another', lastName: 'User' }
            });

            const result = await userService.deleteUser(testUser._id, anotherUser._id);

            expect(result.message).toBe('User deleted successfully');

            // Verify user is deleted
            const deletedUser = await User.findById(testUser._id);
            expect(deletedUser).toBeNull();
        });

        it('should prevent self-deletion', async () => {
            await expect(userService.deleteUser(testUser._id, testUser._id)).rejects.toThrow('Cannot delete your own account');
        });

        it('should throw error for non-existent user', async () => {
            const fakeId = new require('mongoose').Types.ObjectId();

            await expect(userService.deleteUser(fakeId, testUser._id)).rejects.toThrow('User not found');
        });
    });

    describe('getUserStats', () => {
        it('should return user statistics', async () => {
            const stats = await userService.getUserStats();

            expect(stats).toHaveProperty('total');
            expect(stats).toHaveProperty('active');
            expect(stats).toHaveProperty('inactive');
            expect(stats).toHaveProperty('recent');
            expect(typeof stats.total).toBe('number');
            expect(typeof stats.active).toBe('number');
            expect(typeof stats.inactive).toBe('number');
            expect(Array.isArray(stats.recent)).toBe(true);
        });
    });

    describe('getUserGrowth', () => {
        it('should return user growth data', async () => {
            const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const growth = await userService.getUserGrowth(startDate);

            expect(Array.isArray(growth)).toBe(true);
            if (growth.length > 0) {
                expect(growth[0]).toHaveProperty('_id');
                expect(growth[0]).toHaveProperty('count');
            }
        });
    });
});
