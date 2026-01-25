const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const imageService = require('../services/imageService');
const imageCacheService = require('../services/imageCacheService');
const logger = require('../utils/logger');

// Rate limiting for image generation
const rateLimit = require('express-rate-limit');

const imageGenerationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // 50 requests per hour per IP
    message: {
        success: false,
        message: 'Too many image generation requests. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// @desc    Generate or get cached AI image
// @route   GET /api/v1/images/generate
// @access  Public (but rate limited)
router.get('/generate', imageGenerationLimiter, async (req, res) => {
    try {
        const { prompt, category, contentId, contentType = 'module' } = req.query;

        if (!prompt || !category) {
            return res.status(400).json({
                success: false,
                message: 'Prompt and category are required'
            });
        }

        // Generate a content ID if not provided
        const finalContentId = contentId || `${contentType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const result = await imageService.getOrGenerateImage(
            finalContentId,
            prompt,
            category,
            contentType
        );

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        logger.error('Error in image generation endpoint:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate image',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// @desc    Get fallback image for category
// @route   GET /api/v1/images/fallback/:category
// @access  Public
router.get('/fallback/:category', (req, res) => {
    try {
        const { category } = req.params;
        const fallbackUrl = imageService.getFallbackImage(category);

        // Redirect to the fallback image
        res.redirect(fallbackUrl);
    } catch (error) {
        logger.error('Error getting fallback image:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get fallback image'
        });
    }
});

// @desc    Get image statistics
// @route   GET /api/v1/images/stats
// @access  Private/Admin
router.get('/stats', protect, authorize('admin'), async (req, res) => {
    try {
        const [imageStats, cacheStats] = await Promise.all([
            imageService.getImageStats(),
            imageCacheService.getCacheStats()
        ]);

        res.json({
            success: true,
            data: {
                images: imageStats,
                cache: cacheStats
            }
        });
    } catch (error) {
        logger.error('Error getting image stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get image statistics'
        });
    }
});

// @desc    Regenerate image for content
// @route   POST /api/v1/images/regenerate
// @access  Private/Admin
router.post('/regenerate', protect, authorize('admin'), async (req, res) => {
    try {
        const { contentId, prompt, category, contentType = 'module' } = req.body;

        if (!contentId || !prompt || !category) {
            return res.status(400).json({
                success: false,
                message: 'Content ID, prompt, and category are required'
            });
        }

        const imageUrl = await imageService.regenerateImage(
            contentId,
            prompt,
            category,
            contentType
        );

        res.json({
            success: true,
            data: { url: imageUrl },
            message: 'Image regenerated successfully'
        });

    } catch (error) {
        logger.error('Error regenerating image:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to regenerate image'
        });
    }
});

// @desc    Clear image cache
// @route   DELETE /api/v1/images/cache
// @access  Private/Admin
router.delete('/cache', protect, authorize('admin'), async (req, res) => {
    try {
        const { contentId, all } = req.query;

        let deletedCount = 0;

        if (all === 'true') {
            deletedCount = await imageCacheService.clearAllCache();
        } else if (contentId) {
            const success = await imageCacheService.invalidateCache(contentId);
            deletedCount = success ? 1 : 0;
        } else {
            // Clean up expired cache entries
            deletedCount = await imageCacheService.cleanupOldCache();
        }

        res.json({
            success: true,
            data: { deletedCount },
            message: `Cleared ${deletedCount} cache entries`
        });

    } catch (error) {
        logger.error('Error clearing image cache:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to clear image cache'
        });
    }
});

// @desc    Update cache expiration
// @route   PUT /api/v1/images/cache/:contentId
// @access  Private/Admin
router.put('/cache/:contentId', protect, authorize('admin'), async (req, res) => {
    try {
        const { contentId } = req.params;
        const { durationSeconds } = req.body;

        if (!durationSeconds || durationSeconds < 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid duration in seconds is required'
            });
        }

        const success = await imageCacheService.updateExpiration(contentId, durationSeconds);

        if (!success) {
            return res.status(404).json({
                success: false,
                message: 'Cache entry not found'
            });
        }

        res.json({
            success: true,
            message: 'Cache expiration updated successfully'
        });

    } catch (error) {
        logger.error('Error updating cache expiration:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update cache expiration'
        });
    }
});

// @desc    Get cache size information
// @route   GET /api/v1/images/cache/size
// @access  Private/Admin
router.get('/cache/size', protect, authorize('admin'), async (req, res) => {
    try {
        const sizeInfo = await imageCacheService.getCacheSize();

        res.json({
            success: true,
            data: sizeInfo
        });
    } catch (error) {
        logger.error('Error getting cache size:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get cache size information'
        });
    }
});

module.exports = router;