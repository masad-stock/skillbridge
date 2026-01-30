const Event = require('../models/Event');
const Joi = require('joi');

/**
 * Get all upcoming events
 */
exports.getAllEvents = async (req, res) => {
    try {
        const schema = Joi.object({
            page: Joi.number().integer().min(1).default(1),
            limit: Joi.number().integer().min(1).max(50).default(20),
            category: Joi.string().allow('').optional(),
            status: Joi.string().valid('upcoming', 'ongoing', 'completed', 'cancelled').optional(),
            startDate: Joi.date().optional(),
            endDate: Joi.date().optional()
        });

        const { value, error } = schema.validate(req.query);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                details: error.details
            });
        }

        const { page, limit, category, status, startDate, endDate } = value;
        const skip = (page - 1) * limit;

        // Build query - default to upcoming events
        const query = {};

        // Add status filter (default to upcoming if not specified)
        if (status) {
            query.status = status;
        } else {
            query.status = { $in: ['upcoming', 'ongoing'] };
        }

        // Add category filter
        if (category) {
            query.category = category;
        }

        // Add date range filter
        if (startDate || endDate) {
            query.startDate = {};
            if (startDate) {
                query.startDate.$gte = new Date(startDate);
            }
            if (endDate) {
                query.startDate.$lte = new Date(endDate);
            }
        }

        // Execute query
        const events = await Event.find(query)
            .populate('organizer', 'profile.firstName profile.lastName email')
            .select('-__v')
            .skip(skip)
            .limit(limit)
            .sort({ startDate: 1 });

        const total = await Event.countDocuments(query);

        res.json({
            success: true,
            data: events,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('[Event] Get all events error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get event by ID
 */
exports.getEventById = async (req, res) => {
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

        const event = await Event.findById(id)
            .populate('organizer', 'profile.firstName profile.lastName email profile.profilePhoto')
            .populate('attendees', 'profile.firstName profile.lastName email')
            .select('-__v');

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Check if current user is registered (if authenticated)
        let isRegistered = false;
        if (req.user) {
            isRegistered = event.attendees.some(
                attendee => attendee._id.toString() === req.user.id
            );
        }

        res.json({
            success: true,
            data: {
                ...event.toObject(),
                isRegistered
            }
        });
    } catch (error) {
        console.error('[Event] Get event by ID error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Create event (Admin only)
 */
exports.createEvent = async (req, res) => {
    try {
        const schema = Joi.object({
            title: Joi.string().required().trim(),
            description: Joi.string().required().trim(),
            startDate: Joi.date().required(),
            endDate: Joi.date().optional(),
            location: Joi.string().optional().trim(),
            isOnline: Joi.boolean().optional(),
            meetingLink: Joi.string().uri().optional().allow(''),
            category: Joi.string().optional().trim(),
            maxAttendees: Joi.number().integer().min(1).optional(),
            image: Joi.string().uri().optional().allow('')
        });

        const { value, error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                details: error.details
            });
        }

        // Validate date logic
        if (value.endDate && value.endDate < value.startDate) {
            return res.status(400).json({
                success: false,
                message: 'End date must be after start date'
            });
        }

        // Add organizer from authenticated user
        value.organizer = req.user.id;

        const event = new Event(value);
        await event.save();

        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            data: event
        });
    } catch (error) {
        console.error('[Event] Create event error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Update event (Admin only)
 */
exports.updateEvent = async (req, res) => {
    try {
        const paramSchema = Joi.object({
            id: Joi.string().required()
        });

        const bodySchema = Joi.object({
            title: Joi.string().optional().trim(),
            description: Joi.string().optional().trim(),
            startDate: Joi.date().optional(),
            endDate: Joi.date().optional(),
            location: Joi.string().optional().trim(),
            isOnline: Joi.boolean().optional(),
            meetingLink: Joi.string().uri().optional().allow(''),
            category: Joi.string().optional().trim(),
            maxAttendees: Joi.number().integer().min(1).optional(),
            image: Joi.string().uri().optional().allow(''),
            status: Joi.string().valid('upcoming', 'ongoing', 'completed', 'cancelled').optional()
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

        // Validate date logic if both dates are being updated
        if (updates.startDate && updates.endDate && updates.endDate < updates.startDate) {
            return res.status(400).json({
                success: false,
                message: 'End date must be after start date'
            });
        }

        const event = await Event.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        );

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.json({
            success: true,
            message: 'Event updated successfully',
            data: event
        });
    } catch (error) {
        console.error('[Event] Update event error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Delete event (Admin only)
 */
exports.deleteEvent = async (req, res) => {
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

        const event = await Event.findByIdAndDelete(id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.json({
            success: true,
            message: 'Event deleted successfully'
        });
    } catch (error) {
        console.error('[Event] Delete event error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Register for event (Authenticated users)
 */
exports.registerForEvent = async (req, res) => {
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
        const userId = req.user.id;

        const event = await Event.findById(id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        try {
            await event.registerUser(userId);
        } catch (regError) {
            return res.status(400).json({
                success: false,
                message: regError.message
            });
        }

        res.json({
            success: true,
            message: 'Successfully registered for event',
            data: {
                eventId: event._id,
                attendeeCount: event.attendeeCount,
                availableSpots: event.availableSpots
            }
        });
    } catch (error) {
        console.error('[Event] Register for event error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Unregister from event (Authenticated users)
 */
exports.unregisterFromEvent = async (req, res) => {
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
        const userId = req.user.id;

        const event = await Event.findById(id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        try {
            await event.unregisterUser(userId);
        } catch (unregError) {
            return res.status(400).json({
                success: false,
                message: unregError.message
            });
        }

        res.json({
            success: true,
            message: 'Successfully unregistered from event',
            data: {
                eventId: event._id,
                attendeeCount: event.attendeeCount,
                availableSpots: event.availableSpots
            }
        });
    } catch (error) {
        console.error('[Event] Unregister from event error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get event attendees (Admin only)
 */
exports.getEventAttendees = async (req, res) => {
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

        const event = await Event.findById(id)
            .populate('attendees', 'profile.firstName profile.lastName email profile.phoneNumber');

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.json({
            success: true,
            data: {
                eventTitle: event.title,
                attendeeCount: event.attendeeCount,
                maxAttendees: event.maxAttendees,
                attendees: event.attendees
            }
        });
    } catch (error) {
        console.error('[Event] Get event attendees error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
