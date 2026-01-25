const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const eventTrackingService = require('../services/research/EventTrackingService');
const logger = require('../utils/logger');

/**
 * Event validation middleware
 */
const validateEventFields = (req, res, next) => {
    const { eventType, sessionId } = req.body;
    const errors = [];

    if (!eventType) errors.push('eventType is required');
    if (!sessionId) errors.push('sessionId is required');

    if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
    }

    next();
};

/**
 * Batch validation middleware
 */
const validateBatchEvents = (req, res, next) => {
    const { events } = req.body;

    if (!events || !Array.isArray(events)) {
        return res.status(400).json({
            success: false,
            error: 'events must be an array'
        });
    }

    if (events.length === 0) {
        return res.status(400).json({
            success: false,
            error: 'events array cannot be empty'
        });
    }

    if (events.length > 100) {
        return res.status(400).json({
            success: false,
            error: 'Maximum 100 events per batch'
        });
    }

    next();
};

/**
 * POST /api/research/events
 * Submit a single research event
 */
router.post('/events', auth, validateEventFields, async (req, res) => {
    try {
        const eventData = {
            ...req.body,
            userId: req.user._id
        };

        const result = await eventTrackingService.trackEvent(eventData);

        res.status(201).json({
            success: true,
            message: 'Event tracked successfully',
            data: result
        });
    } catch (error) {
        logger.error('Error tracking event', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Failed to track event'
        });
    }
});


/**
 * POST /api/research/events/batch
 * Submit multiple research events in batch
 */
router.post('/events/batch', auth, validateBatchEvents, async (req, res) => {
    try {
        const { events } = req.body;

        // Add userId to all events
        const eventsWithUser = events.map(event => ({
            ...event,
            userId: req.user._id
        }));

        const result = await eventTrackingService.trackBatch(eventsWithUser);

        res.status(201).json({
            success: true,
            message: 'Batch processed',
            data: result
        });
    } catch (error) {
        logger.error('Error processing batch events', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Failed to process batch events'
        });
    }
});

/**
 * GET /api/research/events/user
 * Get events for the authenticated user
 */
router.get('/events/user', auth, async (req, res) => {
    try {
        const { startDate, endDate, eventType, limit } = req.query;

        const options = {
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            eventType,
            limit: limit ? parseInt(limit) : 100
        };

        const events = await eventTrackingService.getEventsByUser(req.user._id, options);

        res.json({
            success: true,
            data: events,
            count: events.length
        });
    } catch (error) {
        logger.error('Error fetching user events', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Failed to fetch events'
        });
    }
});

/**
 * GET /api/research/events/session/:sessionId
 * Get events for a specific session
 */
router.get('/events/session/:sessionId', auth, async (req, res) => {
    try {
        const events = await eventTrackingService.getEventsBySession(req.params.sessionId);

        res.json({
            success: true,
            data: events,
            count: events.length
        });
    } catch (error) {
        logger.error('Error fetching session events', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Failed to fetch session events'
        });
    }
});

/**
 * GET /api/research/events/stats
 * Get event statistics (admin only)
 */
router.get('/events/stats', adminAuth, async (req, res) => {
    try {
        const { startDate, endDate, groupBy } = req.query;

        const stats = await eventTrackingService.getEventStats(
            startDate ? new Date(startDate) : undefined,
            endDate ? new Date(endDate) : undefined,
            groupBy || 'eventType'
        );

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        logger.error('Error fetching event stats', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Failed to fetch event statistics'
        });
    }
});

/**
 * GET /api/research/events/summary
 * Get summary statistics (admin only)
 */
router.get('/events/summary', adminAuth, async (req, res) => {
    try {
        const { startDate, endDate, eventType, eventCategory, experimentGroup } = req.query;

        const filters = {
            startDate,
            endDate,
            eventType,
            eventCategory,
            experimentGroup
        };

        const summary = await eventTrackingService.getSummaryStats(filters);

        res.json({
            success: true,
            data: summary
        });
    } catch (error) {
        logger.error('Error fetching summary stats', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Failed to fetch summary statistics'
        });
    }
});

/**
 * GET /api/research/events/experiment/:experimentId
 * Get events for a specific experiment (admin only)
 */
router.get('/events/experiment/:experimentId', adminAuth, async (req, res) => {
    try {
        const { group } = req.query;
        const events = await eventTrackingService.getExperimentEvents(
            req.params.experimentId,
            group
        );

        res.json({
            success: true,
            data: events,
            count: events.length
        });
    } catch (error) {
        logger.error('Error fetching experiment events', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Failed to fetch experiment events'
        });
    }
});

module.exports = router;
