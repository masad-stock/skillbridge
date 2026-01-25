const ImageMetadata = require('../models/ImageMetadata');
const logger = require('../utils/logger');

/**
 * Image Cache Service
 * Manages caching of image URLs and metadata
 */
class ImageCacheService {
    constructor() {
        this.cacheDuration = parseInt(process.env.IMAGE_CACHE_DURATION || '604800'); // 7 days default
    }

    /**
     * Cache an image URL with metadata
     * @param {string} key - Cache key (usually contentId)
     * @param {string} url - Image URL
     * @param {Object} metadata - Additional metadata
     * @returns {Promise<Object>} Cached image metadata
     */
    async cacheImage(key, url, metadata = {}) {
        try {
            const expiresAt = new Date(Date.now() + this.cacheDuration * 1000);

            const imageMetadata = await ImageMetadata.findOneAndUpdate(
                { contentId: key },
                {
                    contentId: key,
                    imageUrl: url,
                    expiresAt,
                    ...metadata,
                    generatedAt: new Date()
                },
                { upsert: true, new: true }
            );

            logger.info(`Cached image for ${key}`);
            return imageMetadata;
        } catch (error) {
            logger.error(`Error caching image for ${key}:`, error);
            throw error;
        }
    }

    /**
     * Get cached image by key
     * @param {string} key - Cache key
     * @returns {Promise<Object|null>} Cached image or null
     */
    async getCachedImage(key) {
        try {
            const images = await ImageMetadata.findActive({ contentId: key });

            if (images.length === 0) {
                return null;
            }

            const image = images[0];

            // Check if expired
            if (image.expiresAt && image.expiresAt < new Date()) {
                logger.info(`Cache expired for ${key}`);
                await this.invalidateCache(key);
                return null;
            }

            // Update access tracking
            await image.recordAccess();

            return image;
        } catch (error) {
            logger.error(`Error retrieving cached image for ${key}:`, error);
            return null;
        }
    }

    /**
     * Invalidate cache for a specific key
     * @param {string} key - Cache key
     * @returns {Promise<boolean>} Success status
     */
    async invalidateCache(key) {
        try {
            await ImageMetadata.deleteOne({ contentId: key });
            logger.info(`Invalidated cache for ${key}`);
            return true;
        } catch (error) {
            logger.error(`Error invalidating cache for ${key}:`, error);
            return false;
        }
    }

    /**
     * Invalidate multiple cache entries
     * @param {Array<string>} keys - Array of cache keys
     * @returns {Promise<number>} Number of invalidated entries
     */
    async invalidateMultiple(keys) {
        try {
            const result = await ImageMetadata.deleteMany({
                contentId: { $in: keys }
            });
            logger.info(`Invalidated ${result.deletedCount} cache entries`);
            return result.deletedCount;
        } catch (error) {
            logger.error('Error invalidating multiple cache entries:', error);
            return 0;
        }
    }

    /**
     * Cleanup expired cache entries
     * @returns {Promise<number>} Number of deleted entries
     */
    async cleanupOldCache() {
        try {
            const count = await ImageMetadata.cleanupExpired();
            if (count > 0) {
                logger.info(`Cleaned up ${count} expired cache entries`);
            }
            return count;
        } catch (error) {
            logger.error('Error cleaning up old cache:', error);
            return 0;
        }
    }

    /**
     * Get cache statistics
     * @returns {Promise<Object>} Cache statistics
     */
    async getCacheStats() {
        try {
            const total = await ImageMetadata.countDocuments();
            const expired = await ImageMetadata.countDocuments({
                expiresAt: { $exists: true, $ne: null, $lt: new Date() }
            });
            const active = total - expired;

            // Get most accessed images
            const mostAccessed = await ImageMetadata.find()
                .sort({ accessCount: -1 })
                .limit(10)
                .select('contentId contentType accessCount');

            // Get cache by source
            const bySource = await ImageMetadata.aggregate([
                { $group: { _id: '$source', count: { $sum: 1 } } }
            ]);

            // Get cache by content type
            const byContentType = await ImageMetadata.aggregate([
                { $group: { _id: '$contentType', count: { $sum: 1 } } }
            ]);

            return {
                total,
                active,
                expired,
                mostAccessed,
                bySource: bySource.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}),
                byContentType: byContentType.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {})
            };
        } catch (error) {
            logger.error('Error getting cache stats:', error);
            return {
                total: 0,
                active: 0,
                expired: 0,
                mostAccessed: [],
                bySource: {},
                byContentType: {}
            };
        }
    }

    /**
     * Clear all cache entries
     * @returns {Promise<number>} Number of deleted entries
     */
    async clearAllCache() {
        try {
            const result = await ImageMetadata.deleteMany({});
            logger.warn(`Cleared all cache: ${result.deletedCount} entries deleted`);
            return result.deletedCount;
        } catch (error) {
            logger.error('Error clearing all cache:', error);
            return 0;
        }
    }

    /**
     * Update cache expiration for a key
     * @param {string} key - Cache key
     * @param {number} durationSeconds - New duration in seconds
     * @returns {Promise<boolean>} Success status
     */
    async updateExpiration(key, durationSeconds) {
        try {
            const expiresAt = new Date(Date.now() + durationSeconds * 1000);

            await ImageMetadata.findOneAndUpdate(
                { contentId: key },
                { expiresAt }
            );

            logger.info(`Updated expiration for ${key}`);
            return true;
        } catch (error) {
            logger.error(`Error updating expiration for ${key}:`, error);
            return false;
        }
    }

    /**
     * Get cache size estimate
     * @returns {Promise<Object>} Size information
     */
    async getCacheSize() {
        try {
            const images = await ImageMetadata.find().select('metadata.size');
            const totalSize = images.reduce((sum, img) => {
                return sum + (img.metadata?.size || 0);
            }, 0);

            return {
                totalImages: images.length,
                totalSizeBytes: totalSize,
                totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
                averageSizeBytes: images.length > 0 ? Math.round(totalSize / images.length) : 0
            };
        } catch (error) {
            logger.error('Error calculating cache size:', error);
            return {
                totalImages: 0,
                totalSizeBytes: 0,
                totalSizeMB: '0.00',
                averageSizeBytes: 0
            };
        }
    }
}

module.exports = new ImageCacheService();
