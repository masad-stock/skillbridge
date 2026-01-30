const Joi = require('joi');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const emailQueueService = require('../services/emailQueueService');
const logger = require('../utils/logger');

// Generate JWT Token
const generateToken = (id) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '30d'
    });
};

/**
 * @desc    Register new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
exports.register = async (req, res) => {
    try {
        const schema = Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().min(6).required(),
            profile: Joi.object({
                firstName: Joi.string().min(2).required(),
                lastName: Joi.string().min(2).required(),
                phoneNumber: Joi.string().allow('', null).optional()
            }).unknown(true).required()
        });

        const { value, error: validationError } = schema.validate(req.body, { abortEarly: false });

        if (validationError) {
            const errorMessages = validationError.details.map(detail => detail.message).join(', ');
            return res.status(400).json({
                success: false,
                message: `Validation error: ${errorMessages}`,
                details: validationError.details
            });
        }

        const { email, password, profile } = value;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User with this email already exists.' });
        }

        // Ensure profile has required fields
        const userProfile = {
            firstName: profile.firstName || profile.first_name || '',
            lastName: profile.lastName || profile.last_name || '',
            phoneNumber: profile.phoneNumber || profile.phone_number || undefined
        };

        if (!userProfile.firstName || !userProfile.lastName) {
            return res.status(400).json({
                success: false,
                message: 'First name and last name are required'
            });
        }

        // Create user
        const user = await User.create({
            email,
            password,
            profile: userProfile
        });

        const token = generateToken(user._id);

        // Queue welcome email (non-blocking)
        try {
            await emailQueueService.queueWelcomeEmail(user);
        } catch (emailError) {
            logger.error('Failed to queue welcome email:', emailError);
            // Continue without email - don't block registration
        }

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                profile: user.profile,
                role: user.role
            }
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message).join(', ');
            return res.status(400).json({ success: false, message: `Validation error: ${validationErrors}` });
        }
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Email already exists.' });
        }
        logger.error('Registration error:', error);
        logger.error('Error stack:', error.stack);
        logger.error('Error details:', {
            name: error.name,
            message: error.message,
            code: error.code
        });
        res.status(500).json({ 
            success: false, 
            message: 'Server error during registration.',
            ...(process.env.NODE_ENV === 'development' && { error: error.message })
        });
    }
};

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        user.lastLogin = Date.now();
        await user.save();

        const token = generateToken(user._id);

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                profile: user.profile,
                role: user.role,
                skillsProfile: user.skillsProfile
            }
        });
    } catch (error) {
        logger.error('Login error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Get current user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('learningProgress.enrolledModules')
            .populate('learningProgress.currentModule');

        res.json({ success: true, data: user });
    } catch (error) {
        logger.error('GetMe error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/v1/auth/update-profile
 * @access  Private
 */
exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: { profile: req.body.profile } },
            { new: true, runValidators: true }
        );

        res.json({ success: true, data: user });
    } catch (error) {
        logger.error('UpdateProfile error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Request password reset
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Please provide an email address' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.json({ success: true, message: 'If an account exists, a reset link has been sent' });
        }

        const resetToken = user.generateResetToken();
        await user.save({ validateBeforeSave: false });

        try {
            await emailQueueService.queuePasswordResetEmail(user, resetToken);
        } catch (emailError) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });
            return res.status(500).json({ success: false, message: 'Failed to send reset email.' });
        }

        res.json({ success: true, message: 'If an account exists, a reset link has been sent' });
    } catch (error) {
        logger.error('ForgotPassword error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Reset password with token
 * @route   POST /api/v1/auth/reset-password/:token
 * @access  Public
 */
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password, confirmPassword } = req.body;

        if (!password || !confirmPassword || password !== confirmPassword) {
            return res.status(400).json({ success: false, message: 'Passwords do not match or are missing' });
        }

        const user = await User.findByResetToken(token);

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        const jwtToken = generateToken(user._id);

        res.json({
            success: true,
            message: 'Password reset successful',
            token: jwtToken,
            user: {
                id: user._id,
                email: user.email,
                profile: user.profile,
                role: user.role
            }
        });
    } catch (error) {
        logger.error('ResetPassword error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Change password
 * @route   POST /api/v1/auth/change-password
 * @access  Private
 */
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ success: false, message: 'New passwords do not match' });
        }

        const user = await User.findById(req.user.id).select('+password');

        if (!(await user.comparePassword(currentPassword))) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        logger.error('ChangePassword error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
