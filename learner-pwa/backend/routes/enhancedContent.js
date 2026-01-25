const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Module = require('../models/Module');
const ContentVersion = require('../models/ContentVersion');
const ContentValidationService = require('../services/contentValidationService');

/**
 * Enhanced Content API Routes
 * Handles CRUD operations for enhanced module content
 */

// @route   GET /api/v1/enhanced-content/modules/:moduleId
// @desc    Get enhanced content for a module
// @access  Private
router.get('/modules/:moduleId', protect, async (req, res) => {
    try {
        const module = await Module.findOne({ moduleId: req.params.moduleId });

        if (!module) {
            return res.status(404).json({
                success: false,
                message: 'Module not found'
            });
        }

        // Get display content (enhanced or legacy)
        const displayContent = module.getDisplayContent();

        // Get active version if enhanced
        let activeVersion = null;
        if (module.enhancedContent?.isEnhanced) {
            activeVersion = await ContentVersion.getActiveVersion(req.params.moduleId);
        }

        res.json({
            success: true,
            data: {
                moduleId: module.moduleId,
                title: module.title,
                description: module.description,
                category: module.category,
                difficulty: module.difficulty,
                estimatedTime: module.getTotalEstimatedTime(),
                isEnhanced: module.enhancedContent?.isEnhanced || false,
                content: displayContent,
                version: activeVersion?.version || 1,
                lastUpdated: activeVersion?.updatedAt || module.updatedAt
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/v1/enhanced-content/modules/:moduleId
// @desc    Update enhanced content for a module
// @access  Admin only
router.put('/modules/:moduleId', protect, authorize('admin'), async (req, res) => {
    try {
        const { enhancedContent, versionName, description } = req.body;

        const module = await Module.findOne({ moduleId: req.params.moduleId });

        if (!module) {
            return res.status(404).json({
                success: false,
                message: 'Module not found'
            });
        }

        // Validate enhanced content
        const validation = ContentValidationService.validateEnhancedContent(enhancedContent);

        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Content validation failed',
                errors: validation.errors,
                warnings: validation.warnings
            });
        }

        // Get current active version
        const currentVersion = await ContentVersion.getActiveVersion(req.params.moduleId);

        // Create new version
        const newVersion = new ContentVersion({
            moduleId: req.params.moduleId,
            version: currentVersion ? currentVersion.version + 1 : 1,
            versionName: versionName || `Version ${currentVersion ? currentVersion.version + 1 : 1}`,
            description: description || 'Content update',
            contentSnapshot: enhancedContent,
            createdBy: {
                userId: req.user.id,
                name: req.user.name,
                role: req.user.role
            },
            status: 'draft'
        });

        await newVersion.save();

        // Update module with enhanced content
        module.enhancedContent = {
            ...enhancedContent,
            isEnhanced: true
        };

        await module.save();

        res.json({
            success: true,
            message: 'Enhanced content updated successfully',
            data: {
                moduleId: module.moduleId,
                version: newVersion.version,
                validationScore: validation.score,
                warnings: validation.warnings
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/v1/enhanced-content/modules/:moduleId/publish
// @desc    Publish a content version
// @access  Admin only
router.post('/modules/:moduleId/publish', protect, authorize('admin'), async (req, res) => {
    try {
        const { version } = req.body;

        const contentVersion = await ContentVersion.findOne({
            moduleId: req.params.moduleId,
            version: version
        });

        if (!contentVersion) {
            return res.status(404).json({
                success: false,
                message: 'Content version not found'
            });
        }

        // Activate this version
        await contentVersion.activate();

        res.json({
            success: true,
            message: 'Content version published successfully',
            data: {
                moduleId: req.params.moduleId,
                version: contentVersion.version,
                publishedAt: contentVersion.publishedAt
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/v1/enhanced-content/modules/:moduleId/versions
// @desc    Get all versions for a module
// @access  Admin only
router.get('/modules/:moduleId/versions', protect, authorize('admin'), async (req, res) => {
    try {
        const versions = await ContentVersion.find({ moduleId: req.params.moduleId })
            .sort({ version: -1 })
            .select('-contentSnapshot'); // Exclude large content data

        res.json({
            success: true,
            count: versions.length,
            data: versions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/v1/enhanced-content/modules/:moduleId/validate
// @desc    Validate enhanced content
// @access  Admin only
router.get('/modules/:moduleId/validate', protect, authorize('admin'), async (req, res) => {
    try {
        const module = await Module.findOne({ moduleId: req.params.moduleId });

        if (!module) {
            return res.status(404).json({
                success: false,
                message: 'Module not found'
            });
        }

        if (!module.enhancedContent?.isEnhanced) {
            return res.status(400).json({
                success: false,
                message: 'Module does not have enhanced content'
            });
        }

        // Generate comprehensive validation report
        const report = ContentValidationService.generateContentReport(module.enhancedContent);

        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/v1/enhanced-content/templates
// @desc    Get content templates
// @access  Admin only
router.get('/templates', protect, authorize('admin'), async (req, res) => {
    try {
        const templates = {
            section: {
                introduction: {
                    id: 'intro-template',
                    title: 'Introduction to [Topic]',
                    type: 'introduction',
                    content: `
                        <h2>Welcome to [Topic]</h2>
                        <p>In this module, you will learn about [topic description].</p>
                        
                        <h3>What You'll Learn</h3>
                        <ul>
                            <li>Key concept 1</li>
                            <li>Key concept 2</li>
                            <li>Key concept 3</li>
                        </ul>
                        
                        <h3>Prerequisites</h3>
                        <p>Before starting this module, you should have:</p>
                        <ul>
                            <li>Basic understanding of [prerequisite]</li>
                            <li>Access to [required tools]</li>
                        </ul>
                    `,
                    estimatedTime: 10,
                    learningObjectives: [
                        'Understand the basics of [topic]',
                        'Identify key concepts',
                        'Prepare for practical exercises'
                    ]
                },
                lesson: {
                    id: 'lesson-template',
                    title: '[Lesson Title]',
                    type: 'lesson',
                    content: `
                        <h2>[Lesson Title]</h2>
                        
                        <h3>Overview</h3>
                        <p>[Brief overview of what this lesson covers]</p>
                        
                        <h3>Key Concepts</h3>
                        <p>[Explain main concepts with examples]</p>
                        
                        <h3>Step-by-Step Guide</h3>
                        <ol>
                            <li>Step 1: [Description]</li>
                            <li>Step 2: [Description]</li>
                            <li>Step 3: [Description]</li>
                        </ol>
                        
                        <h3>Kenyan Context</h3>
                        <p>[How this applies specifically in Kenya]</p>
                    `,
                    estimatedTime: 20,
                    keyTakeaways: [
                        'Key point 1',
                        'Key point 2',
                        'Key point 3'
                    ]
                }
            },
            exercise: {
                title: '[Exercise Title]',
                description: 'Learn to [skill] by [method]',
                difficulty: 1,
                estimatedTime: 15,
                category: 'hands-on',
                tools: [{
                    name: '[Tool Name]',
                    type: 'free',
                    alternatives: ['Alternative 1', 'Alternative 2'],
                    kenyanAvailability: {
                        available: true,
                        notes: 'Available in Kenya'
                    }
                }],
                steps: [{
                    stepNumber: 1,
                    instruction: '[Step instruction]',
                    tips: ['Helpful tip'],
                    expectedResult: '[What should happen]'
                }],
                expectedOutcome: '[What learner should achieve]',
                kenyanContext: {
                    businessScenario: '[Real Kenyan business scenario]',
                    localExamples: ['Example 1', 'Example 2']
                }
            },
            troubleshooting: {
                problem: '[Common problem description]',
                category: 'technical',
                symptoms: ['Symptom 1', 'Symptom 2'],
                solutions: [{
                    step: 1,
                    action: '[What to do]',
                    explanation: '[Why this works]'
                }],
                prevention: '[How to avoid this problem]'
            }
        };

        res.json({
            success: true,
            data: templates
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/v1/enhanced-content/bulk-enhance
// @desc    Bulk enhance multiple modules
// @access  Admin only
router.post('/bulk-enhance', protect, authorize('admin'), async (req, res) => {
    try {
        const { moduleIds, enhancementType } = req.body;

        if (!moduleIds || !Array.isArray(moduleIds)) {
            return res.status(400).json({
                success: false,
                message: 'moduleIds array is required'
            });
        }

        const results = [];

        for (const moduleId of moduleIds) {
            try {
                const module = await Module.findOne({ moduleId });

                if (!module) {
                    results.push({
                        moduleId,
                        success: false,
                        message: 'Module not found'
                    });
                    continue;
                }

                // Apply basic enhancement structure
                if (!module.enhancedContent) {
                    module.enhancedContent = {
                        sections: [],
                        practicalExercises: [],
                        troubleshooting: [],
                        careerPathways: {
                            jobOpportunities: [],
                            nextSteps: [],
                            advancedSkills: [],
                            certifications: []
                        },
                        kenyanContext: {
                            localExamples: [],
                            businessCases: [],
                            regulations: [],
                            localTools: []
                        },
                        isEnhanced: false
                    };

                    await module.save();

                    results.push({
                        moduleId,
                        success: true,
                        message: 'Enhanced structure added'
                    });
                } else {
                    results.push({
                        moduleId,
                        success: true,
                        message: 'Already has enhanced structure'
                    });
                }
            } catch (error) {
                results.push({
                    moduleId,
                    success: false,
                    message: error.message
                });
            }
        }

        res.json({
            success: true,
            message: 'Bulk enhancement completed',
            data: results
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;