const userService = require('../services/userService');
const moduleService = require('../services/moduleService');
const analyticsService = require('../services/analyticsService');

/**
 * Admin Controller (Refactored with MVC Architecture)
 * Handles HTTP requests and delegates business logic to services
 */

// @desc    Get admin dashboard statistics
// @route   GET /api/v1/admin/dashboard
// @access  Private/Admin
exports.getDashboard = async (req, res) => {
    try {
        const stats = await analyticsService.getDashboardStats();
        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all users with pagination and filters
// @route   GET /api/v1/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
    try {
        const filters = {
            search: req.query.search,
            role: req.query.role,
            isActive: req.query.isActive
        };

        const pagination = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 10
        };

        const result = await userService.getAllUsers(filters, pagination);
        res.json({ success: true, data: result.users, pagination: result.pagination });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create new user
// @route   POST /api/v1/admin/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
    try {
        const user = await userService.createUserByAdmin(req.body);
        res.status(201).json({
            success: true,
            data: user,
            message: 'User created successfully'
        });
    } catch (error) {
        const statusCode = error.message.includes('already registered') ? 409 : 400;
        res.status(statusCode).json({ success: false, message: error.message });
    }
};

// @desc    Get single user
// @route   GET /api/v1/admin/users/:id
// @access  Private/Admin
exports.getUser = async (req, res) => {
    try {
        const data = await userService.getUserById(req.params.id);
        res.json({ success: true, data });
    } catch (error) {
        const statusCode = error.message === 'User not found' ? 404 : 500;
        res.status(statusCode).json({ success: false, message: error.message });
    }
};

// @desc    Update user
// @route   PUT /api/v1/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
    try {
        const user = await userService.updateUser(req.params.id, req.body);
        res.json({ success: true, data: user });
    } catch (error) {
        const statusCode = error.message === 'User not found' ? 404 : 400;
        res.status(statusCode).json({ success: false, message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/v1/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
    try {
        const result = await userService.deleteUser(req.params.id, req.user.id);
        res.json({ success: true, ...result });
    } catch (error) {
        const statusCode = error.message === 'User not found' ? 404 : 400;
        res.status(statusCode).json({ success: false, message: error.message });
    }
};

// @desc    Get all modules
// @route   GET /api/v1/admin/modules
// @access  Private/Admin
exports.getModules = async (req, res) => {
    try {
        const filters = {
            category: req.query.category,
            difficulty: req.query.difficulty,
            isActive: req.query.isActive
        };

        const modules = await moduleService.getAllModules(filters);
        res.json({ success: true, data: modules });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create module
// @route   POST /api/v1/admin/modules
// @access  Private/Admin
exports.createModule = async (req, res) => {
    try {
        const module = await moduleService.createModule(req.body);
        res.status(201).json({ success: true, data: module });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update module
// @route   PUT /api/v1/admin/modules/:id
// @access  Private/Admin
exports.updateModule = async (req, res) => {
    try {
        const module = await moduleService.updateModule(req.params.id, req.body);
        res.json({ success: true, data: module });
    } catch (error) {
        const statusCode = error.message === 'Module not found' ? 404 : 400;
        res.status(statusCode).json({ success: false, message: error.message });
    }
};

// @desc    Delete module
// @route   DELETE /api/v1/admin/modules/:id
// @access  Private/Admin
exports.deleteModule = async (req, res) => {
    try {
        const result = await moduleService.deleteModule(req.params.id);
        res.json({ success: true, ...result });
    } catch (error) {
        const statusCode = error.message === 'Module not found' ? 404 : 500;
        res.status(statusCode).json({ success: false, message: error.message });
    }
};

// @desc    Get analytics data
// @route   GET /api/v1/admin/analytics
// @access  Private/Admin
exports.getAnalytics = async (req, res) => {
    try {
        const period = req.query.period || '30';
        const data = await analyticsService.getAnalytics(period);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Generate report
// @route   GET /api/v1/admin/reports/:type
// @access  Private/Admin
exports.generateReport = async (req, res) => {
    try {
        const { type } = req.params;
        const { startDate, endDate } = req.query;

        const report = await analyticsService.getReport(type, startDate, endDate);
        res.json({ success: true, data: report });
    } catch (error) {
        const statusCode = error.message === 'Invalid report type' ? 400 : 500;
        res.status(statusCode).json({ success: false, message: error.message });
    }
};
