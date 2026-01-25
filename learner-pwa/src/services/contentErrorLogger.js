/**
 * Client-side Content Error Logger
 * 
 * Service for logging content delivery errors and performance metrics
 * Integrates with backend diagnostic system
 */

class ContentErrorLogger {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.userId = null;
        this.apiBaseUrl = '/api/content-diagnostics';
        this.errorQueue = [];
        this.metricsQueue = [];
        this.isOnline = navigator.onLine;
        this.networkInfo = this.getNetworkInfo();

        // Initialize session tracking
        this.initializeSession();

        // Set up network monitoring
        this.setupNetworkMonitoring();

        // Set up periodic queue processing
        this.setupQueueProcessing();
    }

    /**
     * Initialize content delivery session tracking
     */
    async initializeSession() {
        try {
            const sessionData = {
                sessionId: this.sessionId,
                userId: this.userId,
                connectionType: this.networkInfo.connectionType,
                effectiveType: this.networkInfo.effectiveType,
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString()
            };

            const response = await fetch(`${this.apiBaseUrl}/session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sessionData)
            });

            if (response.ok) {
                const result = await response.json();
                console.log('[ContentErrorLogger] Session initialized:', result.sessionId);
            }
        } catch (error) {
            console.warn('[ContentErrorLogger] Failed to initialize session:', error);
        }
    }

    /**
     * Set user ID for error tracking
     */
    setUserId(userId) {
        this.userId = userId;
    }

    /**
     * Log content delivery error
     */
    async logError(errorData) {
        const enrichedError = {
            ...errorData,
            sessionId: this.sessionId,
            userId: this.userId,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            networkConditions: this.getNetworkInfo(),
            deviceInfo: this.getDeviceInfo(),
            url: window.location.href,
            referrer: document.referrer
        };

        // Add to queue for processing
        this.errorQueue.push(enrichedError);

        // Try to send immediately if online
        if (this.isOnline) {
            await this.processErrorQueue();
        }

        // Log to console for debugging
        console.error('[ContentErrorLogger] Content error logged:', enrichedError);

        return enrichedError;
    }

    /**
     * Log content delivery performance metrics
     */
    async logMetrics(metricsData) {
        const enrichedMetrics = {
            ...metricsData,
            sessionId: this.sessionId,
            userId: this.userId,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            ...this.getNetworkInfo(),
            deviceInfo: this.getDeviceInfo(),
            url: window.location.href
        };

        // Add to queue for processing
        this.metricsQueue.push(enrichedMetrics);

        // Try to send immediately if online
        if (this.isOnline) {
            await this.processMetricsQueue();
        }

        return enrichedMetrics;
    }

    /**
     * Log video-specific errors
     */
    async logVideoError(videoErrorData) {
        const videoError = {
            type: 'video',
            severity: this.determineVideoErrorSeverity(videoErrorData.errorCode),
            message: videoErrorData.message || `Video error: ${videoErrorData.errorCode}`,
            moduleId: videoErrorData.moduleId,
            lessonId: videoErrorData.lessonId,
            errorCode: videoErrorData.errorCode,
            contentUrl: videoErrorData.videoUrl,
            loadTime: videoErrorData.loadTime,
            retryAttempts: videoErrorData.retryAttempts || 0,
            playerState: videoErrorData.playerState,
            networkConditions: this.getNetworkInfo(),
            stackTrace: videoErrorData.stackTrace
        };

        return await this.logError(videoError);
    }

    /**
     * Log text content rendering errors
     */
    async logTextError(textErrorData) {
        const textError = {
            type: 'text',
            severity: textErrorData.severity || 'medium',
            message: textErrorData.message || 'Text content rendering error',
            moduleId: textErrorData.moduleId,
            lessonId: textErrorData.lessonId,
            errorCode: textErrorData.errorCode || 'TEXT_RENDER_ERROR',
            contentUrl: textErrorData.contentUrl,
            loadTime: textErrorData.loadTime,
            elementSelector: textErrorData.elementSelector,
            stackTrace: textErrorData.stackTrace
        };

        return await this.logError(textError);
    }

    /**
     * Log interactive content errors (quizzes, exercises)
     */
    async logInteractiveError(interactiveErrorData) {
        const interactiveError = {
            type: 'interactive',
            severity: interactiveErrorData.severity || 'medium',
            message: interactiveErrorData.message || 'Interactive content error',
            moduleId: interactiveErrorData.moduleId,
            lessonId: interactiveErrorData.lessonId,
            errorCode: interactiveErrorData.errorCode || 'INTERACTIVE_ERROR',
            interactiveType: interactiveErrorData.interactiveType, // 'quiz', 'exercise', etc.
            elementId: interactiveErrorData.elementId,
            stackTrace: interactiveErrorData.stackTrace
        };

        return await this.logError(interactiveError);
    }

    /**
     * Log content synchronization errors
     */
    async logSyncError(syncErrorData) {
        const syncError = {
            type: 'sync',
            severity: syncErrorData.severity || 'high',
            message: syncErrorData.message || 'Content synchronization error',
            moduleId: syncErrorData.moduleId,
            lessonId: syncErrorData.lessonId,
            errorCode: syncErrorData.errorCode || 'SYNC_ERROR',
            contentTypes: syncErrorData.contentTypes, // ['video', 'text', 'interactive']
            syncAttempts: syncErrorData.syncAttempts || 0,
            stackTrace: syncErrorData.stackTrace
        };

        return await this.logError(syncError);
    }

    /**
     * Log content loading performance metrics
     */
    async logContentLoadMetrics(loadMetricsData) {
        const loadMetrics = {
            moduleId: loadMetricsData.moduleId,
            lessonId: loadMetricsData.lessonId,
            videoLoadTime: loadMetricsData.videoLoadTime || 0,
            textLoadTime: loadMetricsData.textLoadTime || 0,
            imageLoadTime: loadMetricsData.imageLoadTime || 0,
            totalLoadTime: loadMetricsData.totalLoadTime || 0,
            firstContentfulPaint: loadMetricsData.firstContentfulPaint || 0,
            hasVideo: loadMetricsData.hasVideo || false,
            hasText: loadMetricsData.hasText || false,
            hasImages: loadMetricsData.hasImages || false,
            hasInteractive: loadMetricsData.hasInteractive || false,
            success: loadMetricsData.success !== false,
            errorCount: loadMetricsData.errorCount || 0,
            contentType: loadMetricsData.contentType
        };

        return await this.logMetrics(loadMetrics);
    }

    /**
     * Log content orchestration metrics
     */
    async logOrchestrationMetrics(orchestrationData) {
        const orchestrationMetrics = {
            moduleId: orchestrationData.moduleId,
            lessonId: orchestrationData.lessonId,
            orchestrationStartTime: orchestrationData.startTime,
            orchestrationEndTime: orchestrationData.endTime,
            totalOrchestrationTime: orchestrationData.endTime - orchestrationData.startTime,
            contentTypesLoaded: orchestrationData.contentTypes || [],
            parallelLoadingUsed: orchestrationData.parallelLoading || false,
            synchronizationSuccess: orchestrationData.syncSuccess || false,
            contentLoadOrder: orchestrationData.loadOrder || [],
            bottleneckIdentified: orchestrationData.bottleneck || null,
            userFeedbackProvided: orchestrationData.userFeedback || false
        };

        return await this.logMetrics(orchestrationMetrics);
    }

    /**
     * Log content caching performance
     */
    async logCachingMetrics(cachingData) {
        const cachingMetrics = {
            moduleId: cachingData.moduleId,
            lessonId: cachingData.lessonId,
            cacheHitRate: cachingData.hitRate || 0,
            cacheMissCount: cachingData.missCount || 0,
            cacheSize: cachingData.cacheSize || 0,
            preloadingSuccess: cachingData.preloadingSuccess || false,
            offlineAvailability: cachingData.offlineAvailable || false,
            cacheInvalidationEvents: cachingData.invalidationEvents || 0,
            compressionRatio: cachingData.compressionRatio || 0
        };

        return await this.logMetrics(cachingMetrics);
    }

    /**
     * Log accessibility and responsive design metrics
     */
    async logAccessibilityMetrics(accessibilityData) {
        const accessibilityMetrics = {
            moduleId: accessibilityData.moduleId,
            lessonId: accessibilityData.lessonId,
            screenReaderCompatible: accessibilityData.screenReaderCompatible || false,
            keyboardNavigationWorking: accessibilityData.keyboardNavigation || false,
            highContrastModeSupported: accessibilityData.highContrast || false,
            textScalingSupported: accessibilityData.textScaling || false,
            mobileResponsive: accessibilityData.mobileResponsive || false,
            tabletResponsive: accessibilityData.tabletResponsive || false,
            accessibilityScore: accessibilityData.score || 0
        };

        return await this.logMetrics(accessibilityMetrics);
    }

    /**
     * Process error queue - send errors to backend
     */
    async processErrorQueue() {
        if (this.errorQueue.length === 0) return;

        const errorsToSend = [...this.errorQueue];
        this.errorQueue = [];

        for (const error of errorsToSend) {
            try {
                const response = await fetch(`${this.apiBaseUrl}/error`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(error)
                });

                if (!response.ok) {
                    // Put error back in queue if failed to send
                    this.errorQueue.push(error);
                }
            } catch (fetchError) {
                // Put error back in queue if failed to send
                this.errorQueue.push(error);
                console.warn('[ContentErrorLogger] Failed to send error:', fetchError);
            }
        }
    }

    /**
     * Process metrics queue - send metrics to backend
     */
    async processMetricsQueue() {
        if (this.metricsQueue.length === 0) return;

        const metricsToSend = [...this.metricsQueue];
        this.metricsQueue = [];

        for (const metrics of metricsToSend) {
            try {
                const response = await fetch(`${this.apiBaseUrl}/metrics`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(metrics)
                });

                if (!response.ok) {
                    // Put metrics back in queue if failed to send
                    this.metricsQueue.push(metrics);
                }
            } catch (fetchError) {
                // Put metrics back in queue if failed to send
                this.metricsQueue.push(metrics);
                console.warn('[ContentErrorLogger] Failed to send metrics:', fetchError);
            }
        }
    }

    /**
     * Set up network monitoring
     */
    setupNetworkMonitoring() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.networkInfo = this.getNetworkInfo();
            // Process queued items when back online
            this.processErrorQueue();
            this.processMetricsQueue();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
        });

        // Monitor network changes
        if ('connection' in navigator) {
            navigator.connection.addEventListener('change', () => {
                this.networkInfo = this.getNetworkInfo();
            });
        }
    }

    /**
     * Set up periodic queue processing
     */
    setupQueueProcessing() {
        // Process queues every 30 seconds
        setInterval(() => {
            if (this.isOnline) {
                this.processErrorQueue();
                this.processMetricsQueue();
            }
        }, 30000);

        // Process queues before page unload
        window.addEventListener('beforeunload', () => {
            if (this.isOnline) {
                // Use sendBeacon for reliable delivery during page unload
                this.sendQueuedDataOnUnload();
            }
        });
    }

    /**
     * Send queued data using sendBeacon on page unload
     */
    sendQueuedDataOnUnload() {
        // Send errors
        if (this.errorQueue.length > 0) {
            const errorData = JSON.stringify({
                type: 'bulk_errors',
                errors: this.errorQueue,
                sessionId: this.sessionId
            });
            navigator.sendBeacon(`${this.apiBaseUrl}/error`, errorData);
        }

        // Send metrics
        if (this.metricsQueue.length > 0) {
            const metricsData = JSON.stringify({
                type: 'bulk_metrics',
                metrics: this.metricsQueue,
                sessionId: this.sessionId
            });
            navigator.sendBeacon(`${this.apiBaseUrl}/metrics`, metricsData);
        }
    }

    /**
     * Get network information
     */
    getNetworkInfo() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

        return {
            connectionType: connection?.type || 'unknown',
            effectiveType: connection?.effectiveType || 'unknown',
            downlink: connection?.downlink || null,
            rtt: connection?.rtt || null,
            saveData: connection?.saveData || false,
            isOnline: navigator.onLine
        };
    }

    /**
     * Get device information
     */
    getDeviceInfo() {
        const userAgent = navigator.userAgent;
        const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
        const isTablet = /iPad|Tablet/.test(userAgent);

        return {
            type: isTablet ? 'tablet' : (isMobile ? 'mobile' : 'desktop'),
            userAgent: userAgent,
            language: navigator.language,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            viewportSize: `${window.innerWidth}x${window.innerHeight}`,
            colorDepth: window.screen.colorDepth,
            pixelRatio: window.devicePixelRatio || 1
        };
    }

    /**
     * Determine video error severity based on error code
     */
    determineVideoErrorSeverity(errorCode) {
        const severityMap = {
            2: 'high',      // Invalid video ID
            5: 'medium',    // HTML5 player error
            100: 'high',    // Video not found
            101: 'high',    // Video cannot be embedded
            150: 'high',    // Video cannot be embedded
            'NETWORK_ERROR': 'medium',
            'API_TIMEOUT': 'high',
            'API_LOAD_ERROR': 'critical',
            'PLAYER_CREATE_ERROR': 'high'
        };

        return severityMap[errorCode] || 'medium';
    }

    /**
     * Generate unique session ID
     */
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Create error wrapper for automatic error logging
     */
    wrapWithErrorLogging(fn, context = {}) {
        return async (...args) => {
            try {
                return await fn(...args);
            } catch (error) {
                await this.logError({
                    type: context.type || 'unknown',
                    severity: context.severity || 'medium',
                    message: error.message,
                    moduleId: context.moduleId,
                    lessonId: context.lessonId,
                    errorCode: context.errorCode || 'WRAPPED_ERROR',
                    stackTrace: error.stack,
                    functionName: fn.name,
                    context: context
                });
                throw error; // Re-throw the error
            }
        };
    }

    /**
     * Measure and log function execution time
     */
    measureExecutionTime(fn, context = {}) {
        return async (...args) => {
            const startTime = performance.now();
            try {
                const result = await fn(...args);
                const executionTime = performance.now() - startTime;

                await this.logMetrics({
                    moduleId: context.moduleId,
                    lessonId: context.lessonId,
                    functionName: fn.name,
                    executionTime: executionTime,
                    success: true,
                    context: context
                });

                return result;
            } catch (error) {
                const executionTime = performance.now() - startTime;

                await this.logMetrics({
                    moduleId: context.moduleId,
                    lessonId: context.lessonId,
                    functionName: fn.name,
                    executionTime: executionTime,
                    success: false,
                    error: error.message,
                    context: context
                });

                throw error;
            }
        };
    }

    /**
     * Get current queue status for debugging
     */
    getQueueStatus() {
        return {
            errorQueue: this.errorQueue.length,
            metricsQueue: this.metricsQueue.length,
            isOnline: this.isOnline,
            sessionId: this.sessionId,
            userId: this.userId
        };
    }
}

// Create singleton instance
const contentErrorLogger = new ContentErrorLogger();

export default contentErrorLogger;