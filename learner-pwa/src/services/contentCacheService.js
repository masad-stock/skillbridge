/**
 * Content Caching Service
 * 
 * Implements browser caching for static content and images
 * Provides intelligent content preloading and offline storage
 * Manages cache invalidation for content updates
 */

import contentErrorLogger from './contentErrorLogger';

class ContentCacheService {
    constructor() {
        this.cache = new Map();
        this.preloadQueue = [];
        this.isPreloading = false;
        this.cacheConfig = {
            maxSize: 50 * 1024 * 1024, // 50MB
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            preloadBatchSize: 3,
            compressionEnabled: true
        };
        this.cacheStats = {
            hits: 0,
            misses: 0,
            evictions: 0,
            totalSize: 0
        };

        // Initialize cache from localStorage
        this.initializeCache();

        // Set up periodic cleanup
        this.setupPeriodicCleanup();
    }

    /**
     * Initialize cache from localStorage
     */
    async initializeCache() {
        try {
            const cacheData = localStorage.getItem('content_cache_index');
            if (cacheData) {
                const cacheIndex = JSON.parse(cacheData);

                // Restore cache entries that haven't expired
                for (const [key, metadata] of Object.entries(cacheIndex)) {
                    if (this.isValidCacheEntry(metadata)) {
                        const content = localStorage.getItem(`cache_${key}`);
                        if (content) {
                            this.cache.set(key, {
                                content: JSON.parse(content),
                                metadata
                            });
                            this.cacheStats.totalSize += metadata.size || 0;
                        }
                    } else {
                        // Remove expired entries
                        localStorage.removeItem(`cache_${key}`);
                    }
                }

                // Update cache index
                this.saveCacheIndex();
            }
        } catch (error) {
            console.warn('[ContentCacheService] Failed to initialize cache:', error);
        }
    }

    /**
     * Get content from cache
     */
    async get(key, options = {}) {
        const cacheEntry = this.cache.get(key);

        if (cacheEntry && this.isValidCacheEntry(cacheEntry.metadata)) {
            this.cacheStats.hits++;

            // Update access time
            cacheEntry.metadata.lastAccessed = Date.now();

            // Log cache hit
            if (options.logMetrics) {
                await contentErrorLogger.logCachingMetrics({
                    moduleId: options.moduleId,
                    lessonId: options.lessonId,
                    hitRate: this.getCacheHitRate(),
                    cacheSize: this.cacheStats.totalSize,
                    operation: 'hit'
                });
            }

            return cacheEntry.content;
        }

        this.cacheStats.misses++;

        // Log cache miss
        if (options.logMetrics) {
            await contentErrorLogger.logCachingMetrics({
                moduleId: options.moduleId,
                lessonId: options.lessonId,
                hitRate: this.getCacheHitRate(),
                missCount: 1,
                operation: 'miss'
            });
        }

        return null;
    }

    /**
     * Store content in cache
     */
    async set(key, content, options = {}) {
        try {
            const serializedContent = JSON.stringify(content);
            const contentSize = new Blob([serializedContent]).size;

            // Check if content fits in cache
            if (contentSize > this.cacheConfig.maxSize * 0.5) {
                throw new Error('Content too large for cache');
            }

            // Ensure cache has space
            await this.ensureCacheSpace(contentSize);

            // Compress content if enabled
            const finalContent = this.cacheConfig.compressionEnabled
                ? await this.compressContent(content)
                : content;

            const metadata = {
                key,
                size: contentSize,
                createdAt: Date.now(),
                lastAccessed: Date.now(),
                expiresAt: Date.now() + (options.maxAge || this.cacheConfig.maxAge),
                contentType: options.contentType || 'unknown',
                moduleId: options.moduleId,
                lessonId: options.lessonId,
                compressed: this.cacheConfig.compressionEnabled,
                version: options.version || 1
            };

            // Store in memory cache
            this.cache.set(key, {
                content: finalContent,
                metadata
            });

            // Store in localStorage
            localStorage.setItem(`cache_${key}`, JSON.stringify(finalContent));

            // Update cache stats
            this.cacheStats.totalSize += contentSize;

            // Save cache index
            this.saveCacheIndex();

            // Log caching metrics
            if (options.logMetrics) {
                await contentErrorLogger.logCachingMetrics({
                    moduleId: options.moduleId,
                    lessonId: options.lessonId,
                    cacheSize: this.cacheStats.totalSize,
                    operation: 'store',
                    contentSize
                });
            }

            return true;

        } catch (error) {
            console.warn('[ContentCacheService] Failed to cache content:', error);
            return false;
        }
    }

    /**
     * Preload content for better performance
     */
    async preloadContent(contentList, options = {}) {
        // Add to preload queue
        const preloadItems = contentList.map(item => ({
            ...item,
            priority: item.priority || 'normal',
            moduleId: options.moduleId,
            lessonId: options.lessonId
        }));

        this.preloadQueue.push(...preloadItems);

        // Sort by priority
        this.preloadQueue.sort((a, b) => {
            const priorityOrder = { high: 3, normal: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });

        // Start preloading if not already running
        if (!this.isPreloading) {
            this.processPreloadQueue();
        }
    }

    /**
     * Process preload queue
     */
    async processPreloadQueue() {
        if (this.isPreloading || this.preloadQueue.length === 0) {
            return;
        }

        this.isPreloading = true;

        try {
            while (this.preloadQueue.length > 0) {
                const batch = this.preloadQueue.splice(0, this.cacheConfig.preloadBatchSize);

                // Process batch in parallel
                const preloadPromises = batch.map(item => this.preloadSingleItem(item));
                await Promise.allSettled(preloadPromises);

                // Small delay between batches to avoid overwhelming the system
                await this.delay(100);
            }
        } catch (error) {
            console.warn('[ContentCacheService] Preload error:', error);
        } finally {
            this.isPreloading = false;
        }
    }

    /**
     * Preload single content item
     */
    async preloadSingleItem(item) {
        try {
            const cacheKey = this.generateCacheKey(item);

            // Check if already cached
            if (this.cache.has(cacheKey)) {
                return;
            }

            // Fetch content based on type
            let content;
            switch (item.type) {
                case 'image':
                    content = await this.preloadImage(item.url);
                    break;
                case 'text':
                    content = await this.preloadText(item.url);
                    break;
                case 'video_metadata':
                    content = await this.preloadVideoMetadata(item.url);
                    break;
                default:
                    content = await this.preloadGeneric(item.url);
            }

            // Cache the content
            await this.set(cacheKey, content, {
                contentType: item.type,
                moduleId: item.moduleId,
                lessonId: item.lessonId,
                logMetrics: true
            });

        } catch (error) {
            console.warn(`[ContentCacheService] Failed to preload ${item.type}:`, error);
        }
    }

    /**
     * Preload image content
     */
    async preloadImage(imageUrl) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const startTime = performance.now();

            img.onload = () => {
                resolve({
                    url: imageUrl,
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                    loadTime: performance.now() - startTime,
                    cached: true
                });
            };

            img.onerror = () => {
                reject(new Error(`Failed to preload image: ${imageUrl}`));
            };

            // Set timeout
            setTimeout(() => {
                reject(new Error(`Image preload timeout: ${imageUrl}`));
            }, 10000);

            img.src = imageUrl;
        });
    }

    /**
     * Preload text content
     */
    async preloadText(textUrl) {
        const response = await fetch(textUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch text: ${response.statusText}`);
        }

        const text = await response.text();
        return {
            url: textUrl,
            content: text,
            size: text.length,
            cached: true
        };
    }

    /**
     * Preload video metadata
     */
    async preloadVideoMetadata(videoUrl) {
        // Extract video ID and basic metadata
        const videoId = this.extractYouTubeVideoId(videoUrl);
        if (!videoId) {
            throw new Error('Invalid video URL');
        }

        return {
            url: videoUrl,
            videoId,
            platform: 'youtube',
            cached: true
        };
    }

    /**
     * Preload generic content
     */
    async preloadGeneric(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch content: ${response.statusText}`);
        }

        const content = await response.text();
        return {
            url,
            content,
            size: content.length,
            cached: true
        };
    }

    /**
     * Invalidate cache entries
     */
    async invalidate(pattern) {
        const keysToRemove = [];

        for (const [key, entry] of this.cache.entries()) {
            if (this.matchesPattern(key, pattern)) {
                keysToRemove.push(key);
                this.cacheStats.totalSize -= entry.metadata.size || 0;
                localStorage.removeItem(`cache_${key}`);
            }
        }

        keysToRemove.forEach(key => this.cache.delete(key));
        this.saveCacheIndex();

        return keysToRemove.length;
    }

    /**
     * Clear all cache
     */
    async clearAll() {
        // Clear memory cache
        this.cache.clear();

        // Clear localStorage cache
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('cache_')) {
                localStorage.removeItem(key);
            }
        });

        // Clear cache index
        localStorage.removeItem('content_cache_index');

        // Reset stats
        this.cacheStats = {
            hits: 0,
            misses: 0,
            evictions: 0,
            totalSize: 0
        };
    }

    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            ...this.cacheStats,
            hitRate: this.getCacheHitRate(),
            size: this.formatBytes(this.cacheStats.totalSize),
            maxSize: this.formatBytes(this.cacheConfig.maxSize),
            utilization: (this.cacheStats.totalSize / this.cacheConfig.maxSize) * 100,
            entryCount: this.cache.size
        };
    }

    /**
     * Get offline content availability
     */
    getOfflineAvailability(moduleId, lessonId) {
        const offlineContent = {
            video: false,
            text: false,
            images: false,
            interactive: false,
            totalSize: 0
        };

        for (const [key, entry] of this.cache.entries()) {
            if (entry.metadata.moduleId === moduleId &&
                (lessonId ? entry.metadata.lessonId === lessonId : true)) {

                const contentType = entry.metadata.contentType;
                if (offlineContent.hasOwnProperty(contentType)) {
                    offlineContent[contentType] = true;
                }
                offlineContent.totalSize += entry.metadata.size || 0;
            }
        }

        return offlineContent;
    }

    // Helper methods
    generateCacheKey(item) {
        return `${item.type}_${item.moduleId || 'global'}_${item.lessonId || 'all'}_${this.hashString(item.url)}`;
    }

    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }

    isValidCacheEntry(metadata) {
        return metadata.expiresAt > Date.now();
    }

    async ensureCacheSpace(requiredSize) {
        while (this.cacheStats.totalSize + requiredSize > this.cacheConfig.maxSize) {
            // Find least recently used entry
            let lruKey = null;
            let lruTime = Date.now();

            for (const [key, entry] of this.cache.entries()) {
                if (entry.metadata.lastAccessed < lruTime) {
                    lruTime = entry.metadata.lastAccessed;
                    lruKey = key;
                }
            }

            if (lruKey) {
                const entry = this.cache.get(lruKey);
                this.cache.delete(lruKey);
                localStorage.removeItem(`cache_${lruKey}`);
                this.cacheStats.totalSize -= entry.metadata.size || 0;
                this.cacheStats.evictions++;
            } else {
                break; // No entries to evict
            }
        }
    }

    async compressContent(content) {
        // Simple compression simulation (in real implementation, use actual compression)
        const compressed = JSON.stringify(content);
        return {
            compressed: true,
            data: compressed,
            originalSize: JSON.stringify(content).length,
            compressedSize: compressed.length
        };
    }

    saveCacheIndex() {
        try {
            const index = {};
            for (const [key, entry] of this.cache.entries()) {
                index[key] = entry.metadata;
            }
            localStorage.setItem('content_cache_index', JSON.stringify(index));
        } catch (error) {
            console.warn('[ContentCacheService] Failed to save cache index:', error);
        }
    }

    setupPeriodicCleanup() {
        // Clean up expired entries every hour
        setInterval(() => {
            this.cleanupExpiredEntries();
        }, 60 * 60 * 1000);
    }

    cleanupExpiredEntries() {
        const expiredKeys = [];

        for (const [key, entry] of this.cache.entries()) {
            if (!this.isValidCacheEntry(entry.metadata)) {
                expiredKeys.push(key);
                this.cacheStats.totalSize -= entry.metadata.size || 0;
                localStorage.removeItem(`cache_${key}`);
            }
        }

        expiredKeys.forEach(key => this.cache.delete(key));

        if (expiredKeys.length > 0) {
            this.saveCacheIndex();
        }
    }

    matchesPattern(key, pattern) {
        if (typeof pattern === 'string') {
            return key.includes(pattern);
        } else if (pattern instanceof RegExp) {
            return pattern.test(key);
        }
        return false;
    }

    getCacheHitRate() {
        const total = this.cacheStats.hits + this.cacheStats.misses;
        return total > 0 ? Math.round((this.cacheStats.hits / total) * 100) : 0;
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    extractYouTubeVideoId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Create singleton instance
const contentCacheService = new ContentCacheService();

export default contentCacheService;