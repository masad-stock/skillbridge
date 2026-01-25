/**
 * Content Delivery Diagnostic Service
 * 
 * Comprehensive monitoring and troubleshooting for content delivery issues
 * Tracks video playback, text rendering, and overall content accessibility
 */

const logger = require('../utils/logger');

class ContentDeliveryDiagnosticService {
    constructor() {
        this.errorLog = [];
        this.performanceMetrics = new Map();
        this.contentHealthStatus = new Map();
        this.userSessionData = new Map();
    }

    /**
     * Log content delivery errors with detailed context
     */
    logContentError(errorData) {
        const errorEntry = {
            errorId: this.generateErrorId(),
            timestamp: new Date().toISOString(),
            type: errorData.type || 'unknown', // 'video', 'text', 'image', 'interactive', 'sync'
            severity: errorData.severity || 'medium', // 'low', 'medium', 'high', 'critical'
            message: errorData.message,
            moduleId: errorData.moduleId,
            lessonId: errorData.lessonId,
            userId: errorData.userId,
            sessionId: errorData.sessionId,
            technicalDetails: {
                errorCode: errorData.errorCode,
                stackTrace: errorData.stackTrace,
                networkConditions: errorData.networkConditions || this.detectNetworkConditions(),
                deviceInfo: errorData.deviceInfo || this.extractDeviceInfo(errorData.userAgent),
                browserInfo: this.extractBrowserInfo(errorData.userAgent),
                contentUrl: errorData.contentUrl,
                loadTime: errorData.loadTime,
                retryAttempts: errorData.retryAttempts || 0
            },
            userImpact: this.assessUserImpact(errorData),
            suggestedActions: this.generateSuggestedActions(errorData),
            context: {
                previousErrors: this.getRecentErrorsForUser(errorData.userId),
                moduleProgress: errorData.moduleProgress,
                timeSpentOnContent: errorData.timeSpentOnContent
            }
        };

        this.errorLog.push(errorEntry);

        // Log to system logger
        logger.error('Content Delivery Error', errorEntry);

        // Update content health status
        this.updateContentHealthStatus(errorData.moduleId, errorData.lessonId, errorEntry);

        // Trigger alerts for critical errors
        if (errorEntry.severity === 'critical') {
            this.triggerCriticalErrorAlert(errorEntry);
        }

        return errorEntry;
    }

    /**
     * Monitor content delivery performance
     */
    recordContentDeliveryMetrics(metricsData) {
        const metricsEntry = {
            timestamp: new Date().toISOString(),
            moduleId: metricsData.moduleId,
            lessonId: metricsData.lessonId,
            userId: metricsData.userId,
            sessionId: metricsData.sessionId,
            loadTimes: {
                videoLoadTime: metricsData.videoLoadTime || 0,
                textLoadTime: metricsData.textLoadTime || 0,
                imageLoadTime: metricsData.imageLoadTime || 0,
                totalLoadTime: metricsData.totalLoadTime || 0,
                firstContentfulPaint: metricsData.firstContentfulPaint || 0
            },
            contentTypes: {
                hasVideo: metricsData.hasVideo || false,
                hasText: metricsData.hasText || false,
                hasImages: metricsData.hasImages || false,
                hasInteractive: metricsData.hasInteractive || false
            },
            networkInfo: {
                connectionType: metricsData.connectionType,
                effectiveType: metricsData.effectiveType,
                downlink: metricsData.downlink,
                rtt: metricsData.rtt
            },
            deviceInfo: this.extractDeviceInfo(metricsData.userAgent),
            success: metricsData.success || false,
            errorCount: metricsData.errorCount || 0
        };

        const key = `${metricsData.moduleId}_${metricsData.lessonId}`;
        if (!this.performanceMetrics.has(key)) {
            this.performanceMetrics.set(key, []);
        }
        this.performanceMetrics.get(key).push(metricsEntry);

        // Keep only last 100 entries per content item
        const metrics = this.performanceMetrics.get(key);
        if (metrics.length > 100) {
            metrics.splice(0, metrics.length - 100);
        }

        return metricsEntry;
    }

    /**
     * Track user session data for content delivery analysis
     */
    trackUserSession(sessionData) {
        const sessionEntry = {
            sessionId: sessionData.sessionId,
            userId: sessionData.userId,
            startTime: new Date().toISOString(),
            deviceInfo: this.extractDeviceInfo(sessionData.userAgent),
            networkInfo: sessionData.networkInfo,
            contentAccessed: [],
            errors: [],
            totalTimeSpent: 0,
            completionRate: 0
        };

        this.userSessionData.set(sessionData.sessionId, sessionEntry);
        return sessionEntry;
    }

    /**
     * Update session with content access information
     */
    updateSessionContentAccess(sessionId, contentData) {
        const session = this.userSessionData.get(sessionId);
        if (session) {
            session.contentAccessed.push({
                moduleId: contentData.moduleId,
                lessonId: contentData.lessonId,
                accessTime: new Date().toISOString(),
                contentType: contentData.contentType,
                loadTime: contentData.loadTime,
                success: contentData.success,
                timeSpent: contentData.timeSpent
            });
        }
    }

    /**
     * Generate comprehensive diagnostic report
     */
    generateDiagnosticReport(filters = {}) {
        const now = new Date();
        const timeRange = filters.timeRange || '24h';
        const startTime = this.getStartTimeForRange(timeRange);

        // Filter errors by time range
        const recentErrors = this.errorLog.filter(error =>
            new Date(error.timestamp) >= startTime
        );

        // Filter by user if specified
        const filteredErrors = filters.userId
            ? recentErrors.filter(error => error.userId === filters.userId)
            : recentErrors;

        // Categorize errors
        const errorsByType = this.categorizeErrors(filteredErrors);
        const errorsBySeverity = this.categorizeErrorsBySeverity(filteredErrors);
        const errorsByModule = this.categorizeErrorsByModule(filteredErrors);

        // Calculate performance metrics
        const performanceStats = this.calculatePerformanceStats(filters);

        // Generate recommendations
        const recommendations = this.generateRecommendations(filteredErrors, performanceStats);

        return {
            reportId: this.generateReportId(),
            generatedAt: now.toISOString(),
            timeRange: timeRange,
            filters: filters,
            summary: {
                totalErrors: filteredErrors.length,
                criticalErrors: errorsBySeverity.critical?.length || 0,
                highErrors: errorsBySeverity.high?.length || 0,
                mediumErrors: errorsBySeverity.medium?.length || 0,
                lowErrors: errorsBySeverity.low?.length || 0,
                affectedUsers: new Set(filteredErrors.map(e => e.userId)).size,
                affectedModules: new Set(filteredErrors.map(e => e.moduleId)).size
            },
            errorAnalysis: {
                byType: errorsByType,
                bySeverity: errorsBySeverity,
                byModule: errorsByModule,
                commonPatterns: this.identifyCommonErrorPatterns(filteredErrors)
            },
            performanceMetrics: performanceStats,
            contentHealthStatus: this.getContentHealthSummary(),
            recommendations: recommendations,
            trends: this.analyzeTrends(filteredErrors),
            systemHealth: this.assessSystemHealth(filteredErrors, performanceStats)
        };
    }

    /**
     * Get content health status for specific module/lesson
     */
    getContentHealthStatus(moduleId, lessonId = null) {
        const key = lessonId ? `${moduleId}_${lessonId}` : moduleId;
        return this.contentHealthStatus.get(key) || {
            status: 'unknown',
            lastChecked: null,
            errorCount: 0,
            successRate: 0,
            avgLoadTime: 0
        };
    }

    /**
     * Validate content URLs and accessibility
     */
    async validateContentUrls(moduleId, lessonId = null) {
        const validationResults = {
            moduleId,
            lessonId,
            timestamp: new Date().toISOString(),
            results: []
        };

        try {
            // Get module content
            const moduleContent = await this.getModuleContentForValidation(moduleId);

            if (lessonId) {
                const lesson = moduleContent.lessons.find(l => l.id === lessonId);
                if (lesson) {
                    validationResults.results.push(await this.validateLessonContent(lesson));
                }
            } else {
                // Validate all lessons in module
                for (const lesson of moduleContent.lessons) {
                    validationResults.results.push(await this.validateLessonContent(lesson));
                }
            }

        } catch (error) {
            logger.error('Content validation error', { moduleId, lessonId, error: error.message });
            validationResults.error = error.message;
        }

        return validationResults;
    }

    /**
     * Validate individual lesson content
     */
    async validateLessonContent(lesson) {
        const result = {
            lessonId: lesson.id || lesson.title,
            lessonTitle: lesson.title,
            contentType: lesson.type,
            validationResults: {
                video: null,
                text: null,
                images: null,
                interactive: null
            },
            overallStatus: 'pending'
        };

        try {
            // Validate video content
            if (lesson.youtubeUrl) {
                result.validationResults.video = await this.validateVideoUrl(lesson.youtubeUrl);
            }

            // Validate text content
            if (lesson.textContent) {
                result.validationResults.text = this.validateTextContent(lesson.textContent);
            }

            // Validate quiz/interactive content
            if (lesson.questions) {
                result.validationResults.interactive = this.validateInteractiveContent(lesson.questions);
            }

            // Determine overall status
            result.overallStatus = this.determineOverallContentStatus(result.validationResults);

        } catch (error) {
            result.error = error.message;
            result.overallStatus = 'error';
        }

        return result;
    }

    /**
     * Validate video URL accessibility
     */
    async validateVideoUrl(videoUrl) {
        const validation = {
            url: videoUrl,
            accessible: false,
            responseTime: null,
            error: null,
            metadata: null
        };

        try {
            const startTime = Date.now();

            // Extract video ID for YouTube URLs
            const videoId = this.extractYouTubeVideoId(videoUrl);
            if (!videoId) {
                validation.error = 'Invalid YouTube URL format';
                return validation;
            }

            // Check if video is accessible (simplified check)
            // In a real implementation, you might use YouTube API
            validation.accessible = true;
            validation.responseTime = Date.now() - startTime;
            validation.metadata = {
                videoId: videoId,
                platform: 'youtube'
            };

        } catch (error) {
            validation.error = error.message;
        }

        return validation;
    }

    /**
     * Validate text content
     */
    validateTextContent(textContent) {
        return {
            hasContent: !!textContent && textContent.trim().length > 0,
            length: textContent ? textContent.length : 0,
            wordCount: textContent ? textContent.split(/\s+/).length : 0,
            hasFormatting: textContent ? textContent.includes('**') || textContent.includes('•') : false,
            status: textContent && textContent.trim().length > 0 ? 'valid' : 'missing'
        };
    }

    /**
     * Validate interactive content (quizzes, etc.)
     */
    validateInteractiveContent(questions) {
        if (!questions || !Array.isArray(questions)) {
            return { status: 'missing', error: 'No questions found' };
        }

        const validationResults = questions.map((question, index) => ({
            questionIndex: index,
            hasQuestion: !!question.question,
            hasOptions: Array.isArray(question.options) && question.options.length > 0,
            hasCorrectAnswer: typeof question.correctAnswer === 'number',
            isValid: !!question.question && Array.isArray(question.options) &&
                question.options.length > 0 && typeof question.correctAnswer === 'number'
        }));

        const validQuestions = validationResults.filter(q => q.isValid).length;

        return {
            totalQuestions: questions.length,
            validQuestions: validQuestions,
            invalidQuestions: questions.length - validQuestions,
            status: validQuestions === questions.length ? 'valid' : 'partial',
            details: validationResults
        };
    }

    // Helper methods
    generateErrorId() {
        return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    generateReportId() {
        return `rpt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    extractDeviceInfo(userAgent) {
        if (!userAgent) return { type: 'unknown', os: 'unknown', browser: 'unknown' };

        const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
        const isTablet = /iPad|Tablet/.test(userAgent);

        return {
            type: isTablet ? 'tablet' : (isMobile ? 'mobile' : 'desktop'),
            os: this.extractOS(userAgent),
            browser: this.extractBrowser(userAgent),
            userAgent: userAgent
        };
    }

    extractOS(userAgent) {
        if (/Windows/.test(userAgent)) return 'Windows';
        if (/Mac OS/.test(userAgent)) return 'macOS';
        if (/Android/.test(userAgent)) return 'Android';
        if (/iPhone|iPad/.test(userAgent)) return 'iOS';
        if (/Linux/.test(userAgent)) return 'Linux';
        return 'Unknown';
    }

    extractBrowser(userAgent) {
        if (/Chrome/.test(userAgent)) return 'Chrome';
        if (/Firefox/.test(userAgent)) return 'Firefox';
        if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) return 'Safari';
        if (/Edge/.test(userAgent)) return 'Edge';
        return 'Unknown';
    }

    extractBrowserInfo(userAgent) {
        return {
            name: this.extractBrowser(userAgent),
            userAgent: userAgent,
            supportsModernFeatures: this.checkModernFeatureSupport(userAgent)
        };
    }

    checkModernFeatureSupport(userAgent) {
        // Simplified check for modern browser features
        const modernBrowsers = ['Chrome', 'Firefox', 'Safari', 'Edge'];
        const browser = this.extractBrowser(userAgent);
        return modernBrowsers.includes(browser);
    }

    detectNetworkConditions() {
        // This would be populated from client-side network information
        return {
            connectionType: 'unknown',
            effectiveType: 'unknown',
            downlink: null,
            rtt: null,
            timestamp: new Date().toISOString()
        };
    }

    assessUserImpact(errorData) {
        const impactLevels = {
            video: {
                critical: 'Cannot access video content - learning blocked',
                high: 'Video playback issues - degraded experience',
                medium: 'Minor video issues - workaround available',
                low: 'Video quality issues - content still accessible'
            },
            text: {
                critical: 'Cannot access text content - learning blocked',
                high: 'Text rendering issues - difficult to read',
                medium: 'Minor formatting issues - content readable',
                low: 'Cosmetic text issues - minimal impact'
            },
            interactive: {
                critical: 'Cannot access quizzes/exercises - assessment blocked',
                high: 'Interactive elements not working - reduced engagement',
                medium: 'Some interactive features not working',
                low: 'Minor interactive issues'
            }
        };

        const typeImpacts = impactLevels[errorData.type] || {};
        return typeImpacts[errorData.severity] || 'Unknown impact level';
    }

    generateSuggestedActions(errorData) {
        const actionMap = {
            video: {
                network: ['Check internet connection', 'Try refreshing the page', 'Switch to mobile data if on WiFi'],
                api: ['Clear browser cache', 'Disable ad blockers', 'Try a different browser'],
                player: ['Update browser', 'Enable JavaScript', 'Check browser compatibility'],
                content: ['Report broken video link', 'Try alternative content', 'Contact support']
            },
            text: {
                render: ['Refresh the page', 'Clear browser cache', 'Try a different browser'],
                format: ['Check browser compatibility', 'Enable CSS loading', 'Try desktop version'],
                load: ['Check internet connection', 'Wait and retry', 'Contact support']
            },
            interactive: {
                script: ['Enable JavaScript', 'Clear browser cache', 'Update browser'],
                load: ['Refresh the page', 'Check internet connection', 'Try different browser'],
                function: ['Report the issue', 'Try alternative assessment', 'Contact support']
            }
        };

        const typeActions = actionMap[errorData.type] || {};
        const categoryActions = typeActions[errorData.category] || typeActions.general || [];

        return [
            ...categoryActions,
            'Contact technical support if issue persists',
            'Try accessing content on a different device'
        ];
    }

    getRecentErrorsForUser(userId, limit = 5) {
        return this.errorLog
            .filter(error => error.userId === userId)
            .slice(-limit)
            .map(error => ({
                timestamp: error.timestamp,
                type: error.type,
                severity: error.severity,
                message: error.message
            }));
    }

    updateContentHealthStatus(moduleId, lessonId, errorEntry) {
        const key = lessonId ? `${moduleId}_${lessonId}` : moduleId;

        if (!this.contentHealthStatus.has(key)) {
            this.contentHealthStatus.set(key, {
                status: 'healthy',
                lastChecked: new Date().toISOString(),
                errorCount: 0,
                totalAccess: 0,
                successfulAccess: 0,
                avgLoadTime: 0,
                recentErrors: []
            });
        }

        const healthStatus = this.contentHealthStatus.get(key);
        healthStatus.errorCount++;
        healthStatus.lastChecked = new Date().toISOString();
        healthStatus.recentErrors.push({
            timestamp: errorEntry.timestamp,
            type: errorEntry.type,
            severity: errorEntry.severity
        });

        // Keep only last 10 errors
        if (healthStatus.recentErrors.length > 10) {
            healthStatus.recentErrors.splice(0, healthStatus.recentErrors.length - 10);
        }

        // Update status based on error frequency
        const criticalErrors = healthStatus.recentErrors.filter(e => e.severity === 'critical').length;
        const highErrors = healthStatus.recentErrors.filter(e => e.severity === 'high').length;

        if (criticalErrors > 2) {
            healthStatus.status = 'critical';
        } else if (criticalErrors > 0 || highErrors > 3) {
            healthStatus.status = 'degraded';
        } else if (healthStatus.errorCount > 5) {
            healthStatus.status = 'warning';
        }
    }

    triggerCriticalErrorAlert(errorEntry) {
        // In a real implementation, this would send alerts via email, Slack, etc.
        logger.error('CRITICAL CONTENT DELIVERY ERROR - IMMEDIATE ATTENTION REQUIRED', {
            errorId: errorEntry.errorId,
            moduleId: errorEntry.moduleId,
            lessonId: errorEntry.lessonId,
            message: errorEntry.message,
            userImpact: errorEntry.userImpact,
            timestamp: errorEntry.timestamp
        });

        // Could integrate with alerting systems like PagerDuty, Slack, etc.
        this.sendAlert('critical', errorEntry);
    }

    sendAlert(level, errorEntry) {
        // Placeholder for alert integration
        console.log(`[ALERT-${level.toUpperCase()}] Content Delivery Issue:`, {
            error: errorEntry.message,
            module: errorEntry.moduleId,
            impact: errorEntry.userImpact
        });
    }

    // Additional helper methods for analysis
    categorizeErrors(errors) {
        return errors.reduce((acc, error) => {
            if (!acc[error.type]) acc[error.type] = [];
            acc[error.type].push(error);
            return acc;
        }, {});
    }

    categorizeErrorsBySeverity(errors) {
        return errors.reduce((acc, error) => {
            if (!acc[error.severity]) acc[error.severity] = [];
            acc[error.severity].push(error);
            return acc;
        }, {});
    }

    categorizeErrorsByModule(errors) {
        return errors.reduce((acc, error) => {
            if (!acc[error.moduleId]) acc[error.moduleId] = [];
            acc[error.moduleId].push(error);
            return acc;
        }, {});
    }

    calculatePerformanceStats(filters) {
        // Calculate performance statistics from stored metrics
        const allMetrics = Array.from(this.performanceMetrics.values()).flat();

        if (allMetrics.length === 0) {
            return {
                avgLoadTime: 0,
                successRate: 0,
                totalRequests: 0,
                failedRequests: 0
            };
        }

        const totalRequests = allMetrics.length;
        const successfulRequests = allMetrics.filter(m => m.success).length;
        const avgLoadTime = allMetrics.reduce((sum, m) => sum + m.loadTimes.totalLoadTime, 0) / totalRequests;

        return {
            avgLoadTime: Math.round(avgLoadTime),
            successRate: Math.round((successfulRequests / totalRequests) * 100),
            totalRequests,
            failedRequests: totalRequests - successfulRequests,
            avgVideoLoadTime: Math.round(allMetrics.reduce((sum, m) => sum + m.loadTimes.videoLoadTime, 0) / totalRequests),
            avgTextLoadTime: Math.round(allMetrics.reduce((sum, m) => sum + m.loadTimes.textLoadTime, 0) / totalRequests)
        };
    }

    generateRecommendations(errors, performanceStats) {
        const recommendations = [];

        // Performance-based recommendations
        if (performanceStats.avgLoadTime > 5000) {
            recommendations.push({
                type: 'performance',
                priority: 'high',
                title: 'Slow Content Loading',
                description: 'Average load time exceeds 5 seconds',
                actions: ['Optimize video compression', 'Implement content caching', 'Use CDN for content delivery']
            });
        }

        // Error-based recommendations
        const videoErrors = errors.filter(e => e.type === 'video').length;
        if (videoErrors > 10) {
            recommendations.push({
                type: 'reliability',
                priority: 'high',
                title: 'High Video Error Rate',
                description: `${videoErrors} video errors detected`,
                actions: ['Validate all video URLs', 'Implement video fallback system', 'Add video health monitoring']
            });
        }

        // Success rate recommendations
        if (performanceStats.successRate < 90) {
            recommendations.push({
                type: 'reliability',
                priority: 'critical',
                title: 'Low Content Success Rate',
                description: `Only ${performanceStats.successRate}% of content loads successfully`,
                actions: ['Investigate root causes', 'Implement better error handling', 'Add content redundancy']
            });
        }

        return recommendations;
    }

    identifyCommonErrorPatterns(errors) {
        const patterns = {};

        errors.forEach(error => {
            const pattern = `${error.type}_${error.technicalDetails.errorCode}`;
            if (!patterns[pattern]) {
                patterns[pattern] = {
                    pattern: pattern,
                    count: 0,
                    description: `${error.type} errors with code ${error.technicalDetails.errorCode}`,
                    examples: []
                };
            }
            patterns[pattern].count++;
            if (patterns[pattern].examples.length < 3) {
                patterns[pattern].examples.push({
                    timestamp: error.timestamp,
                    message: error.message,
                    moduleId: error.moduleId
                });
            }
        });

        return Object.values(patterns).sort((a, b) => b.count - a.count);
    }

    analyzeTrends(errors) {
        // Simple trend analysis - could be enhanced with more sophisticated algorithms
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const lastHourErrors = errors.filter(e => new Date(e.timestamp) > oneHourAgo).length;
        const lastDayErrors = errors.filter(e => new Date(e.timestamp) > oneDayAgo).length;

        return {
            lastHour: lastHourErrors,
            lastDay: lastDayErrors,
            trend: lastHourErrors > (lastDayErrors / 24) * 2 ? 'increasing' : 'stable'
        };
    }

    assessSystemHealth(errors, performanceStats) {
        const criticalErrors = errors.filter(e => e.severity === 'critical').length;
        const highErrors = errors.filter(e => e.severity === 'high').length;

        let healthScore = 100;
        healthScore -= criticalErrors * 20;
        healthScore -= highErrors * 10;
        healthScore -= (100 - performanceStats.successRate);

        let status = 'healthy';
        if (healthScore < 50) status = 'critical';
        else if (healthScore < 70) status = 'degraded';
        else if (healthScore < 90) status = 'warning';

        return {
            score: Math.max(0, healthScore),
            status: status,
            factors: {
                criticalErrors,
                highErrors,
                successRate: performanceStats.successRate,
                avgLoadTime: performanceStats.avgLoadTime
            }
        };
    }

    getStartTimeForRange(timeRange) {
        const now = new Date();
        switch (timeRange) {
            case '1h': return new Date(now.getTime() - 60 * 60 * 1000);
            case '24h': return new Date(now.getTime() - 24 * 60 * 60 * 1000);
            case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            default: return new Date(now.getTime() - 24 * 60 * 60 * 1000);
        }
    }

    getContentHealthSummary() {
        const healthStatuses = Array.from(this.contentHealthStatus.values());

        return {
            total: healthStatuses.length,
            healthy: healthStatuses.filter(s => s.status === 'healthy').length,
            warning: healthStatuses.filter(s => s.status === 'warning').length,
            degraded: healthStatuses.filter(s => s.status === 'degraded').length,
            critical: healthStatuses.filter(s => s.status === 'critical').length
        };
    }

    extractYouTubeVideoId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    determineOverallContentStatus(validationResults) {
        const results = Object.values(validationResults).filter(r => r !== null);

        if (results.length === 0) return 'unknown';

        const hasErrors = results.some(r => r.error || r.status === 'error');
        const hasWarnings = results.some(r => r.status === 'partial' || r.status === 'warning');

        if (hasErrors) return 'error';
        if (hasWarnings) return 'warning';
        return 'healthy';
    }

    async getModuleContentForValidation(moduleId) {
        // This would integrate with your actual content service
        // For now, return a placeholder structure
        return {
            moduleId,
            lessons: [
                {
                    id: 'lesson1',
                    title: 'Sample Lesson',
                    type: 'video',
                    youtubeUrl: 'https://www.youtube.com/watch?v=example',
                    textContent: 'Sample text content',
                    questions: []
                }
            ]
        };
    }
}

module.exports = new ContentDeliveryDiagnosticService();