const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    register,
    login,
    getMe,
    updateProfile,
    forgotPassword,
    resetPassword,
    changePassword
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/change-password', protect, changePassword);

module.exports = router;
