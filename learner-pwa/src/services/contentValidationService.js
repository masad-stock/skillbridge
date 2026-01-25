/**
 * Content Validation and Health Checking Service
 * 
 * Creates content URL validation and accessibility checking
 * Implements automated content health monitoring
 * Builds content integrity verification system
 * Provides proactive content issue detection and reporting
 */

import contentErrorLogger from './contentErrorLogger';

class ContentValidationService {
    constructor() {
        this.validationCache = new Map();
        this.healthCheckSchedule = new Map();
        this.validationRules = new Map();
        this.monitoringActive = false;

        // Initialize validation rules
        this.initializeValidationRules();

        // Start health monitoring
        this.startHealthMonitoring();
    }

    /**
     * Initialize validation rules for different content types
     */
    initializeValidationRules() {
        // Video content validation rules
        this.validationRules.set('video', {
            urlPattern: /^https:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}/,
            requiredFields: ['url', 'title'],
            maxTitleLength: 200,
            timeout: 10000,
            healthCheckInterval: 3600000 // 1 hour
        });

        // Text content validation rules
        this.validationRules.set('text', {
            minLength: 10,
            maxLength: 50000,
            requiredFields: ['content'],
            allowedTags: ['p', 'h1', 'h2', 'h3', 'strong', 'em', 'ul', 'ol', 'li', 'br'],
            healthCheckInterval: 7200000 // 2 hours
        });

        // Image content validation rules
        this.validationRules.set('image', {
            urlPattern: /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i,
            maxFileSize: 5 * 1024 * 1024, // 5MB
            requiredFields: ['url', 'alt'],
            timeout: 8000,
            healthCheckInterval: 1800000 // 30 minutes
        });

        // Interactive content validation rules
        this.validationRules.set('interactive', {
            requiredFields: ['questions'],
            minQuestions: 1,
            maxQuestions: 50,
            questionRequiredFields: ['question', 'options', 'correctAnswer'],
            minOptions: 2,
            maxOptions: 6,
            healthCheckInterval: 3600000 // 1 hour
        });
    }

    /**
     * Validate content based on type and rules
     */
    async validateContent(contentData, contentType, options = {}) {
        const startTime = performance.now();
        const validationId = this.generateValidationId();

        try {
            // Get validation rules for content type
            const rules = this.validationRules.get(contentType);
            if (!rules) {
                throw new Error(`No validation rules found for content type: ${contentType}`);
            }

            // Check cache first
            const cacheKey = this.generateCacheKey(contentData, contentType);
            if (!options.skipCache) {
                const cachedResult = this.validationCache.get(cacheKey);
                if (cachedResult && this.isCacheValid(cachedResult)) {
                    return cachedResult.result;
                }
            }

            // Perform validation
            const validationResult = await this.performValidation(
                contentData,
                contentType,
                rules,
                validationId
            );

            // Cache the result
            this.validationCache.set(cacheKey, {
                result: validationResult,
                timestamp: Date.now(),
                ttl: rules.healthCheckInterval || 3600000
            });

            // Log validation metrics
            const validationTime = performance.now() - startTime;
            await contentErrorLogger.logMetrics({
                moduleId: contentData.moduleId,
                lessonId: contentData.lessonId,
                validationType: contentType,
                validationTime,
                success: validationResult.isValid,
                errorCount: validationResult.errors.length,
                warningCount: validationResult.warnings.length
            });

            return validationResult;

        } catch (error) {
            const validationTime = performance.now() - startTime;

            // Log validation error
            await contentErrorLogger.logError({
                type: 'validation',
                severity: 'medium',
                message: `Content validation failed: ${error.message}`,
                moduleId: contentData.moduleId,
                lessonId: contentData.lessonId,
                errorCode: 'VALIDATION_ERROR',
                contentType,
                validationTime,
                stackTrace: error.stack
            });

            return {
                isValid: false,
                errors: [{ type: 'validation_error', message: error.message }],
                warnings: [],
                validationId,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Perform actual validation based on content type
     */
    async performValidation(contentData, contentType, rules, validationId) {
        const result = {
            isValid: true,
            errors: [],
            warnings: [],
            validationId,
            contentType,
            timestamp: new Date().toISOString(),
            details: {}
        };

        switch (contentType) {
            case 'video':
                await this.validateVideoContent(contentData, rules, result);
                break;
            case 'text':
                await this.validateTextContent(contentData, rules, result);
                break;
            case 'image':
                await this.validateImageContent(contentData, rules, result);
                break;
            case 'interactive':
                await this.validateInteractiveContent(contentData, rules, result);
                break;
            default:
                result.errors.push({
                    type: 'unknown_content_type',
                    message: `Unknown content type: ${contentType}`
                });
        }

        // Set overall validity
        result.isValid = result.errors.length === 0;

        return result;
    }

    /**
     * Validate video content
     */
    async validateVideoContent(contentData, rules, result) {
        // Check required fields
        for (const field of rules.requiredFields) {
            if (!contentData[field]) {
                result.errors.push({
                    type: 'missing_field',
                    field,
                    message: `Required field '${field}' is missing`
                });
            }
        }

        // Validate URL format
        if (contentData.url && !rules.urlPattern.test(contentData.url)) {
            result.errors.push({
                type: 'invalid_url',
                message: 'Video URL format is invalid'
            });
        }

        // Validate title length
        if (contentData.title && contentData.title.length > rules.maxTitleLength) {
            result.warnings.push({
                type: 'title_too_long',
                message: `Title exceeds maximum length of ${rules.maxTitleLength} characters`
            });
        }

        // Check video accessibility
        if (contentData.url && rules.urlPattern.test(contentData.url)) {
            try {
                const accessibilityCheck = await this.checkVideoAccessibility(
                    contentData.url,
                    rules.timeout
                );
                result.details.accessibility = accessibilityCheck;

                if (!accessibilityCheck.accessible) {
                    result.errors.push({
                        type: 'video_not_accessible',
                        message: accessibilityCheck.error || 'Video is not accessible'
                    });
                }
            } catch (error) {
                result.warnings.push({
                    type: 'accessibility_check_failed',
                    message: 'Could not verify video accessibility'
                });
            }
        }

        // Extract and validate video ID
        if (contentData.url) {
            const videoId = this.extractYouTubeVideoId(contentData.url);
            if (videoId) {
                result.details.videoId = videoId;
            } else {
                result.errors.push({
                    type: 'invalid_video_id',
                    message: 'Could not extract valid video ID from URL'
                });
            }
        }
    }

    /**
     * Validate text content
     */
    async validateTextContent(contentData, rules, result) {
        // Check required fields
        for (const field of rules.requiredFields) {
            if (!contentData[field]) {
                result.errors.push({
                    type: 'missing_field',
                    field,
                    message: `Required field '${field}' is missing`
                });
            }
        }

        // Validate content length
        if (contentData.content) {
            const contentLength = contentData.content.length;

            if (contentLength < rules.minLength) {
                result.errors.push({
                    type: 'content_too_short',
                    message: `Content is too short (${contentLength} chars, minimum ${rules.minLength})`
                });
            }

            if (contentLength > rules.maxLength) {
                result.errors.push({
                    type: 'content_too_long',
                    message: `Content is too long (${contentLength} chars, maximum ${rules.maxLength})`
                });
            }

            // Check for potentially unsafe HTML tags
            const unsafeTags = this.findUnsafeHtmlTags(contentData.content, rules.allowedTags);
            if (unsafeTags.length > 0) {
                result.warnings.push({
                    type: 'unsafe_html_tags',
                    message: `Potentially unsafe HTML tags found: ${unsafeTags.join(', ')}`
                });
            }

            // Analyze content quality
            const qualityAnalysis = this.analyzeTextQuality(contentData.content);
            result.details.quality = qualityAnalysis;

            if (qualityAnalysis.readabilityScore < 30) {
                result.warnings.push({
                    type: 'low_readability',
                    message: 'Content may be difficult to read'
                });
            }
        }
    }

    /**
     * Validate image content
     */
    async validateImageContent(contentData, rules, result) {
        // Check required fields
        for (const field of rules.requiredFields) {
            if (!contentData[field]) {
                result.errors.push({
                    type: 'missing_field',
                    field,
                    message: `Required field '${field}' is missing`
                });
            }
        }

        // Validate URL format
        if (contentData.url && !rules.urlPattern.test(contentData.url)) {
            result.errors.push({
                type: 'invalid_url',
                message: 'Image URL format is invalid'
            });
        }

        // Check image accessibility
        if (contentData.url && rules.urlPattern.test(contentData.url)) {
            try {
                const imageCheck = await this.checkImageAccessibility(
                    contentData.url,
                    rules.timeout,
                    rules.maxFileSize
                );
                result.details.image = imageCheck;

                if (!imageCheck.accessible) {
                    result.errors.push({
                        type: 'image_not_accessible',
                        message: imageCheck.error || 'Image is not accessible'
                    });
                }

                if (imageCheck.fileSize > rules.maxFileSize) {
                    result.warnings.push({
                        type: 'image_too_large',
                        message: `Image file size (${this.formatBytes(imageCheck.fileSize)}) exceeds recommended maximum (${this.formatBytes(rules.maxFileSize)})`
                    });
                }
            } catch (error) {
                result.warnings.push({
                    type: 'image_check_failed',
                    message: 'Could not verify image accessibility'
                });
            }
        }

        // Validate alt text
        if (contentData.alt) {
            if (contentData.alt.length < 3) {
                result.warnings.push({
                    type: 'alt_text_too_short',
                    message: 'Alt text should be more descriptive'
                });
            }
            if (contentData.alt.length > 125) {
                result.warnings.push({
                    type: 'alt_text_too_long',
                    message: 'Alt text should be concise (under 125 characters)'
                });
            }
        }
    }

    /**
     * Validate interactive content (quizzes, exercises)
     */
    async validateInteractiveContent(contentData, rules, result) {
        // Check required fields
        for (const field of rules.requiredFields) {
            if (!contentData[field]) {
                result.errors.push({
                    type: 'missing_field',
                    field,
                    message: `Required field '${field}' is missing`
                });
            }
        }

        // Validate questions array
        if (contentData.questions) {
            const questions = contentData.questions;

            if (questions.length < rules.minQuestions) {
                result.errors.push({
                    type: 'insufficient_questions',
                    message: `At least ${rules.minQuestions} question(s) required`
                });
            }

            if (questions.length > rules.maxQuestions) {
                result.warnings.push({
                    type: 'too_many_questions',
                    message: `Consider reducing questions to under ${rules.maxQuestions} for better user experience`
                });
            }

            // Validate each question
            questions.forEach((question, index) => {
                this.validateSingleQuestion(question, index, rules, result);
            });

            // Analyze question quality
            const qualityAnalysis = this.analyzeQuestionQuality(questions);
            result.details.questionQuality = qualityAnalysis;
        }
    }

    /**
     * Validate single question
     */
    validateSingleQuestion(question, index, rules, result) {
        const questionPrefix = `Question ${index + 1}`;

        // Check required fields
        for (const field of rules.questionRequiredFields) {
            if (!question[field]) {
                result.errors.push({
                    type: 'missing_question_field',
                    field,
                    questionIndex: index,
                    message: `${questionPrefix}: Required field '${field}' is missing`
                });
            }
        }

        // Validate options
        if (question.options) {
            if (question.options.length < rules.minOptions) {
                result.errors.push({
                    type: 'insufficient_options',
                    questionIndex: index,
                    message: `${questionPrefix}: At least ${rules.minOptions} options required`
                });
            }

            if (question.options.length > rules.maxOptions) {
                result.warnings.push({
                    type: 'too_many_options',
                    questionIndex: index,
                    message: `${questionPrefix}: Consider reducing options to ${rules.maxOptions} or fewer`
                });
            }

            // Check for duplicate options
            const duplicates = this.findDuplicateOptions(question.options);
            if (duplicates.length > 0) {
                result.warnings.push({
                    type: 'duplicate_options',
                    questionIndex: index,
                    message: `${questionPrefix}: Duplicate options found: ${duplicates.join(', ')}`
                });
            }
        }

        // Validate correct answer
        if (typeof question.correctAnswer === 'number') {
            if (question.correctAnswer < 0 ||
                question.correctAnswer >= (question.options?.length || 0)) {
                result.errors.push({
                    type: 'invalid_correct_answer',
                    questionIndex: index,
                    message: `${questionPrefix}: Correct answer index is out of range`
                });
            }
        }

        // Validate question text quality
        if (question.question) {
            if (question.question.length < 10) {
                result.warnings.push({
                    type: 'question_too_short',
                    questionIndex: index,
                    message: `${questionPrefix}: Question text should be more detailed`
                });
            }

            if (question.question.length > 500) {
                result.warnings.push({
                    type: 'question_too_long',
                    questionIndex: index,
                    message: `${questionPrefix}: Question text should be more concise`
                });
            }
        }
    }

    /**
     * Check video accessibility
     */
    async checkVideoAccessibility(videoUrl, timeout) {
        return new Promise((resolve) => {
            const timeoutId = setTimeout(() => {
                resolve({
                    accessible: false,
                    error: 'Accessibility check timeout',
                    responseTime: timeout
                });
            }, timeout);

            // Simulate accessibility check (in real implementation, this would make actual requests)
            const startTime = performance.now();

            // Extract video ID and perform basic validation
            const videoId = this.extractYouTubeVideoId(videoUrl);
            if (!videoId) {
                clearTimeout(timeoutId);
                resolve({
                    accessible: false,
                    error: 'Invalid video ID',
                    responseTime: performance.now() - startTime
                });
                return;
            }

            // Simulate network delay and occasional failures
            setTimeout(() => {
                clearTimeout(timeoutId);
                const accessible = Math.random() > 0.05; // 95% success rate
                resolve({
                    accessible,
                    error: accessible ? null : 'Video not found or private',
                    responseTime: performance.now() - startTime,
                    videoId
                });
            }, Math.random() * 2000 + 500);
        });
    }

    /**
     * Check image accessibility
     */
    async checkImageAccessibility(imageUrl, timeout, maxFileSize) {
        return new Promise((resolve) => {
            const img = new Image();
            const startTime = performance.now();

            const timeoutId = setTimeout(() => {
                resolve({
                    accessible: false,
                    error: 'Image load timeout',
                    responseTime: timeout
                });
            }, timeout);

            img.onload = () => {
                clearTimeout(timeoutId);

                // Estimate file size (rough approximation)
                const estimatedSize = img.naturalWidth * img.naturalHeight * 3; // RGB

                resolve({
                    accessible: true,
                    responseTime: performance.now() - startTime,
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                    fileSize: estimatedSize,
                    aspectRatio: img.naturalWidth / img.naturalHeight
                });
            };

            img.onerror = () => {
                clearTimeout(timeoutId);
                resolve({
                    accessible: false,
                    error: 'Image failed to load',
                    responseTime: performance.now() - startTime
                });
            };

            img.src = imageUrl;
        });
    }

    /**
     * Start automated health monitoring
     */
    startHealthMonitoring() {
        if (this.monitoringActive) return;

        this.monitoringActive = true;

        // Schedule periodic health checks
        setInterval(() => {
            this.performScheduledHealthChecks();
        }, 300000); // Every 5 minutes
    }

    /**
     * Perform scheduled health checks
     */
    async performScheduledHealthChecks() {
        const now = Date.now();

        for (const [key, schedule] of this.healthCheckSchedule.entries()) {
            if (now >= schedule.nextCheck) {
                try {
                    await this.performHealthCheck(schedule.contentData, schedule.contentType);

                    // Update next check time
                    const rules = this.validationRules.get(schedule.contentType);
                    schedule.nextCheck = now + (rules?.healthCheckInterval || 3600000);
                } catch (error) {
                    console.warn(`Health check failed for ${key}:`, error);
                }
            }
        }
    }

    /**
     * Perform health check for specific content
     */
    async performHealthCheck(contentData, contentType) {
        const validationResult = await this.validateContent(contentData, contentType, {
            skipCache: true
        });

        // Log health check results
        if (!validationResult.isValid) {
            await contentErrorLogger.logError({
                type: 'health_check',
                severity: 'medium',
                message: 'Content health check failed',
                moduleId: contentData.moduleId,
                lessonId: contentData.lessonId,
                errorCode: 'HEALTH_CHECK_FAILED',
                contentType,
                errors: validationResult.errors,
                warnings: validationResult.warnings
            });
        }

        return validationResult;
    }

    /**
     * Schedule content for health monitoring
     */
    scheduleHealthCheck(contentData, contentType) {
        const key = `${contentType}_${contentData.moduleId}_${contentData.lessonId}`;
        const rules = this.validationRules.get(contentType);

        this.healthCheckSchedule.set(key, {
            contentData,
            contentType,
            nextCheck: Date.now() + (rules?.healthCheckInterval || 3600000)
        });
    }

    /**
     * Get validation statistics
     */
    getValidationStats() {
        const stats = {
            cacheSize: this.validationCache.size,
            scheduledChecks: this.healthCheckSchedule.size,
            monitoringActive: this.monitoringActive,
            validationRules: this.validationRules.size
        };

        // Calculate cache hit rate
        let cacheHits = 0;
        let totalValidations = 0;

        for (const cached of this.validationCache.values()) {
            totalValidations++;
            if (this.isCacheValid(cached)) {
                cacheHits++;
            }
        }

        stats.cacheHitRate = totalValidations > 0 ?
            Math.round((cacheHits / totalValidations) * 100) : 0;

        return stats;
    }

    // Helper methods
    generateValidationId() {
        return `val_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    generateCacheKey(contentData, contentType) {
        const keyData = {
            type: contentType,
            moduleId: contentData.moduleId,
            lessonId: contentData.lessonId,
            url: contentData.url || contentData.content?.substring(0, 100)
        };
        return this.hashObject(keyData);
    }

    hashObject(obj) {
        const str = JSON.stringify(obj);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36);
    }

    isCacheValid(cachedItem) {
        return Date.now() - cachedItem.timestamp < cachedItem.ttl;
    }

    extractYouTubeVideoId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    findUnsafeHtmlTags(content, allowedTags) {
        const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;
        const foundTags = new Set();
        let match;

        while ((match = tagRegex.exec(content)) !== null) {
            const tagName = match[1].toLowerCase();
            if (!allowedTags.includes(tagName)) {
                foundTags.add(tagName);
            }
        }

        return Array.from(foundTags);
    }

    analyzeTextQuality(content) {
        const words = content.split(/\s+/).length;
        const sentences = content.split(/[.!?]+/).length;
        const avgWordsPerSentence = sentences > 0 ? words / sentences : 0;

        // Simple readability score (Flesch-like)
        const readabilityScore = Math.max(0, Math.min(100,
            206.835 - (1.015 * avgWordsPerSentence) - (84.6 * (content.split(/[aeiouAEIOU]/).length / words))
        ));

        return {
            wordCount: words,
            sentenceCount: sentences,
            avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
            readabilityScore: Math.round(readabilityScore),
            hasFormatting: /[*_#•\-]/.test(content)
        };
    }

    findDuplicateOptions(options) {
        const seen = new Set();
        const duplicates = [];

        options.forEach(option => {
            const normalized = option.toLowerCase().trim();
            if (seen.has(normalized)) {
                duplicates.push(option);
            } else {
                seen.add(normalized);
            }
        });

        return duplicates;
    }

    analyzeQuestionQuality(questions) {
        const analysis = {
            totalQuestions: questions.length,
            avgQuestionLength: 0,
            avgOptionsPerQuestion: 0,
            questionsWithExplanations: 0,
            difficultyDistribution: { easy: 0, medium: 0, hard: 0 }
        };

        let totalQuestionLength = 0;
        let totalOptions = 0;

        questions.forEach(question => {
            totalQuestionLength += question.question?.length || 0;
            totalOptions += question.options?.length || 0;

            if (question.explanation) {
                analysis.questionsWithExplanations++;
            }

            // Simple difficulty estimation based on question length and options
            const difficulty = this.estimateQuestionDifficulty(question);
            analysis.difficultyDistribution[difficulty]++;
        });

        analysis.avgQuestionLength = Math.round(totalQuestionLength / questions.length);
        analysis.avgOptionsPerQuestion = Math.round((totalOptions / questions.length) * 10) / 10;

        return analysis;
    }

    estimateQuestionDifficulty(question) {
        const questionLength = question.question?.length || 0;
        const optionCount = question.options?.length || 0;

        if (questionLength < 50 && optionCount <= 3) return 'easy';
        if (questionLength > 150 || optionCount > 4) return 'hard';
        return 'medium';
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Create singleton instance
const contentValidationService = new ContentValidationService();

export default contentValidationService;