const express = require('express');
const router = express.Router();
const Joi = require('joi');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/profiles');
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            console.log('Upload directory ensured:', uploadDir);
            cb(null, uploadDir);
        } catch (error) {
            console.error('Error creating upload directory:', error);
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const userId = req.user?.id || 'temp';
        const filename = `profile-${userId}-${uniqueSuffix}${path.extname(file.originalname)}`;
        console.log('Generated filename:', filename);
        cb(null, filename);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        console.log('File filter - mimetype:', file.mimetype, 'originalname:', file.originalname);
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            console.log('File accepted');
            return cb(null, true);
        } else {
            console.log('File rejected - invalid type');
            cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
        }
    }
});

// @route   GET /api/v1/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
    try {
        const schema = Joi.object({
            page: Joi.number().integer().min(1).default(1),
            limit: Joi.number().integer().min(1).max(100).default(20)
        });
        const { value } = schema.validate(req.query);
        const { page, limit } = value;
        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            User.find().select('-password').skip(skip).limit(limit),
            User.countDocuments()
        ]);
        res.json({ success: true, page, limit, total, count: users.length, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/v1/users/:id
// @desc    Get single user
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   PUT /api/v1/users/:id
// @desc    Update user
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        // Users can only update their own profile unless admin
        if (req.user.id !== req.params.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const schema = Joi.object({
            profile: Joi.object().unknown(true),
            role: Joi.string().valid('user', 'admin', 'business').optional()
        }).min(1);
        const { value, error: validationError } = schema.validate(req.body, { abortEarly: false });
        if (validationError) {
            return res.status(400).json({ success: false, message: 'Validation error', details: validationError.details });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            value,
            { new: true, runValidators: true }
        ).select('-password');

        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   POST /api/v1/users/profile/photo
// @desc    Upload profile photo
// @access  Private
router.post('/profile/photo', protect, upload.single('photo'), async (req, res) => {
    try {
        console.log('Upload request received');
        console.log('File:', req.file);
        console.log('Body:', req.body);
        console.log('User:', req.user?.id);

        if (!req.file) {
            console.log('No file in request');
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        // Delete old profile photo if exists
        const user = await User.findById(req.user.id);
        if (!user) {
            console.log('User not found:', req.user.id);
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Initialize profile object if it doesn't exist
        if (!user.profile) {
            user.profile = {};
        }

        if (user.profile?.profilePhoto) {
            // Extract filename from URL path
            const photoFilename = path.basename(user.profile.profilePhoto);
            const oldPhotoPath = path.join(__dirname, '../uploads/profiles', photoFilename);
            try {
                await fs.unlink(oldPhotoPath);
                console.log('Deleted old photo:', oldPhotoPath);
            } catch (error) {
                console.log('Could not delete old photo:', error.message);
                // Ignore error if file doesn't exist
            }
        }

        // Update user with new photo URL
        const photoUrl = `/uploads/profiles/${req.file.filename}`;
        user.profile.profilePhoto = photoUrl;

        // Mark profile as modified to ensure it saves
        user.markModified('profile');

        await user.save();

        console.log('Photo uploaded successfully:', photoUrl);

        res.json({
            success: true,
            message: 'Profile photo uploaded successfully',
            data: { profilePhoto: photoUrl }
        });
    } catch (error) {
        console.error('Upload error:', error);
        console.error('Error stack:', error.stack);
        // Clean up uploaded file if database update fails
        if (req.file) {
            try {
                await fs.unlink(req.file.path);
            } catch (unlinkError) {
                console.error('Failed to clean up file:', unlinkError);
            }
        }
        res.status(500).json({ success: false, message: error.message || 'Upload failed' });
    }
});

// @route   DELETE /api/v1/users/profile/photo
// @desc    Delete profile photo
// @access  Private
router.delete('/profile/photo', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user.profile?.profilePhoto) {
            return res.status(404).json({ success: false, message: 'No profile photo to delete' });
        }

        // Delete photo file
        const photoFilename = path.basename(user.profile.profilePhoto);
        const photoPath = path.join(__dirname, '../uploads/profiles', photoFilename);
        try {
            await fs.unlink(photoPath);
            console.log('Deleted photo file:', photoPath);
        } catch (error) {
            console.log('Could not delete photo file:', error.message);
            // Ignore error if file doesn't exist
        }

        // Update user
        user.profile.profilePhoto = undefined;
        await user.save();

        res.json({
            success: true,
            message: 'Profile photo deleted successfully'
        });
    } catch (error) {
        console.error('Delete photo error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
