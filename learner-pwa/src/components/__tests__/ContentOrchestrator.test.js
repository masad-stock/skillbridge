/**
 * Content Orchestrator Tests
 * 
 * Unit tests for content orchestration and synchronization
 * Tests parallel loading, error handling, and recovery mechanisms
 */

import { jest } from '@jest/globals';
import contentOrchestrator from '../../services/contentOrchestrator';
import contentErrorLogger from '../../services/contentErrorLogger';

// Mock dependencies
jest.mock('../../services/contentErrorLogger');

describe('ContentOrchestrator', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        contentOrchestrator.clearCache();
    });

    describe('loadLessonContent', () => {
        const mockLessonData = {
            moduleId: 'test-module',
            lessonId: 'test-lesson',
            title: 'Test Lesson',
            youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            textContent: 'This is test content for the lesson.',
            images: ['https://example.com/image1.jpg'],
            questions: [
                {
                    question: 'What is the answer?',
                    options: ['A', 'B', 'C', 'D'],
                    correctAnswer: 0
                }
            ]
        };

        test('should successfully orchestrate loading of all content types', async () => {
            const result = await contentOrchestrator.loadLessonContent(mockLessonData);

            expect(result.success).toBe(true);
            expect(result.content).toBeDefined();
            expect(result.content.moduleId).toBe('test-module');
            expect(result.content.lessonId).toBe('test-lesson');
            expect(result.content.contentTypes).toContain('video');
            expect(result.content.contentTypes).toContain('text');
            expect(result.content.contentTypes).toContain('images');
            expect(result.content.contentTypes).toContain('interactive');
        });

        test('should handle video loading errors gracefully', async () => {
            const lessonDataWithBadVideo = {
                ...mockLessonData,
                youtubeUrl: 'invalid-url'
            };

            const result = await contentOrchestrator.loadLessonContent(lessonDataWithBadVideo);

            expect(result.content.errors).toBeDefined();
            expect(result.content.errors.length).toBeGreaterThan(0);
            expect(result.content.errors[0].type).toBe('video');
        });

        test('should track loading progress', async () => {
            const progressCallback = jest.fn();

            await contentOrchestrator.loadLessonContent(mockLessonData, {
                onProgress: progressCallback
            });

            expect(progressCallback).toHaveBeenCalled();
            expect(progressCallback).toHaveBeenCalledWith(
                expect.objectContaining({
                    contentType: expect.any(String),
                    progress: expect.any(Number),
                    overallProgress: expect.any(Number)
                })
            );
        });

        test('should log orchestration metrics', async () => {
            await contentOrchestrator.loadLessonContent(mockLessonData);

            expect(contentErrorLogger.logOrchestrationMetrics).toHaveBeenCalledWith(
                expect.objectContaining({
                    moduleId: 'test-module',
                    lessonId: 'test-lesson',
                    parallelLoading: true,
                    contentTypes: expect.any(Array)
                })
            );
        });

        test('should handle empty lesson data', async () => {
            const emptyLessonData = {
                moduleId: 'test-module',
                lessonId: 'test-lesson',
                title: 'Empty Lesson'
            };

            const result = await contentOrchestrator.loadLessonContent(emptyLessonData);

            expect(result.success).toBe(true);
            expect(result.content.contentTypes).toHaveLength(0);
        });

        test('should implement retry logic for failed content', async () => {
            // Mock a temporary failure followed by success
            let callCount = 0;
            const originalFetch = global.fetch;
            global.fetch = jest.fn(() => {
                callCount++;
                if (callCount === 1) {
                    return Promise.reject(new Error('Network error'));
                }
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ success: true })
                });
            });

            const result = await contentOrchestrator.loadLessonContent(mockLessonData);

            expect(result.success).toBe(true);

            global.fetch = originalFetch;
        });
    });

    describe('Content Caching', () => {
        test('should cache successfully loaded content', async () => {
            const mockLessonData = {
                moduleId: 'cache-test',
                lessonId: 'lesson-1',
                title: 'Cache Test',
                textContent: 'Test content for caching'
            };

            // First load
            await contentOrchestrator.loadLessonContent(mockLessonData);

            // Second load should use cache
            const result = await contentOrchestrator.loadLessonContent(mockLessonData);

            expect(result.success).toBe(true);
            expect(result.content.content.text.cached).toBe(true);
        });

        test('should clear cache when requested', async () => {
            const mockLessonData = {
                moduleId: 'cache-clear-test',
                lessonId: 'lesson-1',
                title: 'Cache Clear Test',
                textContent: 'Test content'
            };

            await contentOrchestrator.loadLessonContent(mockLessonData);

            // Clear cache
            contentOrchestrator.clearCache('cache-clear-test', 'lesson-1');

            // Load again - should not be cached
            const result = await contentOrchestrator.loadLessonContent(mockLessonData);
            expect(result.content.content.text.cached).toBe(false);
        });

        test('should provide cache statistics', () => {
            const stats = contentOrchestrator.getCacheStats();

            expect(stats).toHaveProperty('totalEntries');
            expect(stats).toHaveProperty('cacheKeys');
            expect(stats).toHaveProperty('memoryUsage');
            expect(typeof stats.totalEntries).toBe('number');
        });
    });

    describe('Content Synchronization', () => {
        test('should synchronize video and text content timing', async () => {
            const mockLessonData = {
                moduleId: 'sync-test',
                lessonId: 'lesson-1',
                title: 'Sync Test',
                youtubeUrl: 'https://www.youtube.com/watch?v=test',
                textContent: 'Synchronized content'
            };

            const result = await contentOrchestrator.loadLessonContent(mockLessonData);

            expect(result.success).toBe(true);
            expect(result.content.content.video).toBeDefined();
            expect(result.content.content.text).toBeDefined();
        });

        test('should handle partial content loading', async () => {
            const mockLessonData = {
                moduleId: 'partial-test',
                lessonId: 'lesson-1',
                title: 'Partial Test',
                youtubeUrl: 'invalid-video-url',
                textContent: 'Valid text content'
            };

            const result = await contentOrchestrator.loadLessonContent(mockLessonData);

            expect(result.content.content.text).toBeDefined();
            expect(result.content.errors.length).toBeGreaterThan(0);
            expect(result.content.success).toBe(false);
        });

        test('should validate content synchronization', async () => {
            const mockLessonData = {
                moduleId: 'validation-test',
                lessonId: 'lesson-1',
                title: 'Validation Test',
                youtubeUrl: 'https://www.youtube.com/watch?v=test',
                textContent: 'Content that matches the video title'
            };

            const result = await contentOrchestrator.loadLessonContent(mockLessonData);

            expect(result.success).toBe(true);
            expect(result.content.warnings).toBeDefined();
        });
    });

    describe('Error Handling', () => {
        test('should log errors for failed content loading', async () => {
            const mockLessonData = {
                moduleId: 'error-test',
                lessonId: 'lesson-1',
                title: 'Error Test',
                youtubeUrl: 'invalid-url'
            };

            await contentOrchestrator.loadLessonContent(mockLessonData);

            expect(contentErrorLogger.logVideoError).toHaveBeenCalledWith(
                expect.objectContaining({
                    moduleId: 'error-test',
                    lessonId: 'lesson-1',
                    errorCode: expect.any(String)
                })
            );
        });

        test('should handle orchestration failures', async () => {
            // Mock a critical failure in orchestration
            const originalConsoleError = console.error;
            console.error = jest.fn();

            try {
                await contentOrchestrator.loadLessonContent(null);
            } catch (error) {
                expect(error).toBeDefined();
                expect(contentErrorLogger.logError).toHaveBeenCalled();
            }

            console.error = originalConsoleError;
        });

        test('should provide fallback content on failures', async () => {
            const mockLessonData = {
                moduleId: 'fallback-test',
                lessonId: 'lesson-1',
                title: 'Fallback Test',
                youtubeUrl: 'invalid-url',
                textContent: 'Valid fallback content'
            };

            const result = await contentOrchestrator.loadLessonContent(mockLessonData);

            // Should still have some content even with video failure
            expect(result.content.content.text).toBeDefined();
        });
    });

    describe('Performance Monitoring', () => {
        test('should track loading times', async () => {
            const mockLessonData = {
                moduleId: 'perf-test',
                lessonId: 'lesson-1',
                title: 'Performance Test',
                textContent: 'Test content'
            };

            const result = await contentOrchestrator.loadLessonContent(mockLessonData);

            expect(result.metrics).toBeDefined();
            expect(result.metrics.startTime).toBeDefined();
            expect(result.metrics.endTime).toBeDefined();
            expect(result.metrics.endTime).toBeGreaterThan(result.metrics.startTime);
        });

        test('should identify bottlenecks', async () => {
            const mockLessonData = {
                moduleId: 'bottleneck-test',
                lessonId: 'lesson-1',
                title: 'Bottleneck Test',
                youtubeUrl: 'https://www.youtube.com/watch?v=slow-video',
                textContent: 'Fast text content',
                images: ['https://example.com/slow-image.jpg']
            };

            const result = await contentOrchestrator.loadLessonContent(mockLessonData);

            expect(result.metrics.bottleneck).toBeDefined();
        });
    });

    describe('Loading State Management', () => {
        test('should track loading states', async () => {
            const mockLessonData = {
                moduleId: 'state-test',
                lessonId: 'lesson-1',
                title: 'State Test',
                textContent: 'Test content'
            };

            const result = await contentOrchestrator.loadLessonContent(mockLessonData);

            const loadingState = contentOrchestrator.getLoadingState(result.orchestrationId);
            expect(loadingState).toBeDefined();
            expect(loadingState.status).toBe('completed');
        });

        test('should handle concurrent loading requests', async () => {
            const mockLessonData1 = {
                moduleId: 'concurrent-test-1',
                lessonId: 'lesson-1',
                title: 'Concurrent Test 1',
                textContent: 'Test content 1'
            };

            const mockLessonData2 = {
                moduleId: 'concurrent-test-2',
                lessonId: 'lesson-2',
                title: 'Concurrent Test 2',
                textContent: 'Test content 2'
            };

            const [result1, result2] = await Promise.all([
                contentOrchestrator.loadLessonContent(mockLessonData1),
                contentOrchestrator.loadLessonContent(mockLessonData2)
            ]);

            expect(result1.success).toBe(true);
            expect(result2.success).toBe(true);
            expect(result1.orchestrationId).not.toBe(result2.orchestrationId);
        });
    });
});

// Helper function to create mock lesson data
function createMockLessonData(overrides = {}) {
    return {
        moduleId: 'test-module',
        lessonId: 'test-lesson',
        title: 'Test Lesson',
        youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        textContent: 'This is test content.',
        images: ['https://example.com/image.jpg'],
        questions: [
            {
                question: 'Test question?',
                options: ['A', 'B', 'C', 'D'],
                correctAnswer: 0
            }
        ],
        ...overrides
    };
}