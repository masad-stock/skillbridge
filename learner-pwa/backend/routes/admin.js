const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// Protect all admin routes and require admin role
router.use(protect);
router.use(authorize('admin'));

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// User Management
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.get('/users/:id', adminController.getUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Module Management
router.get('/modules', adminController.getModules);
router.post('/modules', adminController.createModule);
router.put('/modules/:id', adminController.updateModule);
router.delete('/modules/:id', adminController.deleteModule);

// Analytics
router.get('/analytics', adminController.getAnalytics);

// Reports
router.get('/reports/:type', adminController.generateReport);

module.exports = router;
