const ResearchEvent = require('../../models/ResearchEvent');
const logger = require('../../utils/logger');

/**
 * Event Tracking Service
 * Handles research event capture, batching, and storage for thesis validation
 */
class EventTrackingService {
    constructor() {
        this.eventBuffer = [];
        this.batchSize = parseInt(process.env.EVENT_BATCH_SIZE) || 50;
        this.flushInterval = parseInt(process.env.EVENT_FLUSH_INTERVAL) || 5000;
        this.flushTimer = null;
        this.isProcessing = false;
    }

    /**
     * Initialize the service and start the flush timer
     */
    initialize() {
        this.startFlushTimer();
        logger.info('EventTrackingService initialized', {
            batchSize: this.batchSize,
            flushInterval: this.flushInterval
        });
    }

    /**
     * Start the periodic flush timer
     */
    startFlushTimer() {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
        }
        this.flushTimer = setInterval(() => this.flush(), this.flushInterval);
    }

    /**
     * Stop the flush timer
     */
    stopFlushTimer() {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
            this.flushTimer = null;
        }
    }

    /**
     * Track a single event
     * @param {Object} eventData - Event data to track
     * @returns {Promise<Object>} - Created event or queued status
     */
    async trackEvent(eventData) {
        const event = this.normalizeEvent(eventData);

        // Validate required fields
        const validation = this.validateEvent(event);
        if (!validation.valid) {
            logger.warn('Invalid event data', { errors: validation.errors, event });
            throw new Error(`Invalid event: ${validation.errors.join(', ')}`);
        }

        this.eventBuffer.push(event);

        // Flush if buffer reaches batch size
        if (this.eventBuffer.length >= this.batchSize) {
            await this.flush();
        }

        return { queued: true, bufferSize: this.eventBuffer.length };
    }

    /**
     * Track multiple events in batch
     * @param {Array} events - Array of event data
     * @returns {Promise<Object>} - Batch processing result
     */
    async trackBatch(events) {
        if (!Array.isArray(events) || events.length === 0) {
            throw new Error('Events must be a non-empty array');
        }

        const results = { processed: 0, failed: 0, errors: [] };

        for (const eventData of events) {
            try {
                const event = this.normalizeEvent(eventData);
                const validation = this.validateEvent(event);

                if (validation.valid) {
                    this.eventBuffer.push(event);
                    results.processed++;
                } else {
                    results.failed++;
                    results.errors.push({ event: eventData, errors: validation.errors });
                }
            } catch (error) {
                results.failed++;
                results.errors.push({ event: eventData, error: error.message });
            }
        }

        // Flush if buffer reaches batch size
        if (this.eventBuffer.length >= this.batchSize) {
            await this.flush();
        }

        return results;
    }


    /**
     * Normalize event data to ensure consistent structure
     * @param {Object} eventData - Raw event data
     * @returns {Object} - Normalized event
     */
    normalizeEvent(eventData) {
        return {
            userId: eventData.userId,
            sessionId: eventData.sessionId,
            timestamp: eventData.timestamp ? new Date(eventData.timestamp) : new Date(),
            eventType: eventData.eventType,
            eventCategory: eventData.eventCategory || this.inferCategory(eventData.eventType),
            eventData: {
                moduleId: eventData.moduleId || eventData.eventData?.moduleId,
                assessmentId: eventData.assessmentId || eventData.eventData?.assessmentId,
                questionId: eventData.questionId || eventData.eventData?.questionId,
                responseTime: eventData.responseTime || eventData.eventData?.responseTime,
                score: eventData.score || eventData.eventData?.score,
                interactions: eventData.interactions || eventData.eventData?.interactions,
                previousAnswer: eventData.previousAnswer || eventData.eventData?.previousAnswer,
                currentAnswer: eventData.currentAnswer || eventData.eventData?.currentAnswer,
                confidence: eventData.confidence || eventData.eventData?.confidence,
                pageUrl: eventData.pageUrl || eventData.eventData?.pageUrl,
                searchQuery: eventData.searchQuery || eventData.eventData?.searchQuery,
                toolName: eventData.toolName || eventData.eventData?.toolName,
                actionType: eventData.actionType || eventData.eventData?.actionType,
                metadata: eventData.metadata || eventData.eventData?.metadata
            },
            context: {
                deviceType: eventData.deviceType || eventData.context?.deviceType || 'unknown',
                networkType: eventData.networkType || eventData.context?.networkType || 'unknown',
                offlineMode: eventData.offlineMode ?? eventData.context?.offlineMode ?? false,
                language: eventData.language || eventData.context?.language || 'en',
                accessibilityMode: eventData.accessibilityMode || eventData.context?.accessibilityMode || 'standard',
                userAgent: eventData.userAgent || eventData.context?.userAgent,
                screenWidth: eventData.screenWidth || eventData.context?.screenWidth,
                screenHeight: eventData.screenHeight || eventData.context?.screenHeight
            },
            experimentData: eventData.experimentData || {},
            syncStatus: {
                queuedAt: eventData.syncStatus?.queuedAt,
                syncedAt: new Date(),
                retryCount: eventData.syncStatus?.retryCount || 0,
                source: eventData.syncStatus?.source || 'online'
            }
        };
    }

    /**
     * Infer event category from event type
     * @param {string} eventType - Event type
     * @returns {string} - Inferred category
     */
    inferCategory(eventType) {
        const categoryMap = {
            page_view: 'navigation',
            module_start: 'learning',
            module_progress: 'learning',
            module_complete: 'learning',
            assessment_start: 'assessment',
            assessment_answer: 'assessment',
            assessment_complete: 'assessment',
            business_tool_use: 'business_tool',
            navigation: 'navigation',
            search: 'navigation',
            login: 'system',
            logout: 'system',
            error: 'system',
            intervention_received: 'research',
            consent_action: 'research',
            economic_survey: 'research',
            voice_command: 'accessibility',
            accessibility_toggle: 'accessibility'
        };
        return categoryMap[eventType] || 'system';
    }

    /**
     * Validate event data
     * @param {Object} event - Event to validate
     * @returns {Object} - Validation result
     */
    validateEvent(event) {
        const errors = [];
        const requiredFields = ['userId', 'sessionId', 'eventType'];

        for (const field of requiredFields) {
            if (!event[field]) {
                errors.push(`Missing required field: ${field}`);
            }
        }

        const validEventTypes = [
            'page_view', 'module_start', 'module_progress', 'module_complete',
            'assessment_start', 'assessment_answer', 'assessment_complete',
            'business_tool_use', 'navigation', 'search', 'login', 'logout',
            'error', 'intervention_received', 'consent_action', 'economic_survey',
            'voice_command', 'accessibility_toggle'
        ];

        if (event.eventType && !validEventTypes.includes(event.eventType)) {
            errors.push(`Invalid eventType: ${event.eventType}`);
        }

        return { valid: errors.length === 0, errors };
    }


    /**
     * Flush buffered events to database
     * @returns {Promise<Object>} - Flush result
     */
    async flush() {
        if (this.isProcessing || this.eventBuffer.length === 0) {
            return { flushed: 0 };
        }

        this.isProcessing = true;
        const eventsToFlush = [...this.eventBuffer];
        this.eventBuffer = [];

        try {
            const result = await ResearchEvent.insertMany(eventsToFlush, { ordered: false });
            logger.info('Events flushed to database', { count: result.length });
            return { flushed: result.length };
        } catch (error) {
            // Handle partial failures
            if (error.writeErrors) {
                const successCount = eventsToFlush.length - error.writeErrors.length;
                logger.warn('Partial flush failure', {
                    success: successCount,
                    failed: error.writeErrors.length
                });
                return { flushed: successCount, failed: error.writeErrors.length };
            }

            // Re-queue events on complete failure
            this.eventBuffer = [...eventsToFlush, ...this.eventBuffer];
            logger.error('Event flush failed, re-queued', { error: error.message });
            throw error;
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Get events for a specific user
     * @param {string} userId - User ID
     * @param {Object} options - Query options
     * @returns {Promise<Array>} - User events
     */
    async getEventsByUser(userId, options = {}) {
        return ResearchEvent.findByUser(userId, options);
    }

    /**
     * Get events for a session
     * @param {string} sessionId - Session ID
     * @returns {Promise<Array>} - Session events
     */
    async getEventsBySession(sessionId) {
        return ResearchEvent.findBySession(sessionId);
    }

    /**
     * Get event statistics
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     * @param {string} groupBy - Field to group by
     * @returns {Promise<Array>} - Event counts
     */
    async getEventStats(startDate, endDate, groupBy = 'eventType') {
        return ResearchEvent.getEventCounts(startDate, endDate, groupBy);
    }

    /**
     * Get experiment-specific events
     * @param {string} experimentId - Experiment ID
     * @param {string} group - Experiment group
     * @returns {Promise<Array>} - Experiment events
     */
    async getExperimentEvents(experimentId, group = null) {
        return ResearchEvent.getExperimentEvents(experimentId, group);
    }

    /**
     * Get summary statistics for research
     * @param {Object} filters - Query filters
     * @returns {Promise<Object>} - Summary statistics
     */
    async getSummaryStats(filters = {}) {
        const pipeline = [
            { $match: this.buildMatchStage(filters) },
            {
                $group: {
                    _id: null,
                    totalEvents: { $sum: 1 },
                    uniqueUsers: { $addToSet: '$userId' },
                    uniqueSessions: { $addToSet: '$sessionId' },
                    avgResponseTime: { $avg: '$eventData.responseTime' },
                    eventTypes: { $addToSet: '$eventType' }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalEvents: 1,
                    uniqueUsers: { $size: '$uniqueUsers' },
                    uniqueSessions: { $size: '$uniqueSessions' },
                    avgResponseTime: { $round: ['$avgResponseTime', 2] },
                    eventTypeCount: { $size: '$eventTypes' }
                }
            }
        ];

        const result = await ResearchEvent.aggregate(pipeline);
        return result[0] || { totalEvents: 0, uniqueUsers: 0, uniqueSessions: 0 };
    }

    /**
     * Build match stage for aggregation
     * @param {Object} filters - Query filters
     * @returns {Object} - Match stage
     */
    buildMatchStage(filters) {
        const match = {};

        if (filters.startDate || filters.endDate) {
            match.timestamp = {};
            if (filters.startDate) match.timestamp.$gte = new Date(filters.startDate);
            if (filters.endDate) match.timestamp.$lte = new Date(filters.endDate);
        }

        if (filters.eventType) match.eventType = filters.eventType;
        if (filters.eventCategory) match.eventCategory = filters.eventCategory;
        if (filters.userId) match.userId = filters.userId;
        if (filters.experimentGroup) match['experimentData.group'] = filters.experimentGroup;

        return match;
    }

    /**
     * Shutdown the service gracefully
     */
    async shutdown() {
        this.stopFlushTimer();
        await this.flush();
        logger.info('EventTrackingService shutdown complete');
    }
}

// Singleton instance
const eventTrackingService = new EventTrackingService();

// Export both the class and the singleton for testing
module.exports = eventTrackingService;
module.exports.EventTrackingService = EventTrackingService;
