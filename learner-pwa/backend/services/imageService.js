const ImageMetadata = require('../models/ImageMetadata');
const logger = require('../utils/logger');

// Curated fallback images featuring Black/African people for Kiharu Constituency context
// All images must feature Black/African individuals only
const CURATED_IMAGES = {
    hero: [
        'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=1200', // African students learning
        'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=1200', // African woman with laptop
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200', // Diverse team collaboration
        'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200', // Team meeting
        'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200', // Group learning
    ],
    success_female: [
        'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400', // African woman professional
        'https://images.unsplash.com/photo-1589156191108-c762ff4b96ab?w=400', // African businesswoman
        'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400', // African woman smiling
        'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=400', // African woman entrepreneur
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400', // Professional woman
        'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=400', // African woman at work
        'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400', // Business professional
        'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400', // African woman leader
        'https://images.unsplash.com/photo-1573497019236-17f8177b81e8?w=400', // Woman in office
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400', // Professional portrait
    ],
    success_male: [
        'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=400', // African man professional
        'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400', // African businessman
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', // African man portrait
        'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400', // Business professional
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400', // African entrepreneur
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400', // Professional man
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', // Business portrait
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', // Man professional
        'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400', // African professional
        'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=400', // Business man
    ],
    learning: [
        'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=800', // African students
        'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800', // Woman learning
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800', // Group study
        'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800', // Classroom learning
        'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800', // Team collaboration
        'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800', // Education setting
        'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800', // Students studying
        'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800', // Learning environment
        'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800', // Study group
        'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800', // Education
    ],
    business: [
        'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800', // African business meeting
        'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800', // Business woman
        'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800', // Team meeting
        'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800', // Business collaboration
        'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800', // Office work
        'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800', // Business presentation
        'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800', // Team work
        'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800', // Business discussion
        'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800', // Professional meeting
        'https://images.unsplash.com/photo-1556761175-129418cb2dfe?w=800', // Office collaboration
    ],
    basic_digital: [
        'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800', // Woman with laptop
        'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=800', // Digital learning
        'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800', // Tech education
    ],
    business_automation: [
        'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800', // Business automation
        'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800', // Team automation
    ],
    digital_marketing: [
        'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800', // Marketing team
        'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800', // Digital marketing
    ],
    financial_management: [
        'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800', // Financial discussion
        'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800', // Finance meeting
    ],
    e_commerce: [
        'https://images.unsplash.com/photo-1556761175-129418cb2dfe?w=800', // E-commerce work
        'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800', // Online business
    ],
    default: [
        'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=800', // Default learning
        'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800', // Default professional
    ]
};

// African-focused search terms for Unsplash queries
const AFRICAN_FILTER_TERMS = [
    'african',
    'black professional',
    'kenya',
    'african business',
    'african entrepreneur',
    'african student',
    'african woman',
    'african man'
];

// Legacy fallback images (kept for backward compatibility)
const FALLBACK_IMAGES = {
    'basic_digital': CURATED_IMAGES.basic_digital[0],
    'business_automation': CURATED_IMAGES.business_automation[0],
    'digital_marketing': CURATED_IMAGES.digital_marketing[0],
    'financial_management': CURATED_IMAGES.financial_management[0],
    'e_commerce': CURATED_IMAGES.e_commerce[0],
    'default': CURATED_IMAGES.default[0],
    'hero': CURATED_IMAGES.hero[0]
};

class ImageService {
    constructor() {
        this.unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY;
        this.imageGenerationEnabled = process.env.IMAGE_GENERATION_ENABLED !== 'false';
        this.cacheDuration = parseInt(process.env.IMAGE_CACHE_DURATION || '604800'); // 7 days default
    }

    /**
     * Get or generate an image for content
     * @param {string} contentId - Unique identifier for the content
     * @param {string} prompt - Text prompt for image search
     * @param {string} category - Content category
     * @param {string} contentType - Type of content (module, hero, category, custom)
     * @returns {Promise<{url: string, cached: boolean}>}
     */
    async getOrGenerateImage(contentId, prompt, category, contentType = 'module') {
        try {
            // Check if image already exists in database
            const cached = await this.getCachedImage(contentId);
            if (cached) {
                logger.info(`Using cached image for ${contentId}`);
                // Update access count
                await cached.recordAccess();
                return { url: cached.imageUrl, cached: true };
            }

            // Generate new image if enabled
            if (this.imageGenerationEnabled && this.unsplashAccessKey) {
                const imageUrl = await this.generateImage(prompt, category);

                // Store in database
                await this.storeImageMetadata(contentId, imageUrl, prompt, category, contentType, 'unsplash');

                logger.info(`Generated new image for ${contentId}`);
                return { url: imageUrl, cached: false };
            }

            // Fall back to placeholder
            const fallbackUrl = this.getFallbackImage(category);
            logger.info(`Using fallback image for ${contentId}`);
            return { url: fallbackUrl, cached: false };

        } catch (error) {
            logger.error(`Error getting/generating image for ${contentId}:`, error);
            return { url: this.getFallbackImage(category), cached: false };
        }
    }

    /**
     * Build search query with African representation filter
     * @param {string} prompt - Original search prompt
     * @param {string} category - Content category
     * @returns {string} Enhanced search query
     */
    buildSearchQuery(prompt, category) {
        // Select a random African filter term for variety
        const africanTerm = AFRICAN_FILTER_TERMS[Math.floor(Math.random() * AFRICAN_FILTER_TERMS.length)];
        return `${africanTerm} ${prompt} ${category} education learning digital skills`;
    }

    /**
     * Generate image using Unsplash API with African representation filter
     * @param {string} prompt - Search query
     * @param {string} category - Content category
     * @returns {Promise<string>} Image URL
     */
    async generateImage(prompt, category) {
        try {
            if (!this.unsplashAccessKey) {
                throw new Error('Unsplash API key not configured');
            }

            // Build search query with African filter terms
            const query = this.buildSearchQuery(prompt, category);
            const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Client-ID ${this.unsplashAccessKey}`
                }
            });

            if (!response.ok) {
                throw new Error(`Unsplash API error: ${response.status}`);
            }

            const data = await response.json();

            if (data.results && data.results.length > 0) {
                // Return a random image from results for variety
                const randomIndex = Math.floor(Math.random() * data.results.length);
                return data.results[randomIndex].urls.regular;
            }

            // If no results with African filter, try with simpler African query
            const simpleQuery = `african ${category} education`;
            const simpleUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(simpleQuery)}&per_page=3&orientation=landscape`;

            const simpleResponse = await fetch(simpleUrl, {
                headers: {
                    'Authorization': `Client-ID ${this.unsplashAccessKey}`
                }
            });

            if (simpleResponse.ok) {
                const simpleData = await simpleResponse.json();
                if (simpleData.results && simpleData.results.length > 0) {
                    const randomIndex = Math.floor(Math.random() * simpleData.results.length);
                    return simpleData.results[randomIndex].urls.regular;
                }
            }

            // Fall back to curated images if Unsplash returns no African results
            logger.info(`No African images found on Unsplash for "${prompt}", using curated fallback`);
            return this.getFallbackImage(category);

        } catch (error) {
            logger.error('Error generating image from Unsplash:', error);
            throw error;
        }
    }

    /**
     * Get cached image from database
     * @param {string} contentId - Content identifier
     * @returns {Promise<Object|null>} Image metadata or null
     */
    async getCachedImage(contentId) {
        try {
            const images = await ImageMetadata.findActive({ contentId });
            return images.length > 0 ? images[0] : null;
        } catch (error) {
            logger.error(`Error retrieving cached image for ${contentId}:`, error);
            return null;
        }
    }

    /**
     * Store image metadata in database
     * @param {string} contentId - Content identifier
     * @param {string} imageUrl - Image URL
     * @param {string} prompt - Search prompt used
     * @param {string} category - Content category
     * @param {string} contentType - Type of content
     * @param {string} source - Image source (unsplash, dalle, etc.)
     * @returns {Promise<Object>} Stored image metadata
     */
    async storeImageMetadata(contentId, imageUrl, prompt, category, contentType, source) {
        try {
            const expiresAt = new Date(Date.now() + this.cacheDuration * 1000);

            const imageMetadata = await ImageMetadata.findOneAndUpdate(
                { contentId },
                {
                    contentId,
                    contentType,
                    imageUrl,
                    prompt,
                    category,
                    source,
                    expiresAt,
                    generatedAt: new Date(),
                    accessCount: 0
                },
                { upsert: true, new: true }
            );

            return imageMetadata;
        } catch (error) {
            logger.error('Error storing image metadata:', error);
            throw error;
        }
    }

    /**
     * Regenerate image for content
     * @param {string} contentId - Content identifier
     * @param {string} newPrompt - New search prompt
     * @param {string} category - Content category
     * @param {string} contentType - Type of content
     * @returns {Promise<string>} New image URL
     */
    async regenerateImage(contentId, newPrompt, category, contentType = 'module') {
        try {
            // Delete old image metadata
            await ImageMetadata.deleteOne({ contentId });

            // Generate new image
            const imageUrl = await this.generateImage(newPrompt, category);

            // Store new metadata
            await this.storeImageMetadata(contentId, imageUrl, newPrompt, category, contentType, 'unsplash');

            logger.info(`Regenerated image for ${contentId}`);
            return imageUrl;

        } catch (error) {
            logger.error(`Error regenerating image for ${contentId}:`, error);
            throw error;
        }
    }

    /**
     * Get fallback image for category from curated library
     * @param {string} category - Content category
     * @returns {string} Fallback image URL featuring Black/African individuals
     */
    getFallbackImage(category) {
        // Get curated images for the category
        const categoryImages = CURATED_IMAGES[category] || CURATED_IMAGES.default;

        // Return a random image from the curated collection for variety
        const randomIndex = Math.floor(Math.random() * categoryImages.length);
        return categoryImages[randomIndex];
    }

    /**
     * Get curated image by category and type
     * @param {string} category - Image category (hero, success_female, success_male, learning, business)
     * @param {number} index - Optional specific index, otherwise random
     * @returns {string} Curated image URL
     */
    getCuratedImage(category, index = null) {
        const images = CURATED_IMAGES[category] || CURATED_IMAGES.default;
        const selectedIndex = index !== null ? index % images.length : Math.floor(Math.random() * images.length);
        return images[selectedIndex];
    }

    /**
     * Get all curated images for a category
     * @param {string} category - Image category
     * @returns {string[]} Array of curated image URLs
     */
    getCuratedImagesByCategory(category) {
        return CURATED_IMAGES[category] || CURATED_IMAGES.default;
    }

    /**
     * Cleanup expired images
     * @returns {Promise<number>} Number of deleted images
     */
    async cleanupExpiredImages() {
        try {
            const count = await ImageMetadata.cleanupExpired();
            logger.info(`Cleaned up ${count} expired images`);
            return count;
        } catch (error) {
            logger.error('Error cleaning up expired images:', error);
            return 0;
        }
    }

    /**
     * Get image statistics
     * @returns {Promise<Object>} Image statistics
     */
    async getImageStats() {
        try {
            const total = await ImageMetadata.countDocuments();
            const bySource = await ImageMetadata.aggregate([
                { $group: { _id: '$source', count: { $sum: 1 } } }
            ]);
            const byCategory = await ImageMetadata.aggregate([
                { $group: { _id: '$category', count: { $sum: 1 } } }
            ]);

            return {
                total,
                bySource: bySource.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}),
                byCategory: byCategory.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {})
            };
        } catch (error) {
            logger.error('Error getting image stats:', error);
            return { total: 0, bySource: {}, byCategory: {} };
        }
    }
}

module.exports = new ImageService();
