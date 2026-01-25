const Module = require('../../models/Module');

describe('Module Model', () => {
    describe('Module Creation', () => {
        it('should create a valid module', async () => {
            const module = await Module.create({
                moduleId: 'MOD-001',
                title: 'Introduction to Business',
                description: 'Learn the basics of business management',
                category: 'business',
                difficulty: 1,
                estimatedTime: 60,
                learningObjectives: ['Understand business basics', 'Learn key terms'],
                content: {
                    materials: [
                        { title: 'Intro Video', type: 'video', url: 'http://example.com/video' }
                    ]
                },
                assessmentCriteria: [
                    {
                        criterion: 'Understanding of basics',
                        weight: 1
                    }
                ],
                skills: ['business basics'],
                isActive: true
            });

            expect(module.title).toBe('Introduction to Business');
            expect(module.category).toBe('business');
            expect(module.difficulty).toBe(1);
            expect(module.estimatedTime).toBe(60);
            expect(module.learningObjectives).toHaveLength(2);
            expect(module.content.materials).toHaveLength(1);
            expect(module.assessmentCriteria).toHaveLength(1);
            expect(module.skills).toContain('business basics');
            expect(module.isActive).toBe(true);
            expect(module.createdAt).toBeDefined();
            expect(module.updatedAt).toBeDefined();
        });

        it('should require moduleId', async () => {
            await expect(Module.create({
                title: 'Test',
                description: 'Test',
                category: 'business',
                difficulty: 1,
                estimatedTime: 60,
                learningObjectives: ['Objective']
            })).rejects.toThrow();
        });

        it('should require title', async () => {
            await expect(Module.create({
                moduleId: 'MOD-002',
                description: 'Test',
                category: 'business',
                difficulty: 1,
                estimatedTime: 60,
                learningObjectives: ['Objective']
            })).rejects.toThrow();
        });

        it('should require description', async () => {
            await expect(Module.create({
                moduleId: 'MOD-002',
                title: 'Test',
                category: 'business',
                difficulty: 1,
                estimatedTime: 60,
                learningObjectives: ['Objective']
            })).rejects.toThrow();
        });

        it('should require category', async () => {
            await expect(Module.create({
                moduleId: 'MOD-002',
                title: 'Test',
                description: 'Test',
                difficulty: 1,
                estimatedTime: 60,
                learningObjectives: ['Objective']
            })).rejects.toThrow();
        });

        it('should require difficulty', async () => {
            await expect(Module.create({
                moduleId: 'MOD-002',
                title: 'Test',
                description: 'Test',
                category: 'business',
                estimatedTime: 60,
                learningObjectives: ['Objective']
            })).rejects.toThrow();
        });

        it('should require estimatedTime', async () => {
            await expect(Module.create({
                moduleId: 'MOD-002',
                title: 'Test',
                description: 'Test',
                category: 'business',
                difficulty: 1,
                learningObjectives: ['Objective']
            })).rejects.toThrow();
        });
    });

    describe('Category Validation', () => {
        it('should accept any category string', async () => {
            const categories = ['business', 'technology', 'marketing', 'finance', 'operations', 'leadership', 'invalid'];

            for (const category of categories) {
                const module = await Module.create({
                    moduleId: `MOD-CAT-${category}`,
                    title: 'Test Module',
                    description: 'Test',
                    category,
                    difficulty: 1,
                    estimatedTime: 60,
                    learningObjectives: ['Objective']
                });
                expect(module.category).toBe(category);
            }
        });
    });

    describe('Difficulty Validation', () => {
        it('should accept valid difficulties', async () => {
            const difficulties = [1, 2, 3, 4];

            for (const difficulty of difficulties) {
                const module = await Module.create({
                    moduleId: `MOD-DIFF-${difficulty}`,
                    title: 'Test Module',
                    description: 'Test',
                    category: 'business',
                    difficulty,
                    estimatedTime: 60,
                    learningObjectives: ['Objective']
                });
                expect(module.difficulty).toBe(difficulty);
            }
        });

        it('should reject invalid difficulty', async () => {
            await expect(Module.create({
                moduleId: 'MOD-DIFF-INVALID',
                title: 'Test Module',
                description: 'Test',
                category: 'business',
                difficulty: 6,
                estimatedTime: 60,
                learningObjectives: ['Objective']
            })).rejects.toThrow();
        });
    });

    describe('Estimated Time Validation', () => {
        it('should accept positive estimated time', async () => {
            const module = await Module.create({
                moduleId: 'MOD-TIME-120',
                title: 'Test Module',
                description: 'Test',
                category: 'business',
                difficulty: 1,
                estimatedTime: 120,
                learningObjectives: ['Objective']
            });
            expect(module.estimatedTime).toBe(120);
        });

        it('should accept zero estimated time', async () => {
            const module = await Module.create({
                moduleId: 'MOD-TIME-0',
                title: 'Test Module',
                description: 'Test',
                category: 'business',
                difficulty: 1,
                estimatedTime: 0,
                learningObjectives: ['Objective']
            });
            expect(module.estimatedTime).toBe(0);
        });

        it('should accept negative estimated time', async () => {
            const module = await Module.create({
                moduleId: 'MOD-TIME-NEG',
                title: 'Test Module',
                description: 'Test',
                category: 'business',
                difficulty: 1,
                estimatedTime: -10,
                learningObjectives: ['Objective']
            });
            expect(module.estimatedTime).toBe(-10);
        });
    });



    describe('Assessment Structure', () => {
        it('should store assessment correctly', async () => {
            const assessment = {
                questions: [
                    {
                        question: 'Test question?',
                        options: ['A', 'B', 'C', 'D'],
                        correctAnswer: 1,
                        explanation: 'Because B is correct',
                        points: 2
                    }
                ],
                passingScore: 80,
                timeLimit: 45
            };

            const module = await Module.create({
                moduleId: 'MOD-ASSESS',
                title: 'Test Module',
                description: 'Test',
                category: 'business',
                difficulty: 1,
                estimatedTime: 60,
                learningObjectives: ['Objective'],
                assessment
            });

            expect(module.assessment.questions).toHaveLength(1);
            expect(module.assessment.passingScore).toBe(80);
            expect(module.assessment.timeLimit).toBe(45);
        });
    });

    describe('Prerequisites', () => {
        it('should store prerequisites as ObjectIds', async () => {
            const prereqModule = await Module.create({
                moduleId: 'MOD-PREREQ',
                title: 'Prerequisite Module',
                description: 'Test',
                category: 'business',
                difficulty: 1,
                estimatedTime: 30,
                learningObjectives: ['Objective']
            });

            const module = await Module.create({
                moduleId: 'MOD-MAIN',
                title: 'Main Module',
                description: 'Test',
                category: 'business',
                difficulty: 2,
                estimatedTime: 60,
                learningObjectives: ['Objective'],
                prerequisites: [prereqModule._id]
            });

            expect(module.prerequisites).toHaveLength(1);
            expect(module.prerequisites[0].toString()).toBe(prereqModule._id.toString());
        });
    });
});
