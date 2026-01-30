const Instructor = require('../models/Instructor');
const Module = require('../models/Module');
const Joi = require('joi');

/**
 * Get all active instructors
 */
exports.getAllInstructors = async (req, res) => {
    try {
        const schema = Joi.object({
            page: Joi.number().integer().min(1).default(1),
            limit: Joi.number().integer().min(1).max(50).default(20),
            search: Joi.string().allow('').optional(),
            expertise: Joi.string().allow('').optional()
        });

        const { value, error } = schema.validate(req.query);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                details: error.details
            });
        }

        const { page, limit, search, expertise } = value;
        const skip = (page - 1) * limit;

        // Build query
        const query = { active: true };

        // Add search filter
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { expertise: { $regex: search, $options: 'i' } }
            ];
        }

        // Add expertise filter
        if (expertise) {
            query.expertise = { $regex: expertise, $options: 'i' };
        }

        // Execute query
        const instructors = await Instructor.find(query)
            .select('-__v')
            .skip(skip)
            .limit(limit)
            .sort({ 'stats.rating': -1, name: 1 });

        const total = await Instructor.countDocuments(query);

        res.json({
            success: true,
            data: instructors,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('[Instructor] Get all error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get instructor by ID
 */
exports.getInstructorById = async (req, res) => {
    try {
        const schema = Joi.object({
            id: Joi.string().required()
        });

        const { value, error } = schema.validate(req.params);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                details: error.details
            });
        }

        const { id } = value;

        const instructor = await Instructor.findById(id)
            .populate('courses', 'title description duration level')
            .select('-__v');

        if (!instructor) {
            return res.status(404).json({
                success: false,
                message: 'Instructor not found'
            });
        }

        res.json({
            success: true,
            data: instructor
        });
    } catch (error) {
        console.error('[Instructor] Get by ID error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get courses taught by instructor
 */
exports.getInstructorCourses = async (req, res) => {
    try {
        const schema = Joi.object({
            id: Joi.string().required()
        });

        const { value, error } = schema.validate(req.params);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                details: error.details
            });
        }

        const { id } = value;

        const instructor = await Instructor.findById(id)
            .populate({
                path: 'courses',
                select: 'title description duration level category thumbnail',
                match: { isActive: true }
            });

        if (!instructor) {
            return res.status(404).json({
                success: false,
                message: 'Instructor not found'
            });
        }

        res.json({
            success: true,
            data: instructor.courses
        });
    } catch (error) {
        console.error('[Instructor] Get courses error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Create instructor (Admin only)
 */
exports.createInstructor = async (req, res) => {
    try {
        const schema = Joi.object({
            name: Joi.string().required().trim(),
            email: Joi.string().email().required().trim(),
            title: Joi.string().optional().trim(),
            bio: Joi.string().optional().trim(),
            avatar: Joi.string().uri().optional().allow(''),
            expertise: Joi.array().items(Joi.string().trim()).optional(),
            socialLinks: Joi.object({
                linkedin: Joi.string().uri().optional().allow(''),
                twitter: Joi.string().uri().optional().allow(''),
                github: Joi.string().uri().optional().allow(''),
                website: Joi.string().uri().optional().allow('')
            }).optional(),
            courses: Joi.array().items(Joi.string()).optional()
        });

        const { value, error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                details: error.details
            });
        }

        // Check if instructor with email already exists
        const existingInstructor = await Instructor.findOne({ email: value.email });
        if (existingInstructor) {
            return res.status(400).json({
                success: false,
                message: 'Instructor with this email already exists'
            });
        }

        const instructor = new Instructor(value);
        await instructor.save();

        // Update course count if courses provided
        if (value.courses && value.courses.length > 0) {
            await instructor.updateCourseCount();
        }

        res.status(201).json({
            success: true,
            message: 'Instructor created successfully',
            data: instructor
        });
    } catch (error) {
        console.error('[Instructor] Create error:', error);

        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Instructor with this email already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Update instructor (Admin only)
 */
exports.updateInstructor = async (req, res) => {
    try {
        const paramSchema = Joi.object({
            id: Joi.string().required()
        });

        const bodySchema = Joi.object({
            name: Joi.string().optional().trim(),
            email: Joi.string().email().optional().trim(),
            title: Joi.string().optional().trim(),
            bio: Joi.string().optional().trim(),
            avatar: Joi.string().uri().optional().allow(''),
            expertise: Joi.array().items(Joi.string().trim()).optional(),
            socialLinks: Joi.object({
                linkedin: Joi.string().uri().optional().allow(''),
                twitter: Joi.string().uri().optional().allow(''),
                github: Joi.string().uri().optional().allow(''),
                website: Joi.string().uri().optional().allow('')
            }).optional(),
            courses: Joi.array().items(Joi.string()).optional(),
            active: Joi.boolean().optional(),
            stats: Joi.object({
                rating: Joi.number().min(0).max(5).optional(),
                students: Joi.number().min(0).optional(),
                courses: Joi.number().min(0).optional()
            }).optional()
        });

        const paramResult = paramSchema.validate(req.params);
        if (paramResult.error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                details: paramResult.error.details
            });
        }

        const bodyResult = bodySchema.validate(req.body);
        if (bodyResult.error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                details: bodyResult.error.details
            });
        }

        const { id } = paramResult.value;
        const updates = bodyResult.value;

        // Check if email is being changed and if it's already taken
        if (updates.email) {
            const existingInstructor = await Instructor.findOne({
                email: updates.email,
                _id: { $ne: id }
            });
            if (existingInstructor) {
                return res.status(400).json({
                    success: false,
                    message: 'Email is already taken by another instructor'
                });
            }
        }

        const instructor = await Instructor.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        );

        if (!instructor) {
            return res.status(404).json({
                success: false,
                message: 'Instructor not found'
            });
        }

        // Update course count if courses were updated
        if (updates.courses) {
            await instructor.updateCourseCount();
        }

        res.json({
            success: true,
            message: 'Instructor updated successfully',
            data: instructor
        });
    } catch (error) {
        console.error('[Instructor] Update error:', error);

        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Email is already taken by another instructor'
            });
        }

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Delete instructor (Admin only)
 */
exports.deleteInstructor = async (req, res) => {
    try {
        const schema = Joi.object({
            id: Joi.string().required()
        });

        const { value, error } = schema.validate(req.params);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                details: error.details
            });
        }

        const { id } = value;

        const instructor = await Instructor.findByIdAndDelete(id);

        if (!instructor) {
            return res.status(404).json({
                success: false,
                message: 'Instructor not found'
            });
        }

        res.json({
            success: true,
            message: 'Instructor deleted successfully'
        });
    } catch (error) {
        console.error('[Instructor] Delete error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
