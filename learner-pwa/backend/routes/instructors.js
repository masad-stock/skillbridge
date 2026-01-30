const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const instructorController = require('../controllers/instructorController');

// Public routes
router.get('/', instructorController.getAllInstructors);
router.get('/:id', instructorController.getInstructorById);
router.get('/:id/courses', instructorController.getInstructorCourses);

// Admin routes - require authentication and admin role
router.post('/', protect, authorize('admin'), instructorController.createInstructor);
router.put('/:id', protect, authorize('admin'), instructorController.updateInstructor);
router.delete('/:id', protect, authorize('admin'), instructorController.deleteInstructor);

module.exports = router;
