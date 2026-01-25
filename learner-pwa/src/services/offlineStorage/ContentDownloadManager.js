/**
 * ContentDownloadManager
 * 
 * Manages downloading course content for offline access with:
 * - Progress tracking
 * - Pause/resume/cancel functionality
 * - Download queue management
 * - Image optimization
 * - Size estimation
 * 
 * Requirements: 2.3, 3.2, 3.4, 3.7
 */

import OfflineStorageManager from './OfflineStorageManager';

class ContentDownloadManager {
    constructor() {
        this.storage = new OfflineStorageManager();
        this.activeDownloads = new Map(); // courseId -> download state
        this.downloadQueue = [];
        this.listeners = new Map(); // event -> callbacks
        this.maxConcurrentDownloads = 2;
    }

    /**
     * Download a course with all its content
     * @param {string} courseId - Course ID to download
     * @param {Object} options - Download options
     * @param {boolean} options.textOnly - Skip images/videos
     * @param {string} options.imageQuality - 'low' | 'medium' | 'high'
     * @returns {Promise<void>}
     */
    async downloadCourse(courseId, options = {}) {
        const {
            textOnly = false,
            imageQuality = 'medium'
        } = options;

        // Check if already downloading
        if (this.activeDownloads.has(courseId)) {
            throw new Error(`Course ${courseId} is already being downloaded`);
        }

        // Initialize download state
        const downloadState = {
            courseId,
            status: 'downloading', // 'downloading' | 'paused' | 'completed' | 'failed' | 'cancelled'
            progress: 0,
            totalBytes: 0,
            downloadedBytes: 0,
            startTime: Date.now(),
            options: { textOnly, imageQuality },
            error: null
        };

        this.activeDownloads.set(courseId, downloadState);
        this.emit('downloadStarted', { courseId, downloadState });

        try {
            // Fetch course data from API
            const response = await fetch(`/api/learning/courses/${courseId}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch course: ${response.statusText}`);
            }

            const courseData = await response.json();

            // Estimate total size
            downloadState.totalBytes = await this.estimateSize(courseData, options);
            this.emit('downloadProgress', { courseId, downloadState });

            // Download text content
            const processedCourse = await this.processTextContent(courseData);
            downloadState.downloadedBytes += this.calculateTextSize(processedCourse);
            downloadState.progress = (downloadState.downloadedBytes / downloadState.totalBytes) * 100;
            this.emit('downloadProgress', { courseId, downloadState });

            // Download images if not text-only
            if (!textOnly && courseData.modules) {
                for (const module of courseData.modules) {
                    // Check if download was paused or cancelled
                    if (downloadState.status !== 'downloading') {
                        return;
                    }

                    await this.downloadModuleImages(module, imageQuality, downloadState);
                }
            }

            // Save to IndexedDB
            await this.storage.saveCourse(courseId, {
                ...processedCourse,
                downloadedAt: new Date().toISOString(),
                downloadOptions: options
            });

            // Mark as completed
            downloadState.status = 'completed';
            downloadState.progress = 100;
            downloadState.completedAt = Date.now();
            this.emit('downloadCompleted', { courseId, downloadState });

        } catch (error) {
            downloadState.status = 'failed';
            downloadState.error = error.message;
            this.emit('downloadFailed', { courseId, error: error.message });
            throw error;
        } finally {
            // Clean up if completed or failed
            if (downloadState.status === 'completed' || downloadState.status === 'failed') {
                setTimeout(() => this.activeDownloads.delete(courseId), 5000);
            }
        }
    }

    /**
     * Pause an active download
     * @param {string} courseId - Course ID
     */
    pauseDownload(courseId) {
        const downloadState = this.activeDownloads.get(courseId);
        if (!downloadState) {
            throw new Error(`No active download for course ${courseId}`);
        }

        if (downloadState.status === 'downloading') {
            downloadState.status = 'paused';
            downloadState.pausedAt = Date.now();
            this.emit('downloadPaused', { courseId, downloadState });
        }
    }

    /**
     * Resume a paused download
     * @param {string} courseId - Course ID
     */
    async resumeDownload(courseId) {
        const downloadState = this.activeDownloads.get(courseId);
        if (!downloadState) {
            throw new Error(`No download state for course ${courseId}`);
        }

        if (downloadState.status === 'paused') {
            downloadState.status = 'downloading';
            downloadState.resumedAt = Date.now();
            this.emit('downloadResumed', { courseId, downloadState });

            // Continue download from where it left off
            await this.downloadCourse(courseId, downloadState.options);
        }
    }

    /**
     * Cancel an active download
     * @param {string} courseId - Course ID
     */
    cancelDownload(courseId) {
        const downloadState = this.activeDownloads.get(courseId);
        if (!downloadState) {
            throw new Error(`No active download for course ${courseId}`);
        }

        downloadState.status = 'cancelled';
        downloadState.cancelledAt = Date.now();
        this.emit('downloadCancelled', { courseId, downloadState });

        // Clean up
        setTimeout(() => this.activeDownloads.delete(courseId), 1000);
    }

    /**
     * Get download progress for a course
     * @param {string} courseId - Course ID
     * @returns {Object|null} Download state or null
     */
    getDownloadProgress(courseId) {
        return this.activeDownloads.get(courseId) || null;
    }

    /**
     * Get all active downloads
     * @returns {Array} Array of download states
     */
    getAllDownloads() {
        return Array.from(this.activeDownloads.values());
    }

    /**
     * Estimate total download size for a course
     * @param {Object} courseData - Course data
     * @param {Object} options - Download options
     * @returns {Promise<number>} Estimated size in bytes
     */
    async estimateSize(courseData, options = {}) {
        const { textOnly = false, imageQuality = 'medium' } = options;

        let totalSize = 0;

        // Text content (approximate)
        totalSize += this.calculateTextSize(courseData);

        // Images
        if (!textOnly && courseData.modules) {
            const imageCount = this.countImages(courseData.modules);
            const imageSizeMap = {
                low: 50 * 1024,      // 50KB per image
                medium: 150 * 1024,  // 150KB per image
                high: 300 * 1024     // 300KB per image
            };
            totalSize += imageCount * (imageSizeMap[imageQuality] || imageSizeMap.medium);
        }

        return totalSize;
    }

    /**
     * Process text content for offline storage
     * @param {Object} courseData - Course data
     * @returns {Object} Processed course data
     */
    async processTextContent(courseData) {
        return {
            ...courseData,
            modules: courseData.modules?.map(module => ({
                ...module,
                // Extract text content
                textContent: this.extractTextContent(module),
                // Extract video transcripts if available
                transcript: module.videoTranscript || this.generateTranscriptPlaceholder(module),
                // Store video metadata without actual video
                videoMetadata: module.videoUrl ? {
                    url: module.videoUrl,
                    duration: module.videoDuration,
                    thumbnail: module.videoThumbnail
                } : null
            }))
        };
    }

    /**
     * Download and optimize images for a module
     * @param {Object} module - Module data
     * @param {string} quality - Image quality level
     * @param {Object} downloadState - Download state to update
     */
    async downloadModuleImages(module, quality, downloadState) {
        const images = this.extractImageUrls(module);

        for (const imageUrl of images) {
            // Check if download is still active
            if (downloadState.status !== 'downloading') {
                return;
            }

            try {
                const optimizedImage = await this.optimizeImage(imageUrl, quality);

                // Update progress
                downloadState.downloadedBytes += optimizedImage.size;
                downloadState.progress = Math.min(
                    (downloadState.downloadedBytes / downloadState.totalBytes) * 100,
                    99 // Cap at 99% until fully saved
                );
                this.emit('downloadProgress', {
                    courseId: downloadState.courseId,
                    downloadState
                });

            } catch (error) {
                console.warn(`Failed to download image ${imageUrl}:`, error);
                // Continue with other images
            }
        }
    }

    /**
     * Optimize image for offline storage
     * @param {string} imageUrl - Image URL
     * @param {string} quality - Quality level
     * @returns {Promise<Object>} Optimized image data
     */
    async optimizeImage(imageUrl, quality) {
        try {
            const response = await fetch(imageUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch image: ${response.statusText}`);
            }

            const blob = await response.blob();

            // Target sizes for each quality level
            const targetSizes = {
                low: 50 * 1024,      // 50KB
                medium: 150 * 1024,  // 150KB
                high: 300 * 1024     // 300KB
            };
            const targetSize = targetSizes[quality] || targetSizes.medium;

            // If image is already smaller than target, return as-is
            if (blob.size <= targetSize) {
                return {
                    url: imageUrl,
                    blob,
                    size: blob.size,
                    targetSize,
                    quality,
                    optimized: false
                };
            }

            // Optimize the image
            const optimizedBlob = await this.resizeAndCompressImage(blob, targetSize, quality);

            return {
                url: imageUrl,
                blob: optimizedBlob,
                size: optimizedBlob.size,
                targetSize,
                quality,
                optimized: true,
                originalSize: blob.size,
                compressionRatio: ((1 - optimizedBlob.size / blob.size) * 100).toFixed(1)
            };

        } catch (error) {
            console.error('Image optimization failed:', error);
            throw error;
        }
    }

    /**
     * Resize and compress image using canvas
     * @param {Blob} blob - Original image blob
     * @param {number} targetSize - Target size in bytes
     * @param {string} quality - Quality level
     * @returns {Promise<Blob>} Optimized image blob
     */
    async resizeAndCompressImage(blob, targetSize, quality) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const objectUrl = URL.createObjectURL(blob);

            img.onload = async () => {
                try {
                    // Calculate dimensions based on quality
                    const scaleFactor = {
                        low: 0.5,    // 50% of original
                        medium: 0.7, // 70% of original
                        high: 0.9    // 90% of original
                    }[quality] || 0.7;

                    let width = Math.floor(img.width * scaleFactor);
                    let height = Math.floor(img.height * scaleFactor);

                    // Create canvas
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');

                    // Enable image smoothing for better quality
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';

                    // Draw resized image
                    ctx.drawImage(img, 0, 0, width, height);

                    // Try WebP first (better compression)
                    if (this.supportsWebP()) {
                        const webpBlob = await this.canvasToBlob(canvas, 'image/webp', targetSize);
                        if (webpBlob && webpBlob.size <= targetSize * 1.2) { // Allow 20% tolerance
                            URL.revokeObjectURL(objectUrl);
                            resolve(webpBlob);
                            return;
                        }
                    }

                    // Fallback to JPEG
                    const jpegBlob = await this.canvasToBlob(canvas, 'image/jpeg', targetSize);
                    URL.revokeObjectURL(objectUrl);
                    resolve(jpegBlob);

                } catch (error) {
                    URL.revokeObjectURL(objectUrl);
                    reject(error);
                }
            };

            img.onerror = () => {
                URL.revokeObjectURL(objectUrl);
                reject(new Error('Failed to load image'));
            };

            img.src = objectUrl;
        });
    }

    /**
     * Convert canvas to blob with quality adjustment
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @param {string} mimeType - Image MIME type
     * @param {number} targetSize - Target size in bytes
     * @returns {Promise<Blob>} Compressed image blob
     */
    async canvasToBlob(canvas, mimeType, targetSize) {
        // Start with high quality and reduce if needed
        let qualityLevel = 0.9;
        let blob = null;
        let attempts = 0;
        const maxAttempts = 5;

        while (attempts < maxAttempts) {
            blob = await new Promise(resolve => {
                canvas.toBlob(resolve, mimeType, qualityLevel);
            });

            // If size is acceptable, return
            if (blob.size <= targetSize * 1.2 || attempts === maxAttempts - 1) {
                return blob;
            }

            // Reduce quality for next attempt
            qualityLevel -= 0.15;
            attempts++;
        }

        return blob;
    }

    /**
     * Check if browser supports WebP
     * @returns {boolean} True if WebP is supported
     */
    supportsWebP() {
        if (this._webpSupport !== undefined) {
            return this._webpSupport;
        }

        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;

        this._webpSupport = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
        return this._webpSupport;
    }

    /**
     * Calculate text content size
     * @param {Object} data - Data object
     * @returns {number} Size in bytes
     */
    calculateTextSize(data) {
        const jsonString = JSON.stringify(data);
        return new Blob([jsonString]).size;
    }

    /**
     * Count images in modules
     * @param {Array} modules - Module array
     * @returns {number} Image count
     */
    countImages(modules) {
        let count = 0;
        modules.forEach(module => {
            count += this.extractImageUrls(module).length;
        });
        return count;
    }

    /**
     * Extract image URLs from module
     * @param {Object} module - Module data
     * @returns {Array<string>} Image URLs
     */
    extractImageUrls(module) {
        const urls = [];

        // Module thumbnail
        if (module.thumbnail) {
            urls.push(module.thumbnail);
        }

        // Images in content
        if (module.content) {
            const imgRegex = /<img[^>]+src="([^">]+)"/g;
            let match;
            while ((match = imgRegex.exec(module.content)) !== null) {
                urls.push(match[1]);
            }
        }

        // Video thumbnail
        if (module.videoThumbnail) {
            urls.push(module.videoThumbnail);
        }

        return urls;
    }

    /**
     * Extract text content from module
     * @param {Object} module - Module data
     * @returns {string} Text content
     */
    extractTextContent(module) {
        let text = '';

        if (module.title) text += module.title + '\n\n';
        if (module.description) text += module.description + '\n\n';
        if (module.content) {
            // Strip HTML tags for text-only version
            text += module.content.replace(/<[^>]*>/g, '');
        }

        return text;
    }

    /**
     * Generate transcript placeholder
     * @param {Object} module - Module data
     * @returns {string} Placeholder text
     */
    generateTranscriptPlaceholder(module) {
        return `Video transcript not available. 
    
Module: ${module.title}
Description: ${module.description || 'No description available'}

This module includes video content that requires an internet connection to view.`;
    }

    /**
     * Add event listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    /**
     * Remove event listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    off(event, callback) {
        if (!this.listeners.has(event)) return;

        const callbacks = this.listeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
            callbacks.splice(index, 1);
        }
    }

    /**
     * Emit event
     * @param {string} event - Event name
     * @param {*} data - Event data
     */
    emit(event, data) {
        if (!this.listeners.has(event)) return;

        this.listeners.get(event).forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in event listener for ${event}:`, error);
            }
        });
    }
}

export default ContentDownloadManager;
