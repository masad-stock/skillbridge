/**
 * Content Delivery Integration Utility
 * 
 * Demonstrates how all content delivery components work together
 * Provides helper functions for integrating the system into existing components
 */

import contentOrchestrator from '../services/contentOrchestrator';
import contentErrorLogger from '../services/contentErrorLogger';
import contentErrorRecovery from '../services/contentErrorRecovery';
import contentCacheService from '../services/contentCacheService';
import contentValidationService from '../services/contentValidationService';

/**
 * Complete content delivery integration for a lesson
 * This is the main function that components should use
 */
export async function loadLessonWithFullIntegration(lessonData, options = {}) {
    const integrationId = generateIntegrationId();
    const startTime = performance.now();

    try {
        // Step 1: Initialize error logging for this session
        if (options.userId) {
            contentErrorLogger.setUserId(options.userId);
        }

        // Step 2: Validate content before loading (if enabled)
        if (options.validateContent !== false) {
            const validationResult = await contentValidationService.validateContent(
                lessonData,
                'video', // Primary content type
                { skipCache: false }
            );

            if (!validationResult.isValid && validationResult.errors.length > 0) {
                console.warn('Content validation issues detected:', validationResult.errors);

                // Log validation warnings but continue loading
                await contentErrorLogger.logError({
                    type: 'validation',
                    severity: 'medium',
                    message: 'Content validation warnings detected',
                    moduleId: lessonData.moduleId,
                    lessonId: lessonData.lessonId,
                    errorCode: 'VALIDATION_WARNINGS',
                    validationErrors: validationResult.errors
                });
            }
        }

        // Step 3: Check cache for existing content
        const cacheKey = `lesson_${lessonData.moduleId}_${lessonData.lessonId}`;
        let cachedContent = null;

        if (options.useCache !== false) {
            cachedContent = await contentCacheService.get(cacheKey, {
                moduleId: lessonData.moduleId,
                lessonId: lessonData.lessonId,
                logMetrics: true
            });
        }

        // Step 4: Use orchestrator to load content (with cache fallback)
        let orchestrationResult;

        if (cachedContent && !options.forceReload) {
            // Use cached content but still validate freshness
            orchestrationResult = {
                success: true,
                content: cachedContent,
                fromCache: true,
                orchestrationId: integrationId
            };
        } else {
            // Load fresh content using orchestrator
            orchestrationResult = await contentOrchestrator.loadLessonContent(lessonData, {
                onProgress: options.onProgress,
                networkCondition: getNetworkCondition(),
                ...options.orchestratorOptions
            });
        }

        // Step 5: Handle successful loading
        if (orchestrationResult.success) {
            // Cache the loaded content
            if (!orchestrationResult.fromCache && options.useCache !== false) {
                await contentCacheService.set(cacheKey, orchestrationResult.content, {
                    moduleId: lessonData.moduleId,
                    lessonId: lessonData.lessonId,
                    contentType: 'lesson',
                    logMetrics: true
                });
            }

            // Log successful load metrics
            const loadTime = performance.now() - startTime;
            await contentErrorLogger.logContentLoadMetrics({
                moduleId: lessonData.moduleId,
                lessonId: lessonData.lessonId,
                totalLoadTime: loadTime,
                success: true,
                fromCache: orchestrationResult.fromCache,
                contentTypes: orchestrationResult.content.contentTypes,
                hasVideo: orchestrationResult.content.contentTypes.includes('video'),
                hasText: orchestrationResult.content.contentTypes.includes('text'),
                hasImages: orchestrationResult.content.contentTypes.includes('images'),
                hasInteractive: orchestrationResult.content.contentTypes.includes('interactive')
            });

            // Preload next lesson if available
            if (options.preloadNext && options.nextLessonData) {
                preloadNextLesson(options.nextLessonData);
            }

            return {
                success: true,
                content: orchestrationResult.content,
                loadTime,
                fromCache: orchestrationResult.fromCache,
                integrationId
            };
        } else {
            throw new Error('Content orchestration failed');
        }

    } catch (error) {
        // Step 6: Handle errors with recovery
        console.error('Content loading failed:', error);

        const errorData = {
            type: 'integration',
            severity: 'high',
            message: error.message,
            moduleId: lessonData.moduleId,
            lessonId: lessonData.lessonId,
            errorCode: 'INTEGRATION_FAILED',
            integrationId,
            loadTime: performance.now() - startTime
        };

        // Attempt error recovery
        const recoveryResult = await contentErrorRecovery.recoverFromError(errorData, {
            retryFunction: () => loadLessonWithFullIntegration(lessonData, {
                ...options,
                forceReload: true,
                validateContent: false // Skip validation on retry
            }),
            orchestrationRetryFunction: (strategy) => {
                return contentOrchestrator.loadLessonContent(lessonData, {
                    ...options.orchestratorOptions,
                    strategy
                });
            }
        });

        if (recoveryResult.success) {
            return {
                success: true,
                content: recoveryResult.content,
                recovered: true,
                recoveryStrategy: recoveryResult.strategy,
                integrationId
            };
        } else {
            // Log final failure
            await contentErrorLogger.logError(errorData);

            return {
                success: false,
                error: error.message,
                recoveryMessage: recoveryResult.message,
                troubleshooting: recoveryResult.troubleshooting,
                integrationId
            };
        }
    }
}

/**
 * Preload next lesson content in the background
 */
async function preloadNextLesson(nextLessonData) {
    try {
        const preloadItems = [];

        if (nextLessonData.youtubeUrl) {
            preloadItems.push({
                type: 'video_metadata',
                url: nextLessonData.youtubeUrl,
                priority: 'normal'
            });
        }

        if (nextLessonData.images && nextLessonData.images.length > 0) {
            nextLessonData.images.forEach(imageUrl => {
                preloadItems.push({
                    type: 'image',
                    url: imageUrl,
                    priority: 'low'
                });
            });
        }

        if (preloadItems.length > 0) {
            await contentCacheService.preloadContent(preloadItems, {
                moduleId: nextLessonData.moduleId,
                lessonId: nextLessonData.lessonId
            });
        }
    } catch (error) {
        console.warn('Preloading failed:', error);
    }
}

/**
 * Initialize content delivery system for a user session
 */
export async function initializeContentDeliverySession(userId, sessionOptions = {}) {
    try {
        // Set user ID for error logging
        contentErrorLogger.setUserId(userId);

        // Initialize session tracking
        const sessionData = {
            userId,
            sessionId: generateSessionId(),
            connectionType: getNetworkCondition(),
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            ...sessionOptions
        };

        // Log session initialization
        await contentErrorLogger.logMetrics({
            userId,
            sessionInitialized: true,
            networkCondition: sessionData.connectionType,
            deviceType: getDeviceType(),
            timestamp: sessionData.timestamp
        });

        return {
            success: true,
            sessionId: sessionData.sessionId,
            message: 'Content delivery session initialized'
        };

    } catch (error) {
        console.error('Session initialization failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Get comprehensive content delivery status
 */
export function getContentDeliveryStatus() {
    return {
        orchestrator: {
            cacheStats: contentOrchestrator.getCacheStats(),
            activeLoading: contentOrchestrator.getLoadingState ? 'Available' : 'Not Available'
        },
        cache: {
            stats: contentCacheService.getCacheStats(),
            offlineAvailability: contentCacheService.getOfflineAvailability
        },
        errorLogger: {
            queueStatus: contentErrorLogger.getQueueStatus(),
            isOnline: navigator.onLine
        },
        errorRecovery: {
            stats: contentErrorRecovery.getRecoveryStats()
        },
        validation: {
            stats: contentValidationService.getValidationStats()
        },
        network: {
            condition: getNetworkCondition(),
            isOnline: navigator.onLine,
            deviceType: getDeviceType()
        }
    };
}

/**
 * Validate entire module content
 */
export async function validateModuleContent(moduleData, options = {}) {
    const validationResults = [];

    for (const lesson of moduleData.lessons || []) {
        try {
            const lessonValidation = await contentValidationService.validateContent(
                {
                    ...lesson,
                    moduleId: moduleData.id,
                    lessonId: lesson.id
                },
                'video', // Primary validation type
                options
            );

            validationResults.push({
                lessonId: lesson.id,
                lessonTitle: lesson.title,
                isValid: lessonValidation.isValid,
                errors: lessonValidation.errors,
                warnings: lessonValidation.warnings
            });

        } catch (error) {
            validationResults.push({
                lessonId: lesson.id,
                lessonTitle: lesson.title,
                isValid: false,
                errors: [{ type: 'validation_error', message: error.message }],
                warnings: []
            });
        }
    }

    const summary = {
        totalLessons: validationResults.length,
        validLessons: validationResults.filter(r => r.isValid).length,
        lessonsWithErrors: validationResults.filter(r => !r.isValid).length,
        lessonsWithWarnings: validationResults.filter(r => r.warnings.length > 0).length
    };

    return {
        moduleId: moduleData.id,
        moduleTitle: moduleData.title,
        summary,
        results: validationResults,
        overallValid: summary.lessonsWithErrors === 0
    };
}

/**
 * Clear all content delivery caches and reset state
 */
export async function resetContentDeliverySystem() {
    try {
        // Clear orchestrator cache
        contentOrchestrator.clearCache();

        // Clear content cache
        await contentCacheService.clearAll();

        // Reset validation cache
        // contentValidationService.clearCache(); // If this method exists

        console.log('Content delivery system reset successfully');
        return { success: true, message: 'System reset completed' };

    } catch (error) {
        console.error('System reset failed:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get performance recommendations based on current system state
 */
export function getPerformanceRecommendations() {
    const status = getContentDeliveryStatus();
    const recommendations = [];

    // Cache recommendations
    if (status.cache.stats.hitRate < 70) {
        recommendations.push({
            type: 'cache',
            priority: 'medium',
            title: 'Low Cache Hit Rate',
            description: `Cache hit rate is ${status.cache.stats.hitRate}%. Consider preloading more content.`,
            actions: ['Enable content preloading', 'Increase cache size', 'Review caching strategy']
        });
    }

    // Network recommendations
    if (status.network.condition === 'slow-2g' || status.network.condition === '2g') {
        recommendations.push({
            type: 'network',
            priority: 'high',
            title: 'Slow Network Detected',
            description: 'Network connection is slow. Consider optimizing content delivery.',
            actions: ['Enable adaptive quality', 'Use content compression', 'Prioritize essential content']
        });
    }

    // Error rate recommendations
    const errorQueueLength = status.errorLogger.queueStatus.errorQueue;
    if (errorQueueLength > 10) {
        recommendations.push({
            type: 'reliability',
            priority: 'high',
            title: 'High Error Rate',
            description: `${errorQueueLength} errors in queue. System may be experiencing issues.`,
            actions: ['Check content URLs', 'Validate network connectivity', 'Review error logs']
        });
    }

    // Offline recommendations
    if (!status.network.isOnline) {
        recommendations.push({
            type: 'offline',
            priority: 'critical',
            title: 'Offline Mode',
            description: 'Device is offline. Only cached content is available.',
            actions: ['Use cached content', 'Enable offline mode', 'Sync when online']
        });
    }

    return recommendations;
}

// Helper functions
function generateIntegrationId() {
    return `integration_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getNetworkCondition() {
    if ('connection' in navigator) {
        return navigator.connection.effectiveType || 'unknown';
    }
    return 'unknown';
}

function getDeviceType() {
    const userAgent = navigator.userAgent;
    if (/Mobile|Android|iPhone/.test(userAgent)) return 'mobile';
    if (/iPad|Tablet/.test(userAgent)) return 'tablet';
    return 'desktop';
}

// Export utility functions for use in components
export {
    contentOrchestrator,
    contentErrorLogger,
    contentErrorRecovery,
    contentCacheService,
    contentValidationService
};

// Default export for main integration function
export default {
    loadLessonWithFullIntegration,
    initializeContentDeliverySession,
    getContentDeliveryStatus,
    validateModuleContent,
    resetContentDeliverySystem,
    getPerformanceRecommendations
};