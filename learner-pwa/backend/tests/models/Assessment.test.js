const Assessment = require('../../models/Assessment');
const User = require('../../models/User');
const Module = require('../../models/Module');

describe('Assessment Model', () => {
    let testUser;
    let testModule;

    beforeEach(async () => {
        testUser = await User.create({
            email: 'test@test.com',
            password: 'password123',
            profile: { firstName: 'Test', lastName: 'User' }
        });

        testModule = await Module.create({
            moduleId: 'test-module-001',
            title: 'Test Module',
            description: 'A test module',
            category: 'digital-marketing',
            difficulty: 1,
            estimatedTime: 60
        });
    });

    describe('Assessment Creation', () => {
        it('should create a valid assessment', async () => {
            const assessment = await Assessment.create({
                userId: testUser._id,
                moduleId: testModule._id,
                answers: [
                    { questionId: 'q1', answer: 'A', isCorrect: true, timeSpent: 30 },
                    { questionId: 'q2', answer: 'B', isCorrect: false, timeSpent: 45 }
                ],
                score: 75,
                timeSpent: 75,
                aiFeedback: 'Good job!'
            });

            expect(assessment.userId.toString()).toBe(testUser._id.toString());
            expect(assessment.moduleId.toString()).toBe(testModule._id.toString());
            expect(assessment.score).toBe(75);
            expect(assessment.timeSpent).toBe(75);
            expect(assessment.aiFeedback).toBe('Good job!');
            expect(assessment.completedAt).toBeDefined();
            expect(assessment.createdAt).toBeDefined();
            expect(assessment.updatedAt).toBeDefined();
        });

        it('should require userId', async () => {
            await expect(Assessment.create({
                moduleId: testModule._id,
                answers: [],
                score: 50,
                timeSpent: 60
            })).rejects.toThrow();
        });

        it('should require moduleId', async () => {
            await expect(Assessment.create({
                userId: testUser._id,
                answers: [],
                score: 50,
                timeSpent: 60
            })).rejects.toThrow();
        });

        it('should require score', async () => {
            await expect(Assessment.create({
                userId: testUser._id,
                moduleId: testModule._id,
                answers: [],
                timeSpent: 60
            })).rejects.toThrow();
        });

        it('should require timeSpent', async () => {
            await expect(Assessment.create({
                userId: testUser._id,
                moduleId: testModule._id,
                answers: [],
                score: 50
            })).rejects.toThrow();
        });
    });

    describe('Score Validation', () => {
        it('should accept score of 0', async () => {
            const assessment = await Assessment.create({
                userId: testUser._id,
                moduleId: testModule._id,
                answers: [],
                score: 0,
                timeSpent: 60
            });

            expect(assessment.score).toBe(0);
        });

        it('should accept score of 100', async () => {
            const assessment = await Assessment.create({
                userId: testUser._id,
                moduleId: testModule._id,
                answers: [],
                score: 100,
                timeSpent: 60
            });

            expect(assessment.score).toBe(100);
        });

        it('should reject score below 0', async () => {
            await expect(Assessment.create({
                userId: testUser._id,
                moduleId: testModule._id,
                answers: [],
                score: -1,
                timeSpent: 60
            })).rejects.toThrow();
        });

        it('should reject score above 100', async () => {
            await expect(Assessment.create({
                userId: testUser._id,
                moduleId: testModule._id,
                answers: [],
                score: 101,
                timeSpent: 60
            })).rejects.toThrow();
        });
    });

    describe('Answers Array', () => {
        it('should store answers correctly', async () => {
            const answers = [
                { questionId: 'q1', answer: 'A', isCorrect: true, timeSpent: 30 },
                { questionId: 'q2', answer: 'B', isCorrect: false, timeSpent: 45 }
            ];

            const assessment = await Assessment.create({
                userId: testUser._id,
                moduleId: testModule._id,
                answers,
                score: 50,
                timeSpent: 75
            });

            expect(assessment.answers).toHaveLength(2);
            expect(assessment.answers[0].questionId).toBe('q1');
            expect(assessment.answers[0].isCorrect).toBe(true);
            expect(assessment.answers[1].questionId).toBe('q2');
            expect(assessment.answers[1].isCorrect).toBe(false);
        });

        it('should allow empty answers array', async () => {
            const assessment = await Assessment.create({
                userId: testUser._id,
                moduleId: testModule._id,
                answers: [],
                score: 0,
                timeSpent: 0
            });

            expect(assessment.answers).toHaveLength(0);
        });
    });

    describe('Timestamps', () => {
        it('should set completedAt to current time by default', async () => {
            const beforeCreate = new Date();
            const assessment = await Assessment.create({
                userId: testUser._id,
                moduleId: testModule._id,
                answers: [],
                score: 50,
                timeSpent: 60
            });
            const afterCreate = new Date();

            expect(assessment.completedAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
            expect(assessment.completedAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
        });
    });
});
