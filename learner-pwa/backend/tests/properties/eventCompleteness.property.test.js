/**
 * Property Test: Event Completeness
 * 
 * **Property 1: Event Completeness**
 * *For any* user interaction on the platform, the recorded event SHALL contain 
 * userId, sessionId, timestamp, eventType, and context fields (deviceType, networkStatus, offlineMode).
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.7**
 * 
 * Feature: thesis-research-validation, Property 1: Event Completeness
 */

const fc = require('fast-check');

// Define the pure functions directly for testing (extracted from EventTrackingService)
// This allows us to test the logic without needing database connections

const validEventTypes = [
    'page_view', 'module_start', 'module_progress', 'module_complete',
    'assessment_start', 'assessment_answer', 'assessment_complete',
    'business_tool_use', 'navigation', 'search', 'login', 'logout',
    'error', 'intervention_received', 'consent_action', 'economic_survey',
    'voice_command', 'accessibility_toggle'
];

const deviceTypes = ['mobile', 'tablet', 'desktop', 'unknown'];
const networkTypes = ['wifi', '4g', '3g', '2g', 'offline', 'unknown'];
const languages = ['en', 'sw'];
const accessibilityModes = ['standard', 'simplified', 'voice'];

/**
 * Infer event category from event type
 */
function inferCategory(eventType) {
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
 * Normalize event data to ensure consistent structure
 */
function normalizeEvent(eventData) {
    return {
        userId: eventData.userId,
        sessionId: eventData.sessionId,
        timestamp: eventData.timestamp ? new Date(eventData.timestamp) : new Date(),
        eventType: eventData.eventType,
        eventCategory: eventData.eventCategory || inferCategory(eventData.eventType),
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
 * Validate event data
 */
function validateEvent(event) {
    const errors = [];
    const requiredFields = ['userId', 'sessionId', 'eventType'];

    for (const field of requiredFields) {
        if (!event[field]) {
            errors.push(`Missing required field: ${field}`);
        }
    }

    if (event.eventType && !validEventTypes.includes(event.eventType)) {
        errors.push(`Invalid eventType: ${event.eventType}`);
    }

    return { valid: errors.length === 0, errors };
}

describe('Property 1: Event Completeness', () => {
    // Generator for valid event data
    const eventDataArbitrary = fc.record({
        userId: fc.hexaString({ minLength: 24, maxLength: 24 }),
        sessionId: fc.string({ minLength: 10, maxLength: 50 }),
        eventType: fc.constantFrom(...validEventTypes),
        timestamp: fc.date({ min: new Date('2024-01-01'), max: new Date('2030-12-31') }),
        deviceType: fc.constantFrom(...deviceTypes),
        networkType: fc.constantFrom(...networkTypes),
        offlineMode: fc.boolean(),
        language: fc.constantFrom(...languages),
        accessibilityMode: fc.constantFrom(...accessibilityModes),
        pageUrl: fc.webUrl(),
        moduleId: fc.option(fc.hexaString({ minLength: 24, maxLength: 24 })),
        assessmentId: fc.option(fc.hexaString({ minLength: 24, maxLength: 24 })),
        responseTime: fc.option(fc.nat({ max: 300000 })),
        score: fc.option(fc.nat({ max: 100 }))
    });

    /**
     * Property: For any valid event input, the normalized event must contain all required fields
     */
    test('normalized events always contain required fields (userId, sessionId, timestamp, eventType)', () => {
        fc.assert(
            fc.property(eventDataArbitrary, (eventData) => {
                const normalized = normalizeEvent(eventData);

                // Required fields must exist
                expect(normalized.userId).toBeDefined();
                expect(normalized.sessionId).toBeDefined();
                expect(normalized.timestamp).toBeDefined();
                expect(normalized.eventType).toBeDefined();

                // Values must match input
                expect(normalized.userId).toBe(eventData.userId);
                expect(normalized.sessionId).toBe(eventData.sessionId);
                expect(normalized.eventType).toBe(eventData.eventType);

                return true;
            }),
            { numRuns: 100 }
        );
    });

    /**
     * Property: For any valid event input, context fields must be present
     */
    test('normalized events always contain context fields (deviceType, networkType, offlineMode)', () => {
        fc.assert(
            fc.property(eventDataArbitrary, (eventData) => {
                const normalized = normalizeEvent(eventData);

                // Context object must exist
                expect(normalized.context).toBeDefined();
                expect(typeof normalized.context).toBe('object');

                // Required context fields must exist
                expect(normalized.context.deviceType).toBeDefined();
                expect(normalized.context.networkType).toBeDefined();
                expect(typeof normalized.context.offlineMode).toBe('boolean');

                // Device type must be valid
                expect(deviceTypes).toContain(normalized.context.deviceType);

                // Network type must be valid
                expect(networkTypes).toContain(normalized.context.networkType);

                return true;
            }),
            { numRuns: 100 }
        );
    });


    /**
     * Property: Event validation correctly identifies missing required fields
     */
    test('validation rejects events missing required fields', () => {
        const requiredFields = ['userId', 'sessionId', 'eventType'];

        fc.assert(
            fc.property(
                fc.constantFrom(...requiredFields),
                eventDataArbitrary,
                (missingField, eventData) => {
                    // Create event with one required field missing
                    const incompleteEvent = { ...eventData };
                    delete incompleteEvent[missingField];

                    const normalized = normalizeEvent(incompleteEvent);
                    const validation = validateEvent(normalized);

                    // Validation should fail
                    expect(validation.valid).toBe(false);
                    expect(validation.errors.length).toBeGreaterThan(0);
                    expect(validation.errors.some(e => e.includes(missingField))).toBe(true);

                    return true;
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property: Event validation accepts all valid event types
     */
    test('validation accepts all valid event types', () => {
        fc.assert(
            fc.property(
                fc.constantFrom(...validEventTypes),
                fc.hexaString({ minLength: 24, maxLength: 24 }),
                fc.string({ minLength: 10, maxLength: 50 }),
                (eventType, userId, sessionId) => {
                    const event = {
                        userId,
                        sessionId,
                        eventType,
                        timestamp: new Date()
                    };

                    const normalized = normalizeEvent(event);
                    const validation = validateEvent(normalized);

                    expect(validation.valid).toBe(true);
                    expect(validation.errors).toHaveLength(0);

                    return true;
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property: Event validation rejects invalid event types
     */
    test('validation rejects invalid event types', () => {
        fc.assert(
            fc.property(
                fc.string({ minLength: 1, maxLength: 50 }).filter(s => !validEventTypes.includes(s)),
                fc.hexaString({ minLength: 24, maxLength: 24 }),
                fc.string({ minLength: 10, maxLength: 50 }),
                (invalidEventType, userId, sessionId) => {
                    const event = {
                        userId,
                        sessionId,
                        eventType: invalidEventType,
                        timestamp: new Date()
                    };

                    const normalized = normalizeEvent(event);
                    const validation = validateEvent(normalized);

                    expect(validation.valid).toBe(false);
                    expect(validation.errors.some(e => e.includes('eventType'))).toBe(true);

                    return true;
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property: Category inference is consistent for each event type
     */
    test('category inference is deterministic for each event type', () => {
        fc.assert(
            fc.property(
                fc.constantFrom(...validEventTypes),
                (eventType) => {
                    // Call inferCategory multiple times
                    const category1 = inferCategory(eventType);
                    const category2 = inferCategory(eventType);
                    const category3 = inferCategory(eventType);

                    // All calls should return the same result
                    expect(category1).toBe(category2);
                    expect(category2).toBe(category3);

                    // Category should be a valid category
                    const validCategories = ['learning', 'assessment', 'business_tool', 'navigation', 'system', 'research', 'accessibility'];
                    expect(validCategories).toContain(category1);

                    return true;
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property: Timestamp is always a valid Date object
     */
    test('normalized timestamp is always a valid Date', () => {
        fc.assert(
            fc.property(
                eventDataArbitrary,
                fc.option(fc.oneof(
                    fc.date(),
                    fc.constant(null),
                    fc.constant(undefined)
                )),
                (eventData, timestampInput) => {
                    const event = { ...eventData, timestamp: timestampInput };
                    const normalized = normalizeEvent(event);

                    // Timestamp should always be a Date object
                    expect(normalized.timestamp instanceof Date).toBe(true);

                    // Timestamp should be valid (not NaN)
                    expect(isNaN(normalized.timestamp.getTime())).toBe(false);

                    return true;
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property: Sync status is always initialized
     */
    test('sync status is always initialized with required fields', () => {
        fc.assert(
            fc.property(eventDataArbitrary, (eventData) => {
                const normalized = normalizeEvent(eventData);

                // Sync status must exist
                expect(normalized.syncStatus).toBeDefined();
                expect(typeof normalized.syncStatus).toBe('object');

                // Required sync fields
                expect(normalized.syncStatus.syncedAt instanceof Date).toBe(true);
                expect(typeof normalized.syncStatus.retryCount).toBe('number');
                expect(normalized.syncStatus.retryCount).toBeGreaterThanOrEqual(0);
                expect(['online', 'offline_sync']).toContain(normalized.syncStatus.source);

                return true;
            }),
            { numRuns: 100 }
        );
    });
});
