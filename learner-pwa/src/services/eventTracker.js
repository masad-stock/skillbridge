/**
 * Event Tracker Service
 * Captures user interactions for research analytics and thesis validation
 * Supports offline queuing and automatic context capture
 */

import api from './api';
import offlineEventQueue from './offlineEventQueue';

class EventTracker {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.eventQueue = [];
        this.batchSize = 10;
        this.flushInterval = 30000; // 30 seconds
        this.flushTimer = null;
        this.isOnline = navigator.onLine;
        this.context = this.captureContext();
        this.offlineQueue = offlineEventQueue;

        // Listen for online/offline events
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
    }

    /**
     * Initialize the tracker and start periodic flush
     */
    async initialize() {
        // Initialize offline queue
        await this.offlineQueue.initialize();

        this.startFlushTimer();
        this.trackPageView(window.location.pathname);

        // Track route changes for SPAs
        this.setupRouteTracking();

        console.log('[EventTracker] Initialized with session:', this.sessionId);
    }

    /**
     * Generate a unique session ID
     */
    generateSessionId() {
        const timestamp = Date.now().toString(36);
        const randomPart = Math.random().toString(36).substring(2, 15);
        return `${timestamp}-${randomPart}`;
    }

    /**
     * Capture device and environment context
     */
    captureContext() {
        const ua = navigator.userAgent;
        let deviceType = 'desktop';

        if (/Mobile|Android|iPhone|iPad/.test(ua)) {
            deviceType = /iPad|Tablet/.test(ua) ? 'tablet' : 'mobile';
        }

        return {
            deviceType,
            networkType: this.getNetworkType(),
            offlineMode: !navigator.onLine,
            language: localStorage.getItem('language') || 'en',
            accessibilityMode: localStorage.getItem('accessibilityMode') || 'standard',
            userAgent: ua,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height
        };
    }

    /**
     * Get network connection type
     */
    getNetworkType() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (!connection) return 'unknown';

        const type = connection.effectiveType || connection.type;
        const typeMap = {
            'slow-2g': '2g',
            '2g': '2g',
            '3g': '3g',
            '4g': '4g',
            'wifi': 'wifi'
        };

        return typeMap[type] || 'unknown';
    }


    /**
     * Track a generic event
     * @param {string} eventType - Type of event
     * @param {string} eventCategory - Category of event
     * @param {Object} eventData - Additional event data
     */
    track(eventType, eventCategory, eventData = {}) {
        const event = {
            sessionId: this.sessionId,
            timestamp: new Date().toISOString(),
            eventType,
            eventCategory,
            eventData,
            context: {
                ...this.context,
                offlineMode: !navigator.onLine,
                networkType: this.getNetworkType()
            }
        };

        this.eventQueue.push(event);

        // Flush if queue reaches batch size
        if (this.eventQueue.length >= this.batchSize) {
            this.flush();
        }
    }

    /**
     * Track page view
     * @param {string} pageUrl - URL of the page
     */
    trackPageView(pageUrl) {
        this.track('page_view', 'navigation', {
            pageUrl,
            referrer: document.referrer
        });
    }

    /**
     * Track module start
     * @param {string} moduleId - Module ID
     * @param {string} moduleName - Module name
     */
    trackModuleStart(moduleId, moduleName) {
        this.track('module_start', 'learning', {
            moduleId,
            metadata: { moduleName }
        });
    }

    /**
     * Track module progress
     * @param {string} moduleId - Module ID
     * @param {number} progress - Progress percentage (0-100)
     * @param {number} interactions - Number of interactions
     */
    trackModuleProgress(moduleId, progress, interactions = 0) {
        this.track('module_progress', 'learning', {
            moduleId,
            score: progress,
            interactions
        });
    }

    /**
     * Track module completion
     * @param {string} moduleId - Module ID
     * @param {number} score - Final score
     * @param {number} duration - Time spent in milliseconds
     */
    trackModuleComplete(moduleId, score, duration) {
        this.track('module_complete', 'learning', {
            moduleId,
            score,
            responseTime: duration
        });
    }

    /**
     * Track assessment start
     * @param {string} assessmentId - Assessment ID
     * @param {string} assessmentType - Type of assessment
     */
    trackAssessmentStart(assessmentId, assessmentType) {
        this.track('assessment_start', 'assessment', {
            assessmentId,
            metadata: { assessmentType }
        });
    }

    /**
     * Track assessment answer
     * @param {string} assessmentId - Assessment ID
     * @param {string} questionId - Question ID
     * @param {string} answer - Selected answer
     * @param {number} responseTime - Time to answer in milliseconds
     * @param {string} previousAnswer - Previous answer if changed
     * @param {number} confidence - Self-reported confidence (1-5)
     */
    trackAssessmentAnswer(assessmentId, questionId, answer, responseTime, previousAnswer = null, confidence = null) {
        this.track('assessment_answer', 'assessment', {
            assessmentId,
            questionId,
            currentAnswer: answer,
            previousAnswer,
            responseTime,
            confidence
        });
    }

    /**
     * Track assessment completion
     * @param {string} assessmentId - Assessment ID
     * @param {number} score - Final score
     * @param {number} duration - Total time in milliseconds
     */
    trackAssessmentComplete(assessmentId, score, duration) {
        this.track('assessment_complete', 'assessment', {
            assessmentId,
            score,
            responseTime: duration
        });
    }

    /**
     * Track business tool usage
     * @param {string} toolName - Name of the tool
     * @param {string} actionType - Type of action performed
     * @param {Object} metadata - Additional metadata
     */
    trackBusinessToolUse(toolName, actionType, metadata = {}) {
        this.track('business_tool_use', 'business_tool', {
            toolName,
            actionType,
            metadata
        });
    }

    /**
     * Track search
     * @param {string} query - Search query
     * @param {number} resultsCount - Number of results
     */
    trackSearch(query, resultsCount) {
        this.track('search', 'navigation', {
            searchQuery: query,
            metadata: { resultsCount }
        });
    }

    /**
     * Track login
     */
    trackLogin() {
        this.track('login', 'system', {});
    }

    /**
     * Track logout
     */
    trackLogout() {
        this.track('logout', 'system', {});
    }

    /**
     * Track error
     * @param {string} errorMessage - Error message
     * @param {string} errorStack - Error stack trace
     * @param {string} pageUrl - Page where error occurred
     */
    trackError(errorMessage, errorStack, pageUrl) {
        this.track('error', 'system', {
            pageUrl,
            metadata: { errorMessage, errorStack }
        });
    }

    /**
     * Track voice command
     * @param {string} command - Voice command spoken
     * @param {boolean} recognized - Whether command was recognized
     * @param {string} action - Action taken
     */
    trackVoiceCommand(command, recognized, action) {
        this.track('voice_command', 'accessibility', {
            metadata: { command, recognized, action }
        });
    }

    /**
     * Track accessibility mode toggle
     * @param {string} mode - New accessibility mode
     * @param {boolean} enabled - Whether mode was enabled
     */
    trackAccessibilityToggle(mode, enabled) {
        this.track('accessibility_toggle', 'accessibility', {
            metadata: { mode, enabled }
        });

        // Update context
        this.context.accessibilityMode = enabled ? mode : 'standard';
    }


    /**
     * Setup route change tracking for React Router
     */
    setupRouteTracking() {
        // Listen for popstate (browser back/forward)
        window.addEventListener('popstate', () => {
            this.trackPageView(window.location.pathname);
        });

        // Override pushState and replaceState
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        history.pushState = (...args) => {
            originalPushState.apply(history, args);
            this.trackPageView(window.location.pathname);
        };

        history.replaceState = (...args) => {
            originalReplaceState.apply(history, args);
            this.trackPageView(window.location.pathname);
        };
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
     * Handle coming online
     */
    async handleOnline() {
        this.isOnline = true;
        this.context.offlineMode = false;
        console.log('[EventTracker] Online - flushing queued events');

        // Flush in-memory queue
        await this.flush();

        // Sync IndexedDB queue
        await this.offlineQueue.syncPendingEvents();
    }

    /**
     * Handle going offline
     */
    handleOffline() {
        this.isOnline = false;
        this.context.offlineMode = true;
        console.log('[EventTracker] Offline - events will be queued');
    }

    /**
     * Flush events to server
     */
    async flush() {
        if (this.eventQueue.length === 0) {
            return { flushed: 0 };
        }

        const eventsToFlush = [...this.eventQueue];
        this.eventQueue = [];

        // If offline, queue events to IndexedDB
        if (!this.isOnline) {
            console.log('[EventTracker] Offline - queuing to IndexedDB:', eventsToFlush.length);
            await this.offlineQueue.queueEvents(eventsToFlush);
            return { queued: eventsToFlush.length };
        }

        try {
            const response = await api.post('/research/events/batch', {
                events: eventsToFlush
            });

            console.log('[EventTracker] Flushed events:', response.data);
            return response.data;
        } catch (error) {
            // Queue events to IndexedDB on failure
            console.error('[EventTracker] Flush failed, queuing to IndexedDB:', error.message);
            await this.offlineQueue.queueEvents(eventsToFlush);
            return { error: error.message, queued: eventsToFlush.length };
        }
    }

    /**
     * Set experiment data for all future events
     * @param {Object} experimentData - Experiment assignment data
     */
    setExperimentData(experimentData) {
        this.experimentData = experimentData;
    }

    /**
     * Update language preference
     * @param {string} language - Language code (en/sw)
     */
    setLanguage(language) {
        this.context.language = language;
    }

    /**
     * Get current session ID
     */
    getSessionId() {
        return this.sessionId;
    }

    /**
     * Get queue size (includes IndexedDB queue)
     */
    async getQueueSize() {
        const memoryQueue = this.eventQueue.length;
        const offlineQueue = await this.offlineQueue.getQueueSize();
        return memoryQueue + offlineQueue;
    }

    /**
     * Get sync status
     */
    async getSyncStatus() {
        return await this.offlineQueue.getSyncStatus();
    }

    /**
     * Shutdown tracker gracefully
     */
    async shutdown() {
        this.stopFlushTimer();
        await this.flush();
        console.log('[EventTracker] Shutdown complete');
    }
}

// Singleton instance
const eventTracker = new EventTracker();

export default eventTracker;

// Named exports for specific tracking functions
export const trackPageView = (url) => eventTracker.trackPageView(url);
export const trackModuleStart = (id, name) => eventTracker.trackModuleStart(id, name);
export const trackModuleProgress = (id, progress, interactions) => eventTracker.trackModuleProgress(id, progress, interactions);
export const trackModuleComplete = (id, score, duration) => eventTracker.trackModuleComplete(id, score, duration);
export const trackAssessmentStart = (id, type) => eventTracker.trackAssessmentStart(id, type);
export const trackAssessmentAnswer = (assessmentId, questionId, answer, time, prev, conf) =>
    eventTracker.trackAssessmentAnswer(assessmentId, questionId, answer, time, prev, conf);
export const trackAssessmentComplete = (id, score, duration) => eventTracker.trackAssessmentComplete(id, score, duration);
export const trackBusinessToolUse = (tool, action, meta) => eventTracker.trackBusinessToolUse(tool, action, meta);
export const trackSearch = (query, count) => eventTracker.trackSearch(query, count);
export const trackLogin = () => eventTracker.trackLogin();
export const trackLogout = () => eventTracker.trackLogout();
export const trackError = (msg, stack, url) => eventTracker.trackError(msg, stack, url);
export const trackVoiceCommand = (cmd, recognized, action) => eventTracker.trackVoiceCommand(cmd, recognized, action);
export const trackAccessibilityToggle = (mode, enabled) => eventTracker.trackAccessibilityToggle(mode, enabled);
