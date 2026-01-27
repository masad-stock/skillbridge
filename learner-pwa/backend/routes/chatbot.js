const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { protect, optionalAuth } = require('../middleware/auth');
const groqService = require('../services/groqService');
const Module = require('../models/Module');
const User = require('../models/User');

// Rate limiters
const publicChatLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // 10 requests per minute for unauthenticated users
    message: { error: 'Too many requests from this IP. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const authenticatedChatLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // 30 requests per minute for authenticated users
    message: { error: 'Too many requests. Please slow down.' },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * @route   POST /api/v1/chatbot/message-public
 * @desc    Send message to chatbot (public, no auth required, streaming)
 * @access  Public
 */
router.post('/message-public', publicChatLimiter, async (req, res) => {
    try {
        const { message, language } = req.body;

        if (!message || message.trim().length === 0) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Create public user context
        const userContext = {
            userName: 'Visitor',
            language: language || 'en'
        };

        // Create public course context (general information only)
        const courseContext = {
            courseName: 'SkillBridge254 Platform',
            moduleName: 'General Information',
            isPublic: true
        };

        // Set headers for streaming
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Stream response
        try {
            for await (const chunk of groqService.generateChatStream(
                message,
                userContext,
                courseContext
            )) {
                res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
            }
            res.write('data: [DONE]\n\n');
            res.end();
        } catch (streamError) {
            console.error('Streaming error:', streamError);
            let errorMessage = 'Failed to generate response';

            if (streamError.message === 'Groq API not configured') {
                errorMessage = 'AI service is not configured. Please contact support.';
            } else if (streamError.message.includes('API_KEY')) {
                errorMessage = 'AI service configuration error. Please try again later.';
            } else if (streamError.message.includes('quota') || streamError.message.includes('limit')) {
                errorMessage = 'AI service is temporarily unavailable due to high usage. Please try again later.';
            }

            res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
            res.end();
        }
    } catch (error) {
        console.error('Public chatbot message error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to process message' });
        }
    }
});

/**
 * @route   POST /api/v1/chatbot/message
 * @desc    Send message to chatbot (streaming)
 * @access  Private
 */
router.post('/message', authenticatedChatLimiter, protect, async (req, res) => {
    try {
        const { message, courseContext } = req.body;

        if (!message || message.trim().length === 0) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Get user context
        const user = await User.findById(req.user.id).select('profile');
        const userContext = {
            userName: user?.profile?.firstName || 'Learner',
            language: req.body.language || 'en'
        };

        // Get course context if provided
        let enrichedCourseContext = { ...courseContext };
        if (courseContext?.moduleId) {
            const module = await Module.findById(courseContext.moduleId);
            if (module) {
                enrichedCourseContext.moduleName = module.title;
                enrichedCourseContext.courseName = module.category || 'Digital Skills';
            }
        }

        // Set headers for streaming
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Stream response
        try {
            for await (const chunk of groqService.generateChatStream(
                message,
                userContext,
                enrichedCourseContext
            )) {
                res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
            }
            res.write('data: [DONE]\n\n');
            res.end();
        } catch (streamError) {
            console.error('Streaming error:', streamError);
            let errorMessage = 'Failed to generate response';

            if (streamError.message === 'Groq API not configured') {
                errorMessage = 'AI service is not configured. Please contact support.';
            } else if (streamError.message.includes('API_KEY')) {
                errorMessage = 'AI service configuration error. Please try again later.';
            } else if (streamError.message.includes('quota') || streamError.message.includes('limit')) {
                errorMessage = 'AI service is temporarily unavailable due to high usage. Please try again later.';
            }

            res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
            res.end();
        }
    } catch (error) {
        console.error('Chatbot message error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to process message' });
        }
    }
});

/**
 * @route   POST /api/v1/chatbot/message-sync
 * @desc    Send message to chatbot (non-streaming)
 * @access  Private
 */
router.post('/message-sync', protect, async (req, res) => {
    try {
        const { message, courseContext } = req.body;

        if (!message || message.trim().length === 0) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Get user context
        const user = await User.findById(req.user.id).select('profile');
        const userContext = {
            userName: user?.profile?.firstName || 'Learner',
            language: req.body.language || 'en'
        };

        // Get course context if provided
        let enrichedCourseContext = { ...courseContext };
        if (courseContext?.moduleId) {
            const module = await Module.findById(courseContext.moduleId);
            if (module) {
                enrichedCourseContext.moduleName = module.title;
                enrichedCourseContext.courseName = module.category || 'Digital Skills';
            }
        }

        const response = await groqService.generateChatResponse(
            message,
            userContext,
            enrichedCourseContext
        );

        res.json({ response });
    } catch (error) {
        console.error('Chatbot message error:', error);
        res.status(500).json({ error: 'Failed to process message' });
    }
});

/**
 * @route   POST /api/v1/chatbot/celebration
 * @desc    Generate celebration message
 * @access  Private
 */
router.post('/celebration', protect, async (req, res) => {
    try {
        const { eventType, context } = req.body;

        if (!eventType) {
            return res.status(400).json({ error: 'Event type is required' });
        }

        // Get user context
        const user = await User.findById(req.user.id).select('profile');
        const enrichedContext = {
            ...context,
            userName: user?.profile?.firstName || 'Learner'
        };

        const message = await groqService.generateCelebrationMessage(
            eventType,
            enrichedContext
        );

        res.json({ message });
    } catch (error) {
        console.error('Celebration message error:', error);
        res.status(500).json({ error: 'Failed to generate celebration message' });
    }
});

/**
 * @route   GET /api/v1/chatbot/health
 * @desc    Check chatbot service health
 * @access  Public
 */
router.get('/health', (req, res) => {
    const isConfigured = !!process.env.GROQ_API_KEY;
    res.json({
        status: isConfigured ? 'healthy' : 'not_configured',
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        configured: isConfigured
    });
});

module.exports = router;
