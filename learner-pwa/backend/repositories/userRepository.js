const User = require('../models/User');

/**
 * User Repository
 * Handles all database operations for User model
 */
class UserRepository {
    async findAll(query = {}, options = {}) {
        const { page = 1, limit = 10, sort = { createdAt: -1 }, select = '-password' } = options;

        const users = await User.find(query)
            .select(select)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await User.countDocuments(query);

        return { users, total };
    }

    async findById(id, select = '-password') {
        return await User.findById(id).select(select);
    }

    async findOne(query, select = '-password') {
        return await User.findOne(query).select(select);
    }

    async create(userData) {
        return await User.create(userData);
    }

    async update(id, updates) {
        return await User.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true
        }).select('-password');
    }

    async delete(id) {
        return await User.findByIdAndDelete(id);
    }

    async count(query = {}) {
        return await User.countDocuments(query);
    }

    async findWithPopulate(id, populateFields) {
        return await User.findById(id)
            .select('-password')
            .populate(populateFields);
    }

    async updatePassword(id, hashedPassword) {
        return await User.findByIdAndUpdate(id, { password: hashedPassword });
    }

    async findByEmail(email) {
        return await User.findOne({ email });
    }

    async findActiveUsers(daysAgo = 30) {
        const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
        return await User.countDocuments({
            isActive: true,
            lastLogin: { $gte: date }
        });
    }

    async getRecentUsers(limit = 5) {
        return await User.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .select('profile email createdAt');
    }
}

module.exports = new UserRepository();
