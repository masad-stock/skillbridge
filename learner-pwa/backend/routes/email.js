const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const emailQueueService = require('../services/emailQueueService');
const emailService = require('../services/emailService');

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

/**
 * Get email queue statistics
 */
router.get('/queue/stats', async (req, res) => {
    try {
        const stats = await emailQueueService.getQueueStats();
        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * Get failed email jobs
 */
router.get('/queue/failed', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const failedJobs = await emailQueueService.getFailedJobs(limit);
        res.json({ success: true, data: failedJobs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * Retry failed email job
 */
router.post('/queue/retry/:jobId', async (req, res) => {
    try {
        const { jobId } = req.params;
        const result = await emailQueueService.retryFailedJob(jobId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * Clean old jobs
 */
router.post('/queue/clean', async (req, res) => {
    try {
        const grace = parseInt(req.body.grace) || 24 * 60 * 60 * 1000;
        const result = await emailQueueService.cleanOldJobs(grace);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * Pause email queue
 */
router.post('/queue/pause', async (req, res) => {
    try {
        const result = await emailQueueService.pauseQueue();
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * Resume email queue
 */
router.post('/queue/resume', async (req, res) => {
    try {
        const result = await emailQueueService.resumeQueue();
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * Send test email
 */
router.post('/test', async (req, res) => {
    try {
        const { to, subject, message } = req.body;

        if (!to || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: to, subject, message'
            });
        }

        const html = `
            <h2>${subject}</h2>
            <p>${message}</p>
            <p><em>This is a test email from SkillBridge Admin Panel</em></p>
        `;

        const result = await emailService.sendEmail(to, subject, html);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * Send admin notification
 */
router.post('/admin-notification', async (req, res) => {
    try {
        const { subject, message, data } = req.body;

        if (!subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: subject, message'
            });
        }

        const result = await emailQueueService.queueAdminNotification(subject, message, data);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
