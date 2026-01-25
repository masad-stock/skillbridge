/**
 * Content Error Recovery Service
 * 
 * Implements automatic retry mechanisms for failed content loading
 * Provides fallback content display and user-friendly error messages
 * Includes manual retry options and alternative content access
 */

import contentErrorLogger from './contentErrorLogger';
import contentCacheService from './contentCacheService';

class ContentErrorRecoveryService {
    constructor() {
        this.recoveryStrategies = new Map();
        this.fallbackContent = new Map();
        this.retryQueue = [];
        this.isProcessingRetries = false;
        this.recoveryConfig = {
            maxRetries: 3,
            retryDelay: 1000,
            backoffMultiplier: 2,
            fallbackTimeout: 5000
        };

        // Initialize recovery strategies
        this.initializeRecoveryStrategies();
    }

    /**
     * Initialize recovery strategies for different error types
     */
    initializeRecoveryStrategies() {
        // Video content recovery strategies
        this.recoveryStrategies.set('video', [
            { name: 'retry_with_delay', priority: 1 },
            { name: 'try_different_quality', priority: 2 },
            { name: 'clear_cache_and_retry', priority: 3 },
            { name: 'use_fallback_content', priority: 4 },
            { name: 'provide_external_link', priority: 5 }
        ]);

        // Text content recovery strategies
        this.recoveryStrategies.set('text', [
            { name: 'retry_with_delay', priority: 1 },
            { name: 'use_cached_version', priority: 2 },
            { name: 'use_fallback_content', priority: 3 },
            { name: 'show_placeholder_content', priority: 4 }
        ]);

        // Image content recovery strategies
        this.recoveryStrategies.set('image', [
            { name: 'retry_with_delay', priority: 1 },
            { name: 'use_cached_version', priority: 2 },
            { name: 'use_placeholder_image', priority: 3 },
            { name: 'hide_broken_image', priority: 4 }
        ]);

        // Interactive content recovery strategies
        this.recoveryStrategies.set('interactive', [
            { name: 'retry_with_delay', priority: 1 },
            { name: 'reload_component', priority: 2 },
            { name: 'use_simplified_version', priority: 3 },
            { name: 'show_static_content', priority: 4 }
        ]);

        // Sync/orchestration recovery strategies
        this.recoveryStrategies.set('sync', [
            { name: 'retry_orchestration', priority: 1 },
            { name: 'load_content_sequentially', priority: 2 },
            { name: 'skip_failed_content', priority: 3 },
            { name: 'use_minimal_content', priority: 4 }
        ]);
    }

    /**
     * Attempt to recover from content error
     */
    async recoverFromError(errorData, options = {}) {
        const { type, moduleId, lessonId, errorCode, retryCount = 0 } = errorData;

        try {
            // Get recovery strategies for this error type
            const strategies = this.recoveryStrategies.get(type) || [];

            // Try each strategy in order of priority
            for (const strategy of strategies) {
                try {
                    const result = await this.executeRecoveryStrategy(
                        strategy.name,
                        errorData,
                        options
                    );

                    if (result.success) {
                        // Log successful recovery
                        await contentErrorLogger.logError({
                            type: 'recovery',
                            severity: 'info',
                            message: `Content recovery successful using strategy: ${strategy.name}`,
                            moduleId,
                            lessonId,
                            errorCode: 'RECOVERY_SUCCESS',
                            recoveryStrategy: strategy.name,
                            originalError: errorCode
                        });

                        return {
                            success: true,
                            strategy: strategy.name,
                            content: result.content,
                            message: result.message || 'Content recovered successfully'
                        };
                    }
                } catch (strategyError) {
                    // Log strategy failure but continue to next strategy
                    console.warn(`Recovery strategy ${strategy.name} failed:`, strategyError);
                }
            }

            // All strategies failed
            await contentErrorLogger.logError({
                type: 'recovery',
                severity: 'high',
                message: 'All recovery strategies failed',
                moduleId,
                lessonId,
                errorCode: 'RECOVERY_FAILED',
                originalError: errorCode,
                strategiesAttempted: strategies.map(s => s.name)
            });

            return {
                success: false,
                message: 'Unable to recover content. Please try refreshing the page or contact support.',
                troubleshooting: this.generateTroubleshootingSteps(type, errorCode)
            };

        } catch (error) {
            console.error('Error recovery process failed:', error);
            return {
                success: false,
                message: 'Recovery process encountered an error',
                error: error.message
            };
        }
    }

    /**
     * Execute specific recovery strategy
     */
    async executeRecoveryStrategy(strategyName, errorData, options) {
        switch (strategyName) {
            case 'retry_with_delay':
                return await this.retryWithDelay(errorData, options);

            case 'try_different_quality':
                return await this.tryDifferentQuality(errorData, options);

            case 'clear_cache_and_retry':
                return await this.clearCacheAndRetry(errorData, options);

            case 'use_cached_version':
                return await this.useCachedVersion(errorData, options);

            case 'use_fallback_content':
                return await this.useFallbackContent(errorData, options);

            case 'provide_external_link':
                return await this.provideExternalLink(errorData, options);

            case 'use_placeholder_image':
                return await this.usePlaceholderImage(errorData, options);

            case 'hide_broken_image':
                return await this.hideBrokenImage(errorData, options);

            case 'reload_component':
                return await this.reloadComponent(errorData, options);

            case 'use_simplified_version':
                return await this.useSimplifiedVersion(errorData, options);

            case 'show_static_content':
                return await this.showStaticContent(errorData, options);

            case 'retry_orchestration':
                return await this.retryOrchestration(errorData, options);

            case 'load_content_sequentially':
                return await this.loadContentSequentially(errorData, options);

            case 'skip_failed_content':
                return await this.skipFailedContent(errorData, options);

            case 'use_minimal_content':
                return await this.useMinimalContent(errorData, options);

            case 'show_placeholder_content':
                return await this.showPlaceholderContent(errorData, options);

            default:
                throw new Error(`Unknown recovery strategy: ${strategyName}`);
        }
    }

    /**
     * Retry with exponential backoff delay
     */
    async retryWithDelay(errorData, options) {
        const { retryCount = 0 } = errorData;

        if (retryCount >= this.recoveryConfig.maxRetries) {
            return { success: false, message: 'Maximum retries exceeded' };
        }

        const delay = this.recoveryConfig.retryDelay *
            Math.pow(this.recoveryConfig.backoffMultiplier, retryCount);

        await this.delay(delay);

        // Attempt to reload the content
        if (options.retryFunction) {
            try {
                const result = await options.retryFunction();
                return {
                    success: true,
                    content: result,
                    message: `Content loaded successfully after ${retryCount + 1} retries`
                };
            } catch (error) {
                return { success: false, message: error.message };
            }
        }

        return { success: false, message: 'No retry function provided' };
    }

    /**
     * Try different video quality
     */
    async tryDifferentQuality(errorData, options) {
        if (errorData.type !== 'video') {
            return { success: false, message: 'Not applicable for non-video content' };
        }

        const qualityLevels = ['small', 'medium', 'large'];

        for (const quality of qualityLevels) {
            try {
                if (options.changeQualityFunction) {
                    await options.changeQualityFunction(quality);
                    await this.delay(2000); // Wait for quality change

                    return {
                        success: true,
                        content: { quality },
                        message: `Video quality changed to ${quality}`
                    };
                }
            } catch (error) {
                continue; // Try next quality level
            }
        }

        return { success: false, message: 'Unable to change video quality' };
    }

    /**
     * Clear cache and retry
     */
    async clearCacheAndRetry(errorData, options) {
        const { moduleId, lessonId } = errorData;

        try {
            // Clear relevant cache entries
            await contentCacheService.invalidate(`${moduleId}_${lessonId}`);

            // Wait a moment for cache to clear
            await this.delay(500);

            // Retry loading
            if (options.retryFunction) {
                const result = await options.retryFunction();
                return {
                    success: true,
                    content: result,
                    message: 'Content loaded successfully after cache clear'
                };
            }

            return { success: true, message: 'Cache cleared, please retry manually' };
        } catch (error) {
            return { success: false, message: 'Failed to clear cache' };
        }
    }

    /**
     * Use cached version of content
     */
    async useCachedVersion(errorData, options) {
        const { moduleId, lessonId, type } = errorData;

        try {
            const cacheKey = `${type}_${moduleId}_${lessonId}`;
            const cachedContent = await contentCacheService.get(cacheKey);

            if (cachedContent) {
                return {
                    success: true,
                    content: cachedContent,
                    message: 'Using cached version of content'
                };
            }

            return { success: false, message: 'No cached version available' };
        } catch (error) {
            return { success: false, message: 'Failed to retrieve cached content' };
        }
    }

    /**
     * Use fallback content
     */
    async useFallbackContent(errorData, options) {
        const { moduleId, lessonId, type } = errorData;

        // Check for registered fallback content
        const fallbackKey = `${type}_${moduleId}_${lessonId}`;
        const fallback = this.fallbackContent.get(fallbackKey) ||
            this.fallbackContent.get(`${type}_default`);

        if (fallback) {
            return {
                success: true,
                content: fallback,
                message: 'Using fallback content'
            };
        }

        // Generate generic fallback based on content type
        const genericFallback = this.generateGenericFallback(type, errorData);

        return {
            success: true,
            content: genericFallback,
            message: 'Using generic fallback content'
        };
    }

    /**
     * Provide external link for video content
     */
    async provideExternalLink(errorData, options) {
        if (errorData.type !== 'video' || !errorData.contentUrl) {
            return { success: false, message: 'No external link available' };
        }

        return {
            success: true,
            content: {
                type: 'external_link',
                url: errorData.contentUrl,
                message: 'Watch this video on YouTube',
                linkText: 'Open in YouTube'
            },
            message: 'External video link provided'
        };
    }

    /**
     * Use placeholder image
     */
    async usePlaceholderImage(errorData, options) {
        if (errorData.type !== 'image') {
            return { success: false, message: 'Not applicable for non-image content' };
        }

        const placeholderImage = {
            type: 'placeholder',
            src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBBdmFpbGFibGU8L3RleHQ+PC9zdmc+',
            alt: 'Image not available',
            width: 300,
            height: 200
        };

        return {
            success: true,
            content: placeholderImage,
            message: 'Using placeholder image'
        };
    }

    /**
     * Hide broken image
     */
    async hideBrokenImage(errorData, options) {
        return {
            success: true,
            content: { type: 'hidden', display: 'none' },
            message: 'Broken image hidden'
        };
    }

    /**
     * Reload component
     */
    async reloadComponent(errorData, options) {
        if (options.reloadFunction) {
            try {
                await options.reloadFunction();
                return {
                    success: true,
                    content: { reloaded: true },
                    message: 'Component reloaded successfully'
                };
            } catch (error) {
                return { success: false, message: 'Component reload failed' };
            }
        }

        return { success: false, message: 'No reload function available' };
    }

    /**
     * Use simplified version of interactive content
     */
    async useSimplifiedVersion(errorData, options) {
        if (errorData.type !== 'interactive') {
            return { success: false, message: 'Not applicable for non-interactive content' };
        }

        const simplifiedContent = {
            type: 'simplified_interactive',
            message: 'Interactive content is temporarily unavailable. Please proceed to the next lesson.',
            showContinueButton: true
        };

        return {
            success: true,
            content: simplifiedContent,
            message: 'Using simplified interactive content'
        };
    }

    /**
     * Show static content instead of interactive
     */
    async showStaticContent(errorData, options) {
        const staticContent = {
            type: 'static_message',
            title: 'Content Temporarily Unavailable',
            message: 'This content is currently unavailable. Please try again later or contact support if the problem persists.',
            actions: [
                { label: 'Retry', action: 'retry' },
                { label: 'Continue', action: 'continue' },
                { label: 'Report Issue', action: 'report' }
            ]
        };

        return {
            success: true,
            content: staticContent,
            message: 'Showing static content'
        };
    }

    /**
     * Retry orchestration with different strategy
     */
    async retryOrchestration(errorData, options) {
        if (options.orchestrationRetryFunction) {
            try {
                const result = await options.orchestrationRetryFunction('sequential');
                return {
                    success: true,
                    content: result,
                    message: 'Content orchestration retried successfully'
                };
            } catch (error) {
                return { success: false, message: 'Orchestration retry failed' };
            }
        }

        return { success: false, message: 'No orchestration retry function available' };
    }

    /**
     * Load content sequentially instead of parallel
     */
    async loadContentSequentially(errorData, options) {
        if (options.sequentialLoadFunction) {
            try {
                const result = await options.sequentialLoadFunction();
                return {
                    success: true,
                    content: result,
                    message: 'Content loaded sequentially'
                };
            } catch (error) {
                return { success: false, message: 'Sequential loading failed' };
            }
        }

        return { success: false, message: 'No sequential load function available' };
    }

    /**
     * Skip failed content and continue with available content
     */
    async skipFailedContent(errorData, options) {
        return {
            success: true,
            content: {
                type: 'partial_content',
                message: 'Some content is temporarily unavailable but you can continue with the available materials.',
                skipFailedContent: true
            },
            message: 'Skipping failed content'
        };
    }

    /**
     * Use minimal content version
     */
    async useMinimalContent(errorData, options) {
        const minimalContent = {
            type: 'minimal',
            title: errorData.title || 'Lesson Content',
            message: 'A simplified version of this lesson is available.',
            textContent: 'This lesson covers important concepts. Please refer to your course materials or contact your instructor for additional resources.',
            actions: [
                { label: 'Continue to Next Lesson', action: 'continue' },
                { label: 'Try Again', action: 'retry' }
            ]
        };

        return {
            success: true,
            content: minimalContent,
            message: 'Using minimal content version'
        };
    }

    /**
     * Show placeholder content
     */
    async showPlaceholderContent(errorData, options) {
        const placeholderContent = this.generateGenericFallback(errorData.type, errorData);

        return {
            success: true,
            content: placeholderContent,
            message: 'Showing placeholder content'
        };
    }

    /**
     * Register fallback content for specific modules/lessons
     */
    registerFallbackContent(key, content) {
        this.fallbackContent.set(key, content);
    }

    /**
     * Generate generic fallback content
     */
    generateGenericFallback(contentType, errorData) {
        const fallbacks = {
            video: {
                type: 'video_fallback',
                title: errorData.title || 'Video Content',
                message: 'This video is temporarily unavailable.',
                placeholder: '🎥 Video content will be available shortly',
                actions: ['retry', 'continue', 'external_link']
            },
            text: {
                type: 'text_fallback',
                title: errorData.title || 'Lesson Content',
                message: 'Text content is being loaded...',
                placeholder: '📄 Content will appear here when available',
                actions: ['retry', 'continue']
            },
            image: {
                type: 'image_fallback',
                title: 'Image Content',
                message: 'Image is temporarily unavailable',
                placeholder: '🖼️ Image placeholder',
                actions: ['retry', 'hide']
            },
            interactive: {
                type: 'interactive_fallback',
                title: 'Interactive Content',
                message: 'Interactive elements are temporarily unavailable',
                placeholder: '🎯 Interactive content will load when available',
                actions: ['retry', 'continue', 'simplified']
            }
        };

        return fallbacks[contentType] || fallbacks.text;
    }

    /**
     * Generate troubleshooting steps
     */
    generateTroubleshootingSteps(contentType, errorCode) {
        const commonSteps = [
            'Check your internet connection',
            'Refresh the page',
            'Clear your browser cache',
            'Try a different browser',
            'Disable browser extensions temporarily'
        ];

        const specificSteps = {
            video: [
                'Check if YouTube is accessible',
                'Disable ad blockers',
                'Try a different video quality',
                'Enable JavaScript in your browser'
            ],
            text: [
                'Wait a moment and try again',
                'Check if you can access other parts of the course'
            ],
            image: [
                'Check if images are blocked by your browser',
                'Try disabling image optimization extensions'
            ],
            interactive: [
                'Enable JavaScript in your browser',
                'Check if pop-ups are blocked',
                'Try using a desktop browser'
            ]
        };

        return [
            ...commonSteps,
            ...(specificSteps[contentType] || []),
            'Contact technical support if the problem persists'
        ];
    }

    /**
     * Add content to retry queue
     */
    addToRetryQueue(errorData, options) {
        this.retryQueue.push({
            ...errorData,
            options,
            addedAt: Date.now()
        });

        if (!this.isProcessingRetries) {
            this.processRetryQueue();
        }
    }

    /**
     * Process retry queue
     */
    async processRetryQueue() {
        if (this.isProcessingRetries || this.retryQueue.length === 0) {
            return;
        }

        this.isProcessingRetries = true;

        try {
            while (this.retryQueue.length > 0) {
                const item = this.retryQueue.shift();

                // Skip items that are too old
                if (Date.now() - item.addedAt > 300000) { // 5 minutes
                    continue;
                }

                try {
                    await this.recoverFromError(item, item.options);
                    await this.delay(1000); // Delay between retries
                } catch (error) {
                    console.warn('Retry queue processing error:', error);
                }
            }
        } finally {
            this.isProcessingRetries = false;
        }
    }

    /**
     * Get recovery statistics
     */
    getRecoveryStats() {
        return {
            strategiesAvailable: this.recoveryStrategies.size,
            fallbackContentRegistered: this.fallbackContent.size,
            retryQueueLength: this.retryQueue.length,
            isProcessingRetries: this.isProcessingRetries
        };
    }

    // Helper methods
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Create singleton instance
const contentErrorRecovery = new ContentErrorRecoveryService();

export default contentErrorRecovery;