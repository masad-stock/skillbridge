const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Assessment = require('../models/Assessment');
const Progress = require('../models/Progress');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/v1/analytics/platform-stats
// @desc    Get platform-wide statistics (admin only)
// @access  Private/Admin
router.get('/platform-stats', protect, authorize('admin'), async (req, res) => {
    try {
        const [
            totalUsers,
            activeUsers,
            completedAssessments,
            totalProgress
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
            Assessment.countDocuments({ status: 'completed' }),
            Progress.countDocuments({ status: 'completed' })
        ]);

        // User demographics
        const demographics = await User.aggregate([
            {
                $group: {
                    _id: {
                        gender: '$profile.gender',
                        education: '$profile.education.level',
                        employment: '$profile.employment.status'
                    },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Skills distribution
        const skillsDistribution = await User.aggregate([
            {
                $project: {
                    skills: { $objectToArray: '$skillsProfile.competencyLevels' }
                }
            },
            { $unwind: '$skills' },
            {
                $group: {
                    _id: '$skills.k',
                    averageLevel: { $avg: '$skills.v' },
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    active: activeUsers,
                    inactiveRate: ((totalUsers - activeUsers) / totalUsers * 100).toFixed(2)
                },
                assessments: {
                    completed: completedAssessments
                },
                learning: {
                    completedModules: totalProgress
                },
                demographics,
                skillsDistribution
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/v1/analytics/my-stats
// @desc    Get user's personal statistics
// @access  Private
router.get('/my-stats', protect, async (req, res) => {
    try {
        const [assessments, progress, user] = await Promise.all([
            Assessment.find({ user: req.user.id, status: 'completed' }),
            Progress.find({ user: req.user.id }),
            User.findById(req.user.id)
        ]);

        const completedModules = progress.filter(p => p.status === 'completed').length;
        const inProgressModules = progress.filter(p => p.status === 'in_progress').length;
        const totalTimeSpent = progress.reduce((sum, p) => sum + p.timeSpent, 0);

        // Learning streak
        const sortedProgress = progress
            .filter(p => p.lastAccessedAt)
            .sort((a, b) => b.lastAccessedAt - a.lastAccessedAt);

        let streak = 0;
        let currentDate = new Date();
        for (const p of sortedProgress) {
            const daysDiff = Math.floor((currentDate - p.lastAccessedAt) / (1000 * 60 * 60 * 24));
            if (daysDiff <= 1) {
                streak++;
                currentDate = p.lastAccessedAt;
            } else {
                break;
            }
        }

        res.json({
            success: true,
            data: {
                assessments: {
                    completed: assessments.length,
                    averageScore: assessments.length > 0
                        ? assessments.reduce((sum, a) => sum + a.results.score, 0) / assessments.length
                        : 0
                },
                learning: {
                    enrolled: progress.length,
                    completed: completedModules,
                    inProgress: inProgressModules,
                    completionRate: progress.length > 0
                        ? ((completedModules / progress.length) * 100).toFixed(2)
                        : 0,
                    totalTimeSpent,
                    streak
                },
                skillsProfile: user.skillsProfile
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
