const mongoose = require('mongoose');

// Interactive Element Schema
const interactiveElementSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['quiz', 'checklist', 'template', 'exercise', 'reflection'],
        required: true
    },
    title: { type: String, required: true },
    instructions: String,
    data: {
        // Quiz data
        questions: [{
            question: String,
            options: [String],
            correctAnswer: Number,
            explanation: String
        }],
        // Checklist data
        items: [{
            text: String,
            required: { type: Boolean, default: false }
        }],
        // Template data
        templateUrl: String,
        downloadInstructions: String
    }
});

// Section Schema
const sectionSchema = new mongoose.Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    type: {
        type: String,
        enum: ['introduction', 'lesson', 'exercise', 'assessment', 'summary'],
        required: true
    },
    content: String, // Rich HTML content
    estimatedTime: { type: Number, default: 0 }, // minutes
    learningObjectives: [String],
    keyTakeaways: [String],
    interactiveElements: [interactiveElementSchema],
    resources: [{
        title: String,
        type: { type: String, enum: ['pdf', 'video', 'article', 'interactive', 'template'] },
        url: String,
        description: String,
        size: Number
    }]
});

// Practical Exercise Schema
const practicalExerciseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    difficulty: { type: Number, min: 1, max: 3, default: 1 },
    estimatedTime: Number, // minutes
    tools: [{
        name: String,
        type: { type: String, enum: ['free', 'paid', 'mobile', 'web'] },
        alternatives: [String],
        kenyanAvailability: String
    }],
    steps: [{
        stepNumber: Number,
        instruction: String,
        screenshot: String,
        tips: [String],
        commonMistakes: [String]
    }],
    expectedOutcome: String,
    evaluationCriteria: [String]
});

// Troubleshooting Schema
const troubleshootingSchema = new mongoose.Schema({
    problem: { type: String, required: true },
    symptoms: [String],
    solutions: [String],
    prevention: String
});

// Career Pathway Schema
const careerPathwaySchema = new mongoose.Schema({
    jobOpportunities: [String],
    nextSteps: [String],
    advancedSkills: [String],
    certifications: [String]
});

// Kenyan Context Schema
const kenyanContextSchema = new mongoose.Schema({
    localExamples: [String],
    businessCases: [String],
    regulations: [String],
    localTools: [String]
});

// Offline Content Schema
const offlineContentSchema = new mongoose.Schema({
    // Text-first content (primary for offline)
    textContent: String, // Markdown or HTML
    plainText: String, // Stripped version for text-only mode

    // Video alternatives
    videoTranscript: String, // Full transcript of video content
    videoKeyFrames: [String], // URLs to key frame images
    videoSummary: String, // Text summary of video content

    // Optimized images
    images: [{
        original: String, // Original URL
        low: String, // 50KB version
        medium: String, // 150KB version
        high: String, // 300KB version
        alt: String, // Alt text
        caption: String
    }],

    // Offline metadata
    downloadSize: {
        textOnly: Number, // Bytes
        withLowImages: Number,
        withMediumImages: Number,
        withHighImages: Number,
        full: Number
    },

    lastOptimized: Date,
    offlineVersion: { type: Number, default: 1 }
});

const moduleSchema = new mongoose.Schema({
    moduleId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    difficulty: { type: Number, min: 1, max: 4, required: true },
    priority: { type: Number, default: 5 },
    estimatedTime: { type: Number, required: true }, // minutes
    content: {
        videoUrl: String,
        youtubeId: String,
        instructor: String,
        transcript: String,
        textContent: String, // Legacy text content
        materials: [{
            title: String,
            type: { type: String, enum: ['pdf', 'video', 'article', 'interactive'] },
            url: String,
            size: Number
        }]
    },
    // Enhanced content structure
    enhancedContent: {
        sections: [sectionSchema],
        practicalExercises: [practicalExerciseSchema],
        troubleshooting: [troubleshootingSchema],
        careerPathways: careerPathwaySchema,
        kenyanContext: kenyanContextSchema,
        isEnhanced: { type: Boolean, default: false }
    },
    // Offline-optimized content
    offlineContent: offlineContentSchema,
    // Image fields for AI-generated images
    imageUrl: String,
    imagePrompt: String,
    hasCustomImage: { type: Boolean, default: false },
    prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }],
    learningObjectives: [String],
    skills: [String],
    assessmentCriteria: [{
        criterion: String,
        weight: Number
    }],
    isActive: { type: Boolean, default: true },
    offlineAvailable: { type: Boolean, default: true },
    metadata: {
        views: { type: Number, default: 0 },
        completions: { type: Number, default: 0 },
        averageRating: { type: Number, default: 0 },
        averageCompletionTime: Number
    }
}, {
    timestamps: true
});

// Validation methods for enhanced content
moduleSchema.methods.validateEnhancedContent = function () {
    if (!this.enhancedContent.isEnhanced) {
        return { isValid: true, errors: [] };
    }

    const errors = [];

    // Validate sections
    if (!this.enhancedContent.sections || this.enhancedContent.sections.length === 0) {
        errors.push('Enhanced modules must have at least one section');
    }

    // Check for required section types
    const sectionTypes = this.enhancedContent.sections.map(s => s.type);
    if (!sectionTypes.includes('introduction')) {
        errors.push('Enhanced modules must have an introduction section');
    }

    // Validate practical exercises
    if (!this.enhancedContent.practicalExercises || this.enhancedContent.practicalExercises.length < 3) {
        errors.push('Enhanced modules must have at least 3 practical exercises');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

// Method to calculate total estimated time including enhanced content
moduleSchema.methods.getTotalEstimatedTime = function () {
    let totalTime = this.estimatedTime;

    if (this.enhancedContent.isEnhanced) {
        // Add time from sections
        const sectionTime = this.enhancedContent.sections.reduce((sum, section) => {
            return sum + (section.estimatedTime || 0);
        }, 0);

        // Add time from practical exercises
        const exerciseTime = this.enhancedContent.practicalExercises.reduce((sum, exercise) => {
            return sum + (exercise.estimatedTime || 0);
        }, 0);

        totalTime = Math.max(totalTime, sectionTime + exerciseTime);
    }

    return totalTime;
};

// Method to get content for display (enhanced or legacy)
moduleSchema.methods.getDisplayContent = function () {
    if (this.enhancedContent.isEnhanced) {
        return {
            type: 'enhanced',
            sections: this.enhancedContent.sections,
            practicalExercises: this.enhancedContent.practicalExercises,
            troubleshooting: this.enhancedContent.troubleshooting,
            careerPathways: this.enhancedContent.careerPathways,
            kenyanContext: this.enhancedContent.kenyanContext
        };
    }

    return {
        type: 'legacy',
        content: this.content
    };
};

// Method to get offline-optimized content
moduleSchema.methods.getOfflineContent = function (quality = 'medium') {
    const offlineData = {
        moduleId: this.moduleId,
        title: this.title,
        description: this.description,
        estimatedTime: this.estimatedTime,
        textContent: this.offlineContent?.textContent || this.content?.textContent || '',
        plainText: this.offlineContent?.plainText || '',
        videoTranscript: this.offlineContent?.videoTranscript || this.content?.transcript || '',
        videoSummary: this.offlineContent?.videoSummary || '',
        images: [],
        downloadSize: 0
    };

    // Add images based on quality
    if (this.offlineContent?.images) {
        offlineData.images = this.offlineContent.images.map(img => ({
            url: img[quality] || img.medium || img.original,
            alt: img.alt,
            caption: img.caption
        }));
    }

    // Set download size
    if (this.offlineContent?.downloadSize) {
        const sizeKey = quality === 'low' ? 'withLowImages' :
            quality === 'high' ? 'withHighImages' :
                'withMediumImages';
        offlineData.downloadSize = this.offlineContent.downloadSize[sizeKey] || 0;
    }

    return offlineData;
};

// Method to estimate offline download size
moduleSchema.methods.estimateOfflineSize = function (options = {}) {
    const { textOnly = false, imageQuality = 'medium' } = options;

    if (!this.offlineContent?.downloadSize) {
        // Rough estimation if not calculated
        const textSize = (this.offlineContent?.textContent?.length || 0) * 2; // UTF-8 estimate
        const imageCount = this.offlineContent?.images?.length || 0;
        const imageSizeMap = { low: 50 * 1024, medium: 150 * 1024, high: 300 * 1024 };
        const imageSize = textOnly ? 0 : imageCount * (imageSizeMap[imageQuality] || imageSizeMap.medium);

        return textSize + imageSize;
    }

    if (textOnly) {
        return this.offlineContent.downloadSize.textOnly || 0;
    }

    const sizeKey = imageQuality === 'low' ? 'withLowImages' :
        imageQuality === 'high' ? 'withHighImages' :
            'withMediumImages';

    return this.offlineContent.downloadSize[sizeKey] || 0;
};

// Method to check if module has offline content ready
moduleSchema.methods.hasOfflineContent = function () {
    return !!(this.offlineContent &&
        (this.offlineContent.textContent || this.offlineContent.plainText));
};

module.exports = mongoose.model('Module', moduleSchema);
