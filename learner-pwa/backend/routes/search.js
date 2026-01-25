const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const searchService = require('../services/searchService');

/**
 * Search modules
 * GET /api/v1/search/modules
 */
router.get('/modules', async (req, res) => {
    try {
        const { q, category, difficulty, minDuration, maxDuration, tags, page, limit, sortBy } = req.query;

        const filters = {
            category,
            difficulty,
            minDuration: minDuration ? parseInt(minDuration) : undefined,
            maxDuration: maxDuration ? parseInt(maxDuration) : undefined,
            tags: tags ? tags.split(',') : undefined
        };

        const options = {
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 10,
            sortBy: sortBy || 'relevance'
        };

        const result = await searchService.searchModules(q, filters, options);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * Search users (admin only)
 * GET /api/v1/search/users
 */
router.get('/users', protect, authorize('admin'), async (req, res) => {
    try {
        const { q, role, isActive, isVerified, page, limit, sortBy } = req.query;

        const filters = {
            role,
            isActive: isActive !== undefined ? isActive === 'true' : undefined,
            isVerified: isVerified !== undefined ? isVerified === 'true' : undefined
        };

        const options = {
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 10,
            sortBy: sortBy || 'name'
        };

        const result = await searchService.searchUsers(q, filters, options);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * Search certificates
 * GET /api/v1/search/certificates
 */
router.get('/certificates', protect, async (req, res) => {
    try {
        const { q, status, grade, page, limit, sortBy } = req.query;

        const filters = {
            userId: req.user.role === 'admin' ? undefined : req.user.id,
            status,
            grade
        };

        const options = {
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 10,
            sortBy: sortBy || 'newest'
        };

        const result = await searchService.searchCertificates(q, filters, options);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * Global search
 * GET /api/v1/search/global
 */
router.get('/global', async (req, res) => {
    try {
        const { q, limit } = req.query;

        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const options = {
            limit: limit ? parseInt(limit) : 5
        };

        const result = await searchService.globalSearch(q, options);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * Get search suggestions (autocomplete)
 * GET /api/v1/search/suggestions
 */
router.get('/suggestions', async (req, res) => {
    try {
        const { q, type, limit } = req.query;

        if (!q) {
            return res.json({ success: true, data: [] });
        }

        const result = await searchService.getSuggestions(
            q,
            type || 'modules',
            limit ? parseInt(limit) : 5
        );

        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * Get popular searches
 * GET /api/v1/search/popular
 */
router.get('/popular', async (req, res) => {
    try {
        const { limit } = req.query;
        const result = await searchService.getPopularSearches(limit ? parseInt(limit) : 10);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * Get search filters metadata
 * GET /api/v1/search/filters
 */
router.get('/filters', async (req, res) => {
    try {
        const result = await searchService.getSearchFilters();
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
