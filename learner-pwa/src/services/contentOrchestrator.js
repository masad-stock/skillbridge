/**
 * Content Orchestrator Service
 * 
 * Central system to coordinate video and text content loading
 * Implements parallel loading with proper synchronization
 * Provides unified error handling across all content types
 */

import contentErrorLogger from './contentErrorLogger';

class ContentOrchestrator {
    constructor() {
        this.loadingStates = new Map();
        this.contentCache = new Map();
        this.loadingPromises = new Map();
        this.retryConfig = {
            maxRetries: 3,
            retryDelay: 1000,
            backoffMultiplier: 2
        };
    }

    /**
     * Orchestrate loading of all content types for a lesson
     */
    async loadLessonContent(lessonData, options = {}) {
        const startTime = performance.now();
        const orchestrationId = this.generateOrchestrationId(lessonData.moduleId, lessonData.lessonId);

        // Initialize loading state
        this.initializeLoadingState(orchestrationId, lessonData);

        try {
            // Determine content types to load
            const contentTypes = this.identifyContentTypes(lessonData);

            // Create loading promises for parallel execution
            const loadingPromises = this.createLoadingPromises(lessonData, contentTypes, options);

            // Execute parallel loading with progress tracking
            const results = await this.executeParallelLoading(
                orchestrationId,
                loadingPromises,
                options.onProgress
            );

            // Synchronize content and validate completeness
            const synchronizedContent = await this.synchronizeContent(results, lessonData);

            // Calculate metrics
            const endTime = performance.now();
            const orchestrationMetrics = {
                moduleId: lessonData.moduleId,
                lessonId: lessonData.lessonId,
                startTime,
                endTime,
                contentTypes,
                parallelLoading: true,
                syncSuccess: synchronizedContent.success,
                loadOrder: results.loadOrder,
                bottleneck: results.bottleneck,
                userFeedback: !!options.onProgress
            };

            // Log orchestration metrics
            await contentErrorLogger.logOrchestrationMetrics(orchestrationMetrics);

            // Update loading state
            this.updateLoadingState(orchestrationId, 'completed', synchronizedContent);

            return {
                success: true,
                content: synchronizedContent,
                metrics: orchestrationMetrics,
                orchestrationId
            };

        } catch (error) {
            // Handle orchestration failure
            const errorData = {
                type: 'orchestration',
                severity: 'high',
                message: `Content orchestration failed: ${error.message}`,
                moduleId: lessonData.moduleId,
                lessonId: lessonData.lessonId,
                errorCode: 'ORCHESTRATION_FAILURE',
                stackTrace: error.stack
            };

            await contentErrorLogger.logError(errorData);
            this.updateLoadingState(orchestrationId, 'failed', { error: errorData });

            throw error;
        }
    }

    /**
     * Create loading promises for different content types
     */
    createLoadingPromises(lessonData, contentTypes, options) {
        const promises = {};

        // Video content loading
        if (contentTypes.includes('video') && lessonData.youtubeUrl) {
            promises.video = this.loadVideoContent(lessonData, options);
        }

        // Text content loading
        if (contentTypes.includes('text') && lessonData.textContent) {
            promises.text = this.loadTextContent(lessonData, options);
        }

        // Image content loading
        if (contentTypes.includes('images') && lessonData.images) {
            promises.images = this.loadImageContent(lessonData, options);
        }

        // Interactive content loading
        if (contentTypes.includes('interactive') && lessonData.questions) {
            promises.interactive = this.loadInteractiveContent(lessonData, options);
        }

        return promises;
    }

    /**
     * Execute parallel loading with progress tracking
     */
    async executeParallelLoading(orchestrationId, loadingPromises, onProgress) {
        const results = {};
        const loadOrder = [];
        let bottleneck = null;
        let slowestLoadTime = 0;

        // Track progress for each content type
        const progressTracker = {};
        Object.keys(loadingPromises).forEach(type => {
            progressTracker[type] = { loaded: false, progress: 0, error: null };
        });

        // Execute promises with individual progress tracking
        const promiseEntries = Object.entries(loadingPromises);
        const settledPromises = await Promise.allSettled(
            promiseEntries.map(async ([type, promise]) => {
                const startTime = performance.now();

                try {
                    const result = await promise;
                    const loadTime = performance.now() - startTime;

                    // Track load order and identify bottlenecks
                    loadOrder.push({ type, loadTime, timestamp: Date.now() });
                    if (loadTime > slowestLoadTime) {
                        slowestLoadTime = loadTime;
                        bottleneck = type;
                    }

                    progressTracker[type] = { loaded: true, progress: 100, error: null };

                    // Report progress
                    if (onProgress) {
                        onProgress({
                            orchestrationId,
                            contentType: type,
                            progress: 100,
                            completed: true,
                            overallProgress: this.calculateOverallProgress(progressTracker)
                        });
                    }

                    return { type, result, loadTime };
                } catch (error) {
                    progressTracker[type] = { loaded: false, progress: 0, error };

                    // Report error progress
                    if (onProgress) {
                        onProgress({
                            orchestrationId,
                            contentType: type,
                            progress: 0,
                            completed: false,
                            error: error.message,
                            overallProgress: this.calculateOverallProgress(progressTracker)
                        });
                    }

                    throw error;
                }
            })
        );

        // Process results
        settledPromises.forEach((settled, index) => {
            const [type] = promiseEntries[index];

            if (settled.status === 'fulfilled') {
                results[type] = settled.value.result;
            } else {
                results[type] = { error: settled.reason };
            }
        });

        return {
            results,
            loadOrder: loadOrder.sort((a, b) => a.timestamp - b.timestamp),
            bottleneck,
            progressTracker
        };
    }

    /**
     * Load video content with error handling and retry logic
     */
    async loadVideoContent(lessonData, options) {
        const cacheKey = `video_${lessonData.moduleId}_${lessonData.lessonId}`;

        // Check cache first
        if (this.contentCache.has(cacheKey) && !options.forceReload) {
            return this.contentCache.get(cacheKey);
        }

        const startTime = performance.now();
        let retryCount = 0;

        while (retryCount <= this.retryConfig.maxRetries) {
            try {
                // Validate video URL
                const videoId = this.extractYouTubeVideoId(lessonData.youtubeUrl);
                if (!videoId) {
                    throw new Error('Invalid YouTube URL format');
                }

                // Simulate video loading (in real implementation, this would check video accessibility)
                await this.simulateVideoLoad(lessonData.youtubeUrl);

                const loadTime = performance.now() - startTime;
                const videoContent = {
                    type: 'video',
                    url: lessonData.youtubeUrl,
                    videoId,
                    title: lessonData.title,
                    duration: lessonData.duration,
                    loadTime,
                    cached: false,
                    retryCount
                };

                // Cache the result
                this.contentCache.set(cacheKey, videoContent);

                // Log metrics
                await contentErrorLogger.logVideoError({
                    moduleId: lessonData.moduleId,
                    lessonId: lessonData.lessonId,
                    videoUrl: lessonData.youtubeUrl,
                    loadTime,
                    retryAttempts: retryCount,
                    success: true
                });

                return videoContent;

            } catch (error) {
                retryCount++;

                if (retryCount > this.retryConfig.maxRetries) {
                    // Log final failure
                    await contentErrorLogger.logVideoError({
                        moduleId: lessonData.moduleId,
                        lessonId: lessonData.lessonId,
                        videoUrl: lessonData.youtubeUrl,
                        errorCode: 'VIDEO_LOAD_FAILED',
                        message: error.message,
                        retryAttempts: retryCount - 1,
                        stackTrace: error.stack
                    });

                    throw new Error(`Video loading failed after ${this.retryConfig.maxRetries} retries: ${error.message}`);
                }

                // Wait before retry
                const delay = this.retryConfig.retryDelay * Math.pow(this.retryConfig.backoffMultiplier, retryCount - 1);
                await this.delay(delay);
            }
        }
    }

    /**
     * Load text content with formatting validation
     */
    async loadTextContent(lessonData, options) {
        const cacheKey = `text_${lessonData.moduleId}_${lessonData.lessonId}`;

        // Check cache first
        if (this.contentCache.has(cacheKey) && !options.forceReload) {
            return this.contentCache.get(cacheKey);
        }

        const startTime = performance.now();

        try {
            // Validate and process text content
            const processedContent = await this.processTextContent(lessonData.textContent);
            const loadTime = performance.now() - startTime;

            const textContent = {
                type: 'text',
                content: processedContent.content,
                wordCount: processedContent.wordCount,
                hasFormatting: processedContent.hasFormatting,
                readingTime: processedContent.estimatedReadingTime,
                loadTime,
                cached: false
            };

            // Cache the result
            this.contentCache.set(cacheKey, textContent);

            // Log metrics
            await contentErrorLogger.logTextError({
                moduleId: lessonData.moduleId,
                lessonId: lessonData.lessonId,
                loadTime,
                success: true
            });

            return textContent;

        } catch (error) {
            await contentErrorLogger.logTextError({
                moduleId: lessonData.moduleId,
                lessonId: lessonData.lessonId,
                errorCode: 'TEXT_PROCESSING_FAILED',
                message: error.message,
                stackTrace: error.stack
            });

            throw error;
        }
    }

    /**
     * Load image content with optimization
     */
    async loadImageContent(lessonData, options) {
        const cacheKey = `images_${lessonData.moduleId}_${lessonData.lessonId}`;

        if (this.contentCache.has(cacheKey) && !options.forceReload) {
            return this.contentCache.get(cacheKey);
        }

        const startTime = performance.now();

        try {
            const imagePromises = lessonData.images.map(async (imageUrl, index) => {
                return await this.loadSingleImage(imageUrl, index);
            });

            const imageResults = await Promise.allSettled(imagePromises);
            const loadTime = performance.now() - startTime;

            const successfulImages = imageResults
                .filter(result => result.status === 'fulfilled')
                .map(result => result.value);

            const failedImages = imageResults
                .filter(result => result.status === 'rejected')
                .map((result, index) => ({ index, error: result.reason.message }));

            const imageContent = {
                type: 'images',
                images: successfulImages,
                failedImages,
                totalImages: lessonData.images.length,
                successfulCount: successfulImages.length,
                loadTime,
                cached: false
            };

            this.contentCache.set(cacheKey, imageContent);

            return imageContent;

        } catch (error) {
            throw new Error(`Image loading failed: ${error.message}`);
        }
    }

    /**
     * Load interactive content (quizzes, exercises)
     */
    async loadInteractiveContent(lessonData, options) {
        const cacheKey = `interactive_${lessonData.moduleId}_${lessonData.lessonId}`;

        if (this.contentCache.has(cacheKey) && !options.forceReload) {
            return this.contentCache.get(cacheKey);
        }

        const startTime = performance.now();

        try {
            // Validate interactive content structure
            const validatedQuestions = await this.validateInteractiveContent(lessonData.questions);
            const loadTime = performance.now() - startTime;

            const interactiveContent = {
                type: 'interactive',
                questions: validatedQuestions.valid,
                invalidQuestions: validatedQuestions.invalid,
                totalQuestions: lessonData.questions.length,
                validCount: validatedQuestions.valid.length,
                loadTime,
                cached: false
            };

            this.contentCache.set(cacheKey, interactiveContent);

            // Log any validation issues
            if (validatedQuestions.invalid.length > 0) {
                await contentErrorLogger.logInteractiveError({
                    moduleId: lessonData.moduleId,
                    lessonId: lessonData.lessonId,
                    errorCode: 'INVALID_QUESTIONS',
                    message: `${validatedQuestions.invalid.length} questions failed validation`,
                    severity: 'medium'
                });
            }

            return interactiveContent;

        } catch (error) {
            await contentErrorLogger.logInteractiveError({
                moduleId: lessonData.moduleId,
                lessonId: lessonData.lessonId,
                errorCode: 'INTERACTIVE_LOAD_FAILED',
                message: error.message,
                stackTrace: error.stack
            });

            throw error;
        }
    }

    /**
     * Synchronize all loaded content and validate completeness
     */
    async synchronizeContent(loadingResults, lessonData) {
        try {
            const { results } = loadingResults;
            const synchronizedContent = {
                moduleId: lessonData.moduleId,
                lessonId: lessonData.lessonId,
                title: lessonData.title,
                success: true,
                contentTypes: Object.keys(results),
                content: {},
                errors: [],
                warnings: []
            };

            // Process each content type
            Object.entries(results).forEach(([type, result]) => {
                if (result.error) {
                    synchronizedContent.errors.push({
                        type,
                        error: result.error.message || result.error
                    });
                    synchronizedContent.success = false;
                } else {
                    synchronizedContent.content[type] = result;
                }
            });

            // Validate content synchronization
            const syncValidation = this.validateContentSynchronization(synchronizedContent);
            if (!syncValidation.valid) {
                synchronizedContent.warnings.push(...syncValidation.warnings);

                // Log sync issues
                await contentErrorLogger.logSyncError({
                    moduleId: lessonData.moduleId,
                    lessonId: lessonData.lessonId,
                    errorCode: 'SYNC_VALIDATION_FAILED',
                    message: 'Content synchronization validation failed',
                    contentTypes: Object.keys(results),
                    severity: 'medium'
                });
            }

            return synchronizedContent;

        } catch (error) {
            await contentErrorLogger.logSyncError({
                moduleId: lessonData.moduleId,
                lessonId: lessonData.lessonId,
                errorCode: 'SYNC_FAILED',
                message: error.message,
                stackTrace: error.stack,
                severity: 'high'
            });

            throw error;
        }
    }

    // Helper methods
    generateOrchestrationId(moduleId, lessonId) {
        return `orch_${moduleId}_${lessonId}_${Date.now()}`;
    }

    initializeLoadingState(orchestrationId, lessonData) {
        this.loadingStates.set(orchestrationId, {
            moduleId: lessonData.moduleId,
            lessonId: lessonData.lessonId,
            status: 'loading',
            startTime: Date.now(),
            contentTypes: this.identifyContentTypes(lessonData),
            progress: {}
        });
    }

    updateLoadingState(orchestrationId, status, data) {
        const state = this.loadingStates.get(orchestrationId);
        if (state) {
            state.status = status;
            state.endTime = Date.now();
            state.data = data;
        }
    }

    identifyContentTypes(lessonData) {
        const types = [];
        if (lessonData.youtubeUrl) types.push('video');
        if (lessonData.textContent) types.push('text');
        if (lessonData.images && lessonData.images.length > 0) types.push('images');
        if (lessonData.questions && lessonData.questions.length > 0) types.push('interactive');
        return types;
    }

    calculateOverallProgress(progressTracker) {
        const types = Object.keys(progressTracker);
        if (types.length === 0) return 0;

        const totalProgress = types.reduce((sum, type) => {
            return sum + progressTracker[type].progress;
        }, 0);

        return Math.round(totalProgress / types.length);
    }

    extractYouTubeVideoId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    async simulateVideoLoad(videoUrl) {
        // Simulate network delay and potential failure
        await this.delay(Math.random() * 1000 + 500);

        // Simulate occasional failures for testing
        if (Math.random() < 0.05) { // 5% failure rate
            throw new Error('Network timeout');
        }
    }

    async processTextContent(textContent) {
        if (!textContent || typeof textContent !== 'string') {
            throw new Error('Invalid text content');
        }

        const words = textContent.trim().split(/\s+/);
        const wordCount = words.length;
        const estimatedReadingTime = Math.ceil(wordCount / 200); // 200 words per minute
        const hasFormatting = /[*_#•\-]/.test(textContent);

        return {
            content: textContent.trim(),
            wordCount,
            estimatedReadingTime,
            hasFormatting
        };
    }

    async loadSingleImage(imageUrl, index) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const startTime = performance.now();

            img.onload = () => {
                resolve({
                    url: imageUrl,
                    index,
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                    loadTime: performance.now() - startTime
                });
            };

            img.onerror = () => {
                reject(new Error(`Failed to load image: ${imageUrl}`));
            };

            // Set timeout for image loading
            setTimeout(() => {
                reject(new Error(`Image load timeout: ${imageUrl}`));
            }, 10000);

            img.src = imageUrl;
        });
    }

    async validateInteractiveContent(questions) {
        const valid = [];
        const invalid = [];

        questions.forEach((question, index) => {
            const validation = {
                index,
                hasQuestion: !!question.question,
                hasOptions: Array.isArray(question.options) && question.options.length > 0,
                hasCorrectAnswer: typeof question.correctAnswer === 'number',
                question: question.question
            };

            if (validation.hasQuestion && validation.hasOptions && validation.hasCorrectAnswer) {
                valid.push(question);
            } else {
                invalid.push({ ...question, validation });
            }
        });

        return { valid, invalid };
    }

    validateContentSynchronization(synchronizedContent) {
        const warnings = [];
        let valid = true;

        // Check for missing critical content
        if (!synchronizedContent.content.video && !synchronizedContent.content.text) {
            warnings.push('No primary content (video or text) available');
            valid = false;
        }

        // Check for content consistency
        if (synchronizedContent.content.video && synchronizedContent.content.text) {
            // Could add more sophisticated checks here
            const videoTitle = synchronizedContent.content.video.title;
            const hasMatchingContent = synchronizedContent.content.text.content.toLowerCase()
                .includes(videoTitle?.toLowerCase() || '');

            if (!hasMatchingContent) {
                warnings.push('Video and text content may not be synchronized');
            }
        }

        return { valid, warnings };
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get loading state for debugging
     */
    getLoadingState(orchestrationId) {
        return this.loadingStates.get(orchestrationId);
    }

    /**
     * Clear cache for specific content or all content
     */
    clearCache(moduleId = null, lessonId = null) {
        if (moduleId && lessonId) {
            // Clear specific lesson cache
            const patterns = [`video_${moduleId}_${lessonId}`, `text_${moduleId}_${lessonId}`,
            `images_${moduleId}_${lessonId}`, `interactive_${moduleId}_${lessonId}`];
            patterns.forEach(pattern => this.contentCache.delete(pattern));
        } else if (moduleId) {
            // Clear module cache
            for (const key of this.contentCache.keys()) {
                if (key.includes(`_${moduleId}_`)) {
                    this.contentCache.delete(key);
                }
            }
        } else {
            // Clear all cache
            this.contentCache.clear();
        }
    }

    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            totalEntries: this.contentCache.size,
            cacheKeys: Array.from(this.contentCache.keys()),
            memoryUsage: this.estimateCacheMemoryUsage()
        };
    }

    estimateCacheMemoryUsage() {
        let totalSize = 0;
        for (const value of this.contentCache.values()) {
            totalSize += JSON.stringify(value).length;
        }
        return `${Math.round(totalSize / 1024)} KB`;
    }
}

// Create singleton instance
const contentOrchestrator = new ContentOrchestrator();

export default contentOrchestrator;