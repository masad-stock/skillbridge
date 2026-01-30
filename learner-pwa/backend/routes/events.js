const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { auth, adminAuth } = require('../middleware/auth');

/**
 * @route   GET /api/v1/events
 * @desc    Get all events
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
        const { category, status, upcoming, limit = 10, page = 1 } = req.query;

        const query = {};

        if (category) {
            query.category = category;
        }

        if (status) {
            query.status = status;
        }

        // Filter for upcoming events
        if (upcoming === 'true') {
            query.startDate = { $gte: new Date() };
            query.status = { $ne: 'cancelled' };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const events = await Event.find(query)
            .populate('organizer', 'profile.firstName profile.lastName email')
            .sort({ startDate: 1 })
            .limit(parseInt(limit))
            .skip(skip);

        const total = await Event.countDocuments(query);

        res.json({
            success: true,
            data: events,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch events',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/v1/events/:id
 * @desc    Get single event by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('organizer', 'profile.firstName profile.lastName email')
            .populate('attendees.user', 'profile.firstName profile.lastName email');

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.json({
            success: true,
            data: event
        });
    } catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch event',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/v1/events/:id/attendees
 * @desc    Get event attendees
 * @access  Admin
 */
router.get('/:id/attendees', adminAuth, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('attendees.user', 'profile.firstName profile.lastName email');

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        const attendees = event.attendees.map(attendee => ({
            name: `${attendee.user.profile.firstName} ${attendee.user.profile.lastName}`,
            email: attendee.user.email,
            registeredAt: attendee.registeredAt,
            attended: attendee.attended
        }));

        res.json({
            success: true,
            data: attendees
        });
    } catch (error) {
        console.error('Error fetching attendees:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch attendees',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/v1/events
 * @desc    Create new event
 * @access  Admin
 */
router.post('/', adminAuth, async (req, res) => {
    try {
        const {
            title,
            description,
            startDate,
            endDate,
            location,
            isOnline,
            meetingLink,
            category,
            image,
            maxAttendees,
            tags
        } = req.body;

        const event = new Event({
            title,
            description,
            startDate,
            endDate,
            location,
            isOnline,
            meetingLink,
            category,
            image,
            maxAttendees,
            tags,
            organizer: req.user._id
        });

        await event.save();
        await event.populate('organizer', 'profile.firstName profile.lastName email');

        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            data: event
        });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create event',
            error: error.message
        });
    }
});

/**
 * @route   PUT /api/v1/events/:id
 * @desc    Update event
 * @access  Admin
 */
router.put('/:id', adminAuth, async (req, res) => {
    try {
        const {
            title,
            description,
            startDate,
            endDate,
            location,
            isOnline,
            meetingLink,
            category,
            image,
            maxAttendees,
            status,
            tags
        } = req.body;

        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Update fields
        if (title) event.title = title;
        if (description) event.description = description;
        if (startDate) event.startDate = startDate;
        if (endDate !== undefined) event.endDate = endDate;
        if (location !== undefined) event.location = location;
        if (isOnline !== undefined) event.isOnline = isOnline;
        if (meetingLink !== undefined) event.meetingLink = meetingLink;
        if (category) event.category = category;
        if (image !== undefined) event.image = image;
        if (maxAttendees !== undefined) event.maxAttendees = maxAttendees;
        if (status) event.status = status;
        if (tags) event.tags = tags;

        await event.save();
        await event.populate('organizer', 'profile.firstName profile.lastName email');

        res.json({
            success: true,
            message: 'Event updated successfully',
            data: event
        });
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update event',
            error: error.message
        });
    }
});

/**
 * @route   DELETE /api/v1/events/:id
 * @desc    Delete event
 * @access  Admin
 */
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);

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
        console.error('Error deleting event:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete event',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/v1/events/:id/register
 * @desc    Register for event
 * @access  Private
 */
router.post('/:id/register', auth, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Check if already registered
        if (event.isUserRegistered(req.user._id)) {
            return res.status(400).json({
                success: false,
                message: 'You are already registered for this event'
            });
        }

        // Check if event is full
        if (event.isFull) {
            return res.status(400).json({
                success: false,
                message: 'Event is full'
            });
        }

        await event.registerUser(req.user._id);

        res.json({
            success: true,
            message: 'Successfully registered for event',
            data: event
        });
    } catch (error) {
        console.error('Error registering for event:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to register for event'
        });
    }
});

/**
 * @route   DELETE /api/v1/events/:id/register
 * @desc    Unregister from event
 * @access  Private
 */
router.delete('/:id/register', auth, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Check if registered
        if (!event.isUserRegistered(req.user._id)) {
            return res.status(400).json({
                success: false,
                message: 'You are not registered for this event'
            });
        }

        await event.unregisterUser(req.user._id);

        res.json({
            success: true,
            message: 'Successfully unregistered from event',
            data: event
        });
    } catch (error) {
        console.error('Error unregistering from event:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to unregister from event',
            error: error.message
        });
    }
});

module.exports = router;
