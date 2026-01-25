/**
 * ML Service Client
 * Handles communication with the Python ML microservice
 * Implements retry logic, circuit breaker, and fallback mechanisms
 */

const axios = require('axios');
const logger = require('../utils/logger');

class MLServiceClient {
    constructor() {
        this.baseURL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
        this.apiKey = process.env.ML_API_KEY || 'dev-key';
        this.timeout = parseInt(process.env.ML_SERVICE_TIMEOUT || '30000');

        // Circuit breaker state
        this.circuitState = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
        this.failureCount = 0;
        this.failureThreshold = 5;
        this.resetTimeout = 60000; // 1 minute
        this.lastFailureTime = null;

        // Cache for predictions
        this.cache = new Map();
        this.cacheTimeout = 300000; // 5 minutes

        // Create axios instance
        this.client = axios.create({
            baseURL: this.baseURL,
            timeout: this.timeout,
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': this.apiKey
            }
        });

        // Add response interceptor for error handling
        this.client.interceptors.response.use(
            response => response,
            error => this.handleError(error)
        );
    }

    /**
     * Check if circuit breaker allows requests
     */
    canMakeRequest() {
        if (this.circuitState === 'CLOSED') {
            return true;
        }

        if (this.circuitState === 'OPEN') {
            const timeSinceLastFailure = Date.now() - this.lastFailureTime;
            if (timeSinceLastFailure > this.resetTimeout) {
                this.circuitState = 'HALF_OPEN';
                logger.info('Circuit breaker entering HALF_OPEN state');
                return true;
            }
            return false;
        }

        // HALF_OPEN state - allow one request to test
        return true;
    }

    /**
     * Record successful request
     */
    recordSuccess() {
        this.failureCount = 0;
        if (this.circuitState === 'HALF_OPEN') {
            this.circuitState = 'CLOSED';
            logger.info('Circuit breaker CLOSED - service recovered');
        }
    }

    /**
     * Record failed request
     */
    recordFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();

        if (this.failureCount >= this.failureThreshold) {
            this.circuitState = 'OPEN';
            logger.warn(`Circuit breaker OPEN - ML service unavailable (${this.failureCount} failures)`);
        }
    }

    /**
     * Handle errors from ML service
     */
    handleError(error) {
        this.recordFailure();

        if (error.response) {
            logger.error(`ML Service error: ${error.response.status} - ${error.response.data}`);
        } else if (error.request) {
            logger.error('ML Service not responding');
        } else {
            logger.error(`ML Service request error: ${error.message}`);
        }

        throw error;
    }

    /**
     * Make request with retry logic
     */
    async makeRequest(method, endpoint, data = null, retries = 3) {
        if (!this.canMakeRequest()) {
            throw new Error('ML Service circuit breaker is OPEN');
        }

        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const config = { method, url: endpoint };
                if (data) {
                    config.data = data;
                }

                const response = await this.client.request(config);
                this.recordSuccess();
                return response.data;
            } catch (error) {
                if (attempt === retries) {
                    throw error;
                }

                // Exponential backoff
                const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
                logger.warn(`ML Service request failed, retrying in ${delay}ms (attempt ${attempt}/${retries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    /**
     * Get cached result or make request
     */
    async getCachedOrFetch(cacheKey, fetchFunction) {
        // Check cache
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            logger.debug(`Cache hit for ${cacheKey}`);
            return cached.data;
        }

        // Fetch new data
        const data = await fetchFunction();

        // Store in cache
        this.cache.set(cacheKey, {
            data,
            timestamp: Date.now()
        });

        // Clean old cache entries
        this.cleanCache();

        return data;
    }

    /**
     * Clean expired cache entries
     */
    cleanCache() {
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
            if (now - value.timestamp > this.cacheTimeout) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Check ML service health
     */
    async checkHealth() {
        try {
            const response = await this.client.get('/health');
            return {
                available: true,
                ...response.data
            };
        } catch (error) {
            return {
                available: false,
                error: error.message
            };
        }
    }

    /**
     * Assess user competency (will be implemented in task 1.2)
     */
    async assessCompetency(userId, responses, timings, confidence) {
        try {
            const cacheKey = `competency_${userId}_${JSON.stringify(responses).substring(0, 50)}`;

            return await this.getCachedOrFetch(cacheKey, async () => {
                return await this.makeRequest('POST', '/ml/assess-competency', {
                    userId,
                    responses,
                    timings,
                    confidence
                });
            });
        } catch (error) {
            logger.error('Failed to assess competency via ML service, using fallback');
            return this.fallbackAssessCompetency(responses);
        }
    }

    /**
     * Fallback competency assessment (rule-based)
     */
    fallbackAssessCompetency(responses) {
        const correctCount = responses.filter(r => r.correct).length;
        const accuracy = correctCount / responses.length;

        let level = 1; // Beginner
        if (accuracy >= 0.9) level = 4; // Expert
        else if (accuracy >= 0.7) level = 3; // Advanced
        else if (accuracy >= 0.5) level = 2; // Intermediate

        return {
            competencyLevel: level,
            accuracy,
            confidence: 0.6, // Lower confidence for fallback
            method: 'rule-based-fallback'
        };
    }

    /**
     * Get content recommendations (will be implemented in task 1.2)
     */
    async getRecommendations(userId, currentModule, performance, context) {
        try {
            return await this.makeRequest('POST', '/ml/recommend-content', {
                userId,
                currentModule,
                performance,
                context
            });
        } catch (error) {
            logger.error('Failed to get recommendations via ML service, using fallback');
            return this.fallbackRecommendations(currentModule);
        }
    }

    /**
     * Fallback recommendations (simple next module)
     */
    fallbackRecommendations(currentModule) {
        return {
            recommendations: [],
            reasoning: 'Fallback recommendation - ML service unavailable',
            confidence: 0.5,
            method: 'fallback'
        };
    }

    /**
     * Predict dropout risk (will be implemented in task 1.2)
     */
    async predictDropout(userId, engagementMetrics, performanceHistory) {
        try {
            const cacheKey = `dropout_${userId}`;

            return await this.getCachedOrFetch(cacheKey, async () => {
                return await this.makeRequest('POST', '/ml/predict-dropout', {
                    userId,
                    engagementMetrics,
                    performanceHistory
                });
            });
        } catch (error) {
            logger.error('Failed to predict dropout via ML service, using fallback');
            return this.fallbackDropoutPrediction(engagementMetrics);
        }
    }

    /**
     * Fallback dropout prediction
     */
    fallbackDropoutPrediction(engagementMetrics) {
        // Simple rule-based prediction
        const { lastActive, modulesCompleted, averageScore } = engagementMetrics;

        let risk = 0.3; // Default low risk

        // Increase risk if inactive
        const daysSinceActive = (Date.now() - new Date(lastActive)) / (1000 * 60 * 60 * 24);
        if (daysSinceActive > 7) risk += 0.3;
        if (daysSinceActive > 14) risk += 0.2;

        // Increase risk if low completion
        if (modulesCompleted < 2) risk += 0.2;

        // Increase risk if low performance
        if (averageScore < 50) risk += 0.2;

        return {
            dropoutRisk: Math.min(risk, 0.95),
            factors: ['rule-based-estimation'],
            interventions: ['Send motivational message'],
            confidence: 0.5,
            method: 'rule-based-fallback'
        };
    }

    /**
     * Generate personalized learning path (will be implemented in task 1.2)
     */
    async generateLearningPath(userId, goals, constraints, competencyProfile) {
        try {
            return await this.makeRequest('POST', '/ml/generate-learning-path', {
                userId,
                goals,
                constraints,
                competencyProfile
            });
        } catch (error) {
            logger.error('Failed to generate learning path via ML service, using fallback');
            return this.fallbackLearningPath();
        }
    }

    /**
     * Fallback learning path generation
     */
    fallbackLearningPath() {
        return {
            learningPath: [],
            estimatedDuration: 0,
            milestones: [],
            method: 'fallback'
        };
    }
}

// Export singleton instance
module.exports = new MLServiceClient();
