const userRepository = require('../repositories/userRepository');
const assessmentRepository = require('../repositories/assessmentRepository');
const progressRepository = require('../repositories/progressRepository');
const bcrypt = require('bcryptjs');

/**
 * User Service
 * Business logic for user operations
 */
class UserService {
    /**
     * Create user by admin
     * @param {Object} userData - User data including email, password, profile, role
     * @returns {Promise<Object>} Created user
     */
    async createUserByAdmin(userData) {
        const { email, password, profile, role = 'user' } = userData;

        // Validate required fields
        if (!email || !password || !profile?.firstName || !profile?.lastName) {
            throw new Error('Email, password, first name, and last name are required');
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Invalid email format');
        }

        // Check if user already exists
        const existingUser = await userRepository.findByEmail(email);
        if (existingUser) {
            throw new Error('Email address is already registered');
        }

        // Validate password strength
        this.validatePassword(password);

        // Validate role
        const validRoles = ['user', 'instructor', 'admin'];
        if (!validRoles.includes(role)) {
            throw new Error('Invalid role specified');
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const User = require('../models/User');
        const user = await User.create({
            email,
            password: hashedPassword,
            profile: {
                firstName: profile.firstName,
                lastName: profile.lastName,
                phoneNumber: profile.phoneNumber || ''
            },
            role,
            isVerified: true, // Admin-created users are auto-verified
            isActive: true
        });

        // Remove password from response
        const userObject = user.toObject();
        delete userObject.password;

        return userObject;
    }

    /**
     * Validate password strength
     * @param {string} password - Password to validate
     * @throws {Error} If password doesn't meet requirements
     */
    validatePassword(password) {
        const minLength = parseInt(process.env.MIN_PASSWORD_LENGTH) || 8;
        const requireComplexity = process.env.REQUIRE_PASSWORD_COMPLEXITY !== 'false';

        if (password.length < minLength) {
            throw new Error(`Password must be at least ${minLength} characters long`);
        }

        if (requireComplexity) {
            if (!/[A-Z]/.test(password)) {
                throw new Error('Password must contain at least one uppercase letter');
            }
            if (!/[a-z]/.test(password)) {
                throw new Error('Password must contain at least one lowercase letter');
            }
            if (!/\d/.test(password)) {
                throw new Error('Password must contain at least one number');
            }
            if (!/[^a-zA-Z\d]/.test(password)) {
                throw new Error('Password must contain at least one special character');
            }
        }
    }
    async getAllUsers(filters = {}, pagination = {}) {
        const { search, role, isActive } = filters;
        const { page = 1, limit = 10 } = pagination;

        const query = {};

        // Build search query
        if (search) {
            query.$or = [
                { 'profile.firstName': { $regex: search, $options: 'i' } },
                { 'profile.lastName': { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        if (role) {
            query.role = role;
        }

        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        const { users, total } = await userRepository.findAll(query, { page, limit });

        return {
            users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    async getUserById(userId) {
        const user = await userRepository.findWithPopulate(userId, [
            'learningProgress.enrolledModules',
            'learningProgress.completedModules'
        ]);

        if (!user) {
            throw new Error('User not found');
        }

        // Get user's assessments and progress
        const assessments = await assessmentRepository.findByUser(userId, 5);
        const progress = await progressRepository.findByUser(userId, 'module');

        return { user, assessments, progress };
    }

    async updateUser(userId, updates) {
        const allowedUpdates = ['profile', 'role', 'isActive', 'isVerified'];
        const filteredUpdates = {};

        Object.keys(updates).forEach(key => {
            if (allowedUpdates.includes(key)) {
                filteredUpdates[key] = updates[key];
            }
        });

        const user = await userRepository.update(userId, filteredUpdates);

        if (!user) {
            throw new Error('User not found');
        }

        return user;
    }

    async deleteUser(userId, currentUserId) {
        const user = await userRepository.findById(userId);

        if (!user) {
            throw new Error('User not found');
        }

        // Prevent self-deletion
        if (user._id.toString() === currentUserId) {
            throw new Error('Cannot delete your own account');
        }

        // Check if this is the last admin - prevent deletion
        if (user.role === 'admin') {
            const User = require('../models/User');
            const adminCount = await User.countDocuments({ role: 'admin', isActive: true });

            if (adminCount <= 1) {
                throw new Error('Cannot delete the last administrator account. At least one admin must exist.');
            }
        }

        // Delete related data (assessments, progress, certificates)
        const Certificate = require('../models/Certificate');

        await Promise.all([
            assessmentRepository.deleteMany({ user: userId }),
            progressRepository.deleteMany({ user: userId }),
            Certificate.deleteMany({ user: userId })
        ]);

        await userRepository.delete(userId);

        return {
            message: 'User and all associated data deleted successfully',
            deletedData: ['assessments', 'progress', 'certificates']
        };
    }

    async getUserStats() {
        const totalUsers = await userRepository.count();
        const activeUsers = await userRepository.findActiveUsers(30);
        const recentUsers = await userRepository.getRecentUsers(5);

        return {
            total: totalUsers,
            active: activeUsers,
            inactive: totalUsers - activeUsers,
            recent: recentUsers
        };
    }

    async getUserGrowth(startDate) {
        const User = require('../models/User');

        return await User.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);
    }
}

module.exports = new UserService();
