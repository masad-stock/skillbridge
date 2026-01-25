/**
 * Content Delivery Flow Integration Tests
 * 
 * End-to-end tests for complete content loading and display workflow
 * Tests cross-browser compatibility, offline functionality, and error recovery
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import { BrowserRouter } from 'react-router-dom';
import LearningPath from '../../pages/LearningPath';
import contentOrchestrator from '../../services/contentOrchestrator';
import contentCacheService from '../../services/contentCacheService';
import contentErrorRecovery from '../../services/contentErrorRecovery';
import contentValidationService from '../../services/contentValidationService';

// Mock services
jest.mock('../../services/contentOrchestrator');
jest.mock('../../services/contentCacheService');
jest.mock('../../services/contentErrorRecovery');
jest.mock('../../services/contentValidationService');

// Mock fetch
global.fetch = jest.fn();

// Mock YouTube API
global.YT = {
    Player: jest.fn(() => ({
        playVideo: jest.fn(),
        pauseVideo: jest.fn(),
        seekTo: jest.fn(),
        getCurrentTime: jest.fn(() => 0),
        getDuration: jest.fn(() => 300),
        getPlayerState: jest.fn(() => 1),
        getAvailableQualityLevels: jest.fn(() => ['small', 'medium', 'large']),
        setPlaybackQuality: jest.fn(),
        destroy: jest.fn()
    })),
    PlayerState: {
        UNSTARTED: -1,
        ENDED: 0,
        PLAYING: 1,
        PAUSED: 2,
        BUFFERING: 3,
        CUED: 5
    }
};

// Mock navigator
Object.defineProperty(navigator, 'onLine', {
    writable: true,
    value: true
});

Object.defineProperty(navigator, 'connection', {
    writable: true,
    value: {
        downlink: 2.5,
        effectiveType: '4g',
        addEventListener: jest.fn()
    }
});

describe('Content Delivery Flow Integration', () => {
    const mockModuleData = {
        id: 'test-module',
        title: 'Test Module',
        lessons: [
            {
                id: 'lesson-1',
                title: 'Introduction to Testing',
                youtubeUrl: 'https://www.youtube.com/watch?v=test1',
                textContent: 'This lesson covers the basics of testing.',
                images: ['https://example.com/test-image.jpg'],
                questions: [
                    {
                        question: 'What is testing?',
                        options: ['A process', 'A tool', 'A method', 'All of the above'],
                        correctAnswer: 3
                    }
                ]
            },
            {
                id: 'lesson-2',
                title: 'Advanced Testing Concepts',
                youtubeUrl: 'https://www.youtube.com/watch?v=test2',
                textContent: 'This lesson covers advanced testing concepts.',
                questions: [
                    {
                        question: 'What is integration testing?',
                        options: ['Unit testing', 'System testing', 'Component testing', 'End-to-end testing'],
                        correctAnswer: 1
                    }
                ]
            }
        ]
    };

    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();

        // Setup default mock responses
        fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockModuleData)
        });

        contentOrchestrator.loadLessonContent.mockResolvedValue({
            success: true,
            content: {
                moduleId: 'test-module',
                lessonId: 'lesson-1',
                success: true,
                contentTypes: ['video', 'text', 'interactive'],
                content: {
                    video: {
                        type: 'video',
                        url: 'https://www.youtube.com/watch?v=test1',
                        videoId: 'test1',
                        title: 'Introduction to Testing'
                    },
                    text: {
                        type: 'text',
                        content: 'This lesson covers the basics of testing.',
                        wordCount: 8
                    },
                    interactive: {
                        type: 'interactive',
                        questions: mockModuleData.lessons[0].questions,
                        validCount: 1
                    }
                },
                errors: [],
                warnings: []
            },
            orchestrationId: 'test-orch-1'
        });

        contentCacheService.get.mockResolvedValue(null);
        contentCacheService.set.mockResolvedValue(true);
        contentValidationService.validateContent.mockResolvedValue({
            isValid: true,
            errors: [],
            warnings: []
        });
    });

    describe('Complete Content Loading Workflow', () => {
        test('loads and displays all content types successfully', async () => {
            const TestComponent = () => (
                <BrowserRouter>
                    <LearningPath />
                </BrowserRouter>
            );

            render(<TestComponent />);

            // Wait for module data to load
            await waitFor(() => {
                expect(fetch).toHaveBeenCalledWith(
                    expect.stringContaining('/api/learning/modules')
                );
            });

            // Should display module title
            await waitFor(() => {
                expect(screen.getByText('Test Module')).toBeInTheDocument();
            });

            // Click on first lesson
            fireEvent.click(screen.getByText('Introduction to Testing'));

            // Should orchestrate content loading
            await waitFor(() => {
                expect(contentOrchestrator.loadLessonContent).toHaveBeenCalledWith(
                    expect.objectContaining({
                        id: 'lesson-1',
                        title: 'Introduction to Testing'
                    }),
                    expect.any(Object)
                );
            });

            // Should display video player
            await waitFor(() => {
                expect(screen.getByText('Introduction to Testing')).toBeInTheDocument();
            });

            // Should display text content
            expect(screen.getByText(/This lesson covers the basics of testing/)).toBeInTheDocument();

            // Should display interactive elements
            expect(screen.getByText('What is testing?')).toBeInTheDocument();
        });

        test('handles partial content loading gracefully', async () => {
            // Mock partial failure
            contentOrchestrator.loadLessonContent.mockResolvedValue({
                success: false,
                content: {
                    moduleId: 'test-module',
                    lessonId: 'lesson-1',
                    success: false,
                    contentTypes: ['text'],
                    content: {
                        text: {
                            type: 'text',
                            content: 'This lesson covers the basics of testing.',
                            wordCount: 8
                        }
                    },
                    errors: [
                        {
                            type: 'video',
                            error: 'Video failed to load'
                        }
                    ],
                    warnings: []
                }
            });

            const TestComponent = () => (
                <BrowserRouter>
                    <LearningPath />
                </BrowserRouter>
            );

            render(<TestComponent />);

            await waitFor(() => {
                expect(screen.getByText('Test Module')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('Introduction to Testing'));

            // Should still display available content
            await waitFor(() => {
                expect(screen.getByText(/This lesson covers the basics of testing/)).toBeInTheDocument();
            });

            // Should show error message for failed video
            expect(screen.getByText(/Video content is temporarily unavailable/)).toBeInTheDocument();
        });

        test('implements progressive loading with user feedback', async () => {
            let progressCallback;
            contentOrchestrator.loadLessonContent.mockImplementation((lessonData, options) => {
                progressCallback = options.onProgress;

                // Simulate progressive loading
                setTimeout(() => {
                    progressCallback({
                        contentType: 'video',
                        progress: 50,
                        overallProgress: 25
                    });
                }, 100);

                setTimeout(() => {
                    progressCallback({
                        contentType: 'text',
                        progress: 100,
                        overallProgress: 75
                    });
                }, 200);

                return Promise.resolve({
                    success: true,
                    content: {
                        moduleId: 'test-module',
                        lessonId: 'lesson-1',
                        success: true,
                        contentTypes: ['video', 'text'],
                        content: {
                            video: { type: 'video', url: 'test-url' },
                            text: { type: 'text', content: 'test content' }
                        },
                        errors: [],
                        warnings: []
                    }
                });
            });

            const TestComponent = () => (
                <BrowserRouter>
                    <LearningPath />
                </BrowserRouter>
            );

            render(<TestComponent />);

            await waitFor(() => {
                expect(screen.getByText('Test Module')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('Introduction to Testing'));

            // Should show loading progress
            await waitFor(() => {
                expect(screen.getByText(/Loading/)).toBeInTheDocument();
            });

            // Progress should be updated
            await waitFor(() => {
                expect(progressCallback).toHaveBeenCalledWith(
                    expect.objectContaining({
                        contentType: 'video',
                        progress: 50,
                        overallProgress: 25
                    })
                );
            });
        });
    });

    describe('Error Recovery and Fallback Mechanisms', () => {
        test('automatically recovers from temporary network errors', async () => {
            // Mock initial failure followed by success
            let callCount = 0;
            contentOrchestrator.loadLessonContent.mockImplementation(() => {
                callCount++;
                if (callCount === 1) {
                    return Promise.reject(new Error('Network error'));
                }
                return Promise.resolve({
                    success: true,
                    content: {
                        moduleId: 'test-module',
                        lessonId: 'lesson-1',
                        success: true,
                        contentTypes: ['text'],
                        content: {
                            text: { type: 'text', content: 'Recovered content' }
                        },
                        errors: [],
                        warnings: []
                    }
                });
            });

            contentErrorRecovery.recoverFromError.mockResolvedValue({
                success: true,
                strategy: 'retry_with_delay',
                content: { type: 'text', content: 'Recovered content' },
                message: 'Content recovered successfully'
            });

            const TestComponent = () => (
                <BrowserRouter>
                    <LearningPath />
                </BrowserRouter>
            );

            render(<TestComponent />);

            await waitFor(() => {
                expect(screen.getByText('Test Module')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('Introduction to Testing'));

            // Should attempt recovery
            await waitFor(() => {
                expect(contentErrorRecovery.recoverFromError).toHaveBeenCalled();
            });

            // Should display recovered content
            await waitFor(() => {
                expect(screen.getByText('Recovered content')).toBeInTheDocument();
            });
        });

        test('provides manual retry options when auto-recovery fails', async () => {
            contentOrchestrator.loadLessonContent.mockRejectedValue(new Error('Persistent error'));
            contentErrorRecovery.recoverFromError.mockResolvedValue({
                success: false,
                message: 'Unable to recover content. Please try refreshing the page.',
                troubleshooting: [
                    'Check your internet connection',
                    'Try refreshing the page',
                    'Contact support if issue persists'
                ]
            });

            const TestComponent = () => (
                <BrowserRouter>
                    <LearningPath />
                </BrowserRouter>
            );

            render(<TestComponent />);

            await waitFor(() => {
                expect(screen.getByText('Test Module')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('Introduction to Testing'));

            // Should show error with retry options
            await waitFor(() => {
                expect(screen.getByText(/Unable to recover content/)).toBeInTheDocument();
                expect(screen.getByText(/Check your internet connection/)).toBeInTheDocument();
                expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
            });

            // Click retry button
            fireEvent.click(screen.getByRole('button', { name: /retry/i }));

            // Should attempt to load content again
            await waitFor(() => {
                expect(contentOrchestrator.loadLessonContent).toHaveBeenCalledTimes(2);
            });
        });

        test('displays fallback content when primary content fails', async () => {
            contentOrchestrator.loadLessonContent.mockResolvedValue({
                success: false,
                content: {
                    moduleId: 'test-module',
                    lessonId: 'lesson-1',
                    success: false,
                    contentTypes: [],
                    content: {},
                    errors: [
                        { type: 'video', error: 'Video not accessible' },
                        { type: 'text', error: 'Text content not found' }
                    ],
                    warnings: []
                }
            });

            contentErrorRecovery.recoverFromError.mockResolvedValue({
                success: true,
                strategy: 'use_fallback_content',
                content: {
                    type: 'fallback',
                    title: 'Lesson Content',
                    message: 'This lesson covers important concepts. Please refer to your course materials.',
                    actions: [
                        { label: 'Continue to Next Lesson', action: 'continue' },
                        { label: 'Try Again', action: 'retry' }
                    ]
                },
                message: 'Using fallback content'
            });

            const TestComponent = () => (
                <BrowserRouter>
                    <LearningPath />
                </BrowserRouter>
            );

            render(<TestComponent />);

            await waitFor(() => {
                expect(screen.getByText('Test Module')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('Introduction to Testing'));

            // Should display fallback content
            await waitFor(() => {
                expect(screen.getByText(/This lesson covers important concepts/)).toBeInTheDocument();
                expect(screen.getByText('Continue to Next Lesson')).toBeInTheDocument();
                expect(screen.getByText('Try Again')).toBeInTheDocument();
            });
        });
    });

    describe('Offline Functionality', () => {
        test('works with cached content when offline', async () => {
            // Simulate offline state
            Object.defineProperty(navigator, 'onLine', { value: false });

            // Mock cached content
            contentCacheService.get.mockResolvedValue({
                type: 'text',
                content: 'Cached lesson content',
                cached: true
            });

            contentOrchestrator.loadLessonContent.mockResolvedValue({
                success: true,
                content: {
                    moduleId: 'test-module',
                    lessonId: 'lesson-1',
                    success: true,
                    contentTypes: ['text'],
                    content: {
                        text: {
                            type: 'text',
                            content: 'Cached lesson content',
                            cached: true
                        }
                    },
                    errors: [],
                    warnings: []
                }
            });

            const TestComponent = () => (
                <BrowserRouter>
                    <LearningPath />
                </BrowserRouter>
            );

            render(<TestComponent />);

            await waitFor(() => {
                expect(screen.getByText('Test Module')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('Introduction to Testing'));

            // Should display cached content
            await waitFor(() => {
                expect(screen.getByText('Cached lesson content')).toBeInTheDocument();
            });

            // Should indicate offline mode
            expect(screen.getByText(/Offline/)).toBeInTheDocument();
        });

        test('shows offline indicator and limited functionality', async () => {
            Object.defineProperty(navigator, 'onLine', { value: false });

            contentOrchestrator.loadLessonContent.mockRejectedValue(new Error('Network unavailable'));

            const TestComponent = () => (
                <BrowserRouter>
                    <LearningPath />
                </BrowserRouter>
            );

            render(<TestComponent />);

            // Should show offline indicator
            await waitFor(() => {
                expect(screen.getByText(/You are currently offline/)).toBeInTheDocument();
            });

            // Should show limited functionality message
            expect(screen.getByText(/Some features may not be available/)).toBeInTheDocument();
        });

        test('syncs content when coming back online', async () => {
            // Start offline
            Object.defineProperty(navigator, 'onLine', { value: false });

            const TestComponent = () => (
                <BrowserRouter>
                    <LearningPath />
                </BrowserRouter>
            );

            render(<TestComponent />);

            // Go online
            Object.defineProperty(navigator, 'onLine', { value: true });

            // Simulate online event
            const onlineEvent = new Event('online');
            window.dispatchEvent(onlineEvent);

            // Should attempt to sync content
            await waitFor(() => {
                expect(contentCacheService.get).toHaveBeenCalled();
            });
        });
    });

    describe('Content Validation and Health Checking', () => {
        test('validates content before display', async () => {
            const TestComponent = () => (
                <BrowserRouter>
                    <LearningPath />
                </BrowserRouter>
            );

            render(<TestComponent />);

            await waitFor(() => {
                expect(screen.getByText('Test Module')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('Introduction to Testing'));

            // Should validate content
            await waitFor(() => {
                expect(contentValidationService.validateContent).toHaveBeenCalledWith(
                    expect.objectContaining({
                        id: 'lesson-1'
                    }),
                    'video',
                    expect.any(Object)
                );
            });
        });

        test('handles content validation failures', async () => {
            contentValidationService.validateContent.mockResolvedValue({
                isValid: false,
                errors: [
                    { type: 'invalid_url', message: 'Video URL is invalid' }
                ],
                warnings: [
                    { type: 'title_too_long', message: 'Title exceeds recommended length' }
                ]
            });

            const TestComponent = () => (
                <BrowserRouter>
                    <LearningPath />
                </BrowserRouter>
            );

            render(<TestComponent />);

            await waitFor(() => {
                expect(screen.getByText('Test Module')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('Introduction to Testing'));

            // Should show validation warnings
            await waitFor(() => {
                expect(screen.getByText(/Content validation issues detected/)).toBeInTheDocument();
                expect(screen.getByText(/Video URL is invalid/)).toBeInTheDocument();
            });
        });

        test('performs proactive health checks', async () => {
            const TestComponent = () => (
                <BrowserRouter>
                    <LearningPath />
                </BrowserRouter>
            );

            render(<TestComponent />);

            // Should schedule health checks for loaded content
            await waitFor(() => {
                expect(contentValidationService.scheduleHealthCheck).toHaveBeenCalled();
            });
        });
    });

    describe('Performance Optimization', () => {
        test('implements content preloading', async () => {
            const TestComponent = () => (
                <BrowserRouter>
                    <LearningPath />
                </BrowserRouter>
            );

            render(<TestComponent />);

            await waitFor(() => {
                expect(screen.getByText('Test Module')).toBeInTheDocument();
            });

            // Should preload next lesson content
            await waitFor(() => {
                expect(contentCacheService.preloadContent).toHaveBeenCalledWith(
                    expect.arrayContaining([
                        expect.objectContaining({
                            type: 'video',
                            url: 'https://www.youtube.com/watch?v=test2'
                        })
                    ]),
                    expect.any(Object)
                );
            });
        });

        test('uses lazy loading for images', async () => {
            const TestComponent = () => (
                <BrowserRouter>
                    <LearningPath />
                </BrowserRouter>
            );

            render(<TestComponent />);

            await waitFor(() => {
                expect(screen.getByText('Test Module')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('Introduction to Testing'));

            // Images should have lazy loading attribute
            await waitFor(() => {
                const images = screen.getAllByRole('img');
                images.forEach(img => {
                    expect(img).toHaveAttribute('loading', 'lazy');
                });
            });
        });

        test('compresses and optimizes content delivery', async () => {
            const TestComponent = () => (
                <BrowserRouter>
                    <LearningPath />
                </BrowserRouter>
            );

            render(<TestComponent />);

            await waitFor(() => {
                expect(screen.getByText('Test Module')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('Introduction to Testing'));

            // Should use compressed content when available
            await waitFor(() => {
                expect(contentCacheService.set).toHaveBeenCalledWith(
                    expect.any(String),
                    expect.any(Object),
                    expect.objectContaining({
                        compressed: true
                    })
                );
            });
        });
    });

    describe('Cross-Browser Compatibility', () => {
        test('works with different user agents', async () => {
            // Mock different user agents
            const userAgents = [
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0'
            ];

            for (const userAgent of userAgents) {
                Object.defineProperty(navigator, 'userAgent', {
                    value: userAgent,
                    configurable: true
                });

                const TestComponent = () => (
                    <BrowserRouter>
                        <LearningPath />
                    </BrowserRouter>
                );

                const { unmount } = render(<TestComponent />);

                await waitFor(() => {
                    expect(screen.getByText('Test Module')).toBeInTheDocument();
                });

                fireEvent.click(screen.getByText('Introduction to Testing'));

                // Should work regardless of browser
                await waitFor(() => {
                    expect(contentOrchestrator.loadLessonContent).toHaveBeenCalled();
                });

                unmount();
                jest.clearAllMocks();
            }
        });

        test('handles different network conditions', async () => {
            // Test different connection types
            const connections = [
                { downlink: 0.5, effectiveType: '2g' },
                { downlink: 1.5, effectiveType: '3g' },
                { downlink: 5.0, effectiveType: '4g' }
            ];

            for (const connection of connections) {
                Object.defineProperty(navigator, 'connection', {
                    value: {
                        ...connection,
                        addEventListener: jest.fn()
                    },
                    configurable: true
                });

                const TestComponent = () => (
                    <BrowserRouter>
                        <LearningPath />
                    </BrowserRouter>
                );

                const { unmount } = render(<TestComponent />);

                await waitFor(() => {
                    expect(screen.getByText('Test Module')).toBeInTheDocument();
                });

                fireEvent.click(screen.getByText('Introduction to Testing'));

                // Should adapt to network conditions
                await waitFor(() => {
                    expect(contentOrchestrator.loadLessonContent).toHaveBeenCalledWith(
                        expect.any(Object),
                        expect.objectContaining({
                            networkCondition: connection.effectiveType
                        })
                    );
                });

                unmount();
                jest.clearAllMocks();
            }
        });
    });
});

// Helper function to simulate network state changes
function simulateNetworkChange(isOnline) {
    Object.defineProperty(navigator, 'onLine', { value: isOnline });
    const event = new Event(isOnline ? 'online' : 'offline');
    window.dispatchEvent(event);
}

// Helper function to simulate connection changes
function simulateConnectionChange(connection) {
    Object.defineProperty(navigator, 'connection', {
        value: {
            ...connection,
            addEventListener: jest.fn()
        }
    });

    if (navigator.connection.addEventListener.mock) {
        const changeHandler = navigator.connection.addEventListener.mock.calls
            .find(call => call[0] === 'change')?.[1];
        if (changeHandler) {
            changeHandler();
        }
    }
}