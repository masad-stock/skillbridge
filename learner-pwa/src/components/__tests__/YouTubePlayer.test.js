/**
 * Enhanced YouTube Player Tests
 * 
 * Tests for video player error handling, adaptive quality, and offline support
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import YouTubePlayer from '../YouTubePlayer';
import contentErrorLogger from '../../services/contentErrorLogger';

// Mock dependencies
jest.mock('../../services/contentErrorLogger');

// Mock YouTube API
const mockYouTubePlayer = {
    playVideo: jest.fn(),
    pauseVideo: jest.fn(),
    seekTo: jest.fn(),
    getCurrentTime: jest.fn(() => 30),
    getDuration: jest.fn(() => 300),
    getPlayerState: jest.fn(() => 1), // Playing
    getAvailableQualityLevels: jest.fn(() => ['small', 'medium', 'large', 'hd720']),
    setPlaybackQuality: jest.fn(),
    getVideoLoadedFraction: jest.fn(() => 0.5),
    destroy: jest.fn()
};

// Mock YouTube API global
global.YT = {
    Player: jest.fn(() => mockYouTubePlayer),
    PlayerState: {
        UNSTARTED: -1,
        ENDED: 0,
        PLAYING: 1,
        PAUSED: 2,
        BUFFERING: 3,
        CUED: 5
    }
};

// Mock navigator.connection
Object.defineProperty(navigator, 'connection', {
    writable: true,
    value: {
        downlink: 2.5,
        effectiveType: '4g',
        addEventListener: jest.fn()
    }
});

describe('YouTubePlayer', () => {
    const defaultProps = {
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        title: 'Test Video',
        instructor: 'Test Instructor',
        duration: 5,
        onProgress: jest.fn(),
        onComplete: jest.fn(),
        onError: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
        // Mock YouTube API ready
        global.window.YT = global.YT;
        localStorage.clear();
    });

    describe('Basic Functionality', () => {
        test('renders video player with title and instructor', () => {
            render(<YouTubePlayer {...defaultProps} />);

            expect(screen.getByText('Test Video')).toBeInTheDocument();
            expect(screen.getByText(/Instructor: Test Instructor/)).toBeInTheDocument();
        });

        test('shows loading state initially', () => {
            render(<YouTubePlayer {...defaultProps} />);

            expect(screen.getByText(/Initializing video player/)).toBeInTheDocument();
            expect(screen.getByRole('status')).toBeInTheDocument(); // Spinner
        });

        test('handles invalid video URL', () => {
            render(<YouTubePlayer {...defaultProps} videoUrl="invalid-url" />);

            expect(screen.getByText(/Video Not Available/)).toBeInTheDocument();
            expect(screen.getByText(/The video URL is invalid or missing/)).toBeInTheDocument();
        });

        test('displays fallback content when video fails', () => {
            const fallbackContent = <div>Fallback lesson content</div>;

            render(
                <YouTubePlayer
                    {...defaultProps}
                    videoUrl="invalid-url"
                    fallbackContent={fallbackContent}
                />
            );

            expect(screen.getByText('Fallback lesson content')).toBeInTheDocument();
        });
    });

    describe('Error Handling', () => {
        test('handles YouTube API errors', async () => {
            render(<YouTubePlayer {...defaultProps} debugMode={true} />);

            // Simulate YouTube API error
            const errorEvent = { data: 100 }; // Video not found

            // Wait for component to initialize
            await waitFor(() => {
                expect(global.YT.Player).toHaveBeenCalled();
            });

            // Simulate error callback
            const playerInstance = global.YT.Player.mock.results[0].value;
            const onErrorCallback = global.YT.Player.mock.calls[0][1].events.onError;
            onErrorCallback(errorEvent);

            await waitFor(() => {
                expect(screen.getByText(/Video Playback Error/)).toBeInTheDocument();
                expect(screen.getByText(/Video not found or private/)).toBeInTheDocument();
            });
        });

        test('implements retry mechanism', async () => {
            render(<YouTubePlayer {...defaultProps} />);

            // Simulate error
            await waitFor(() => {
                expect(global.YT.Player).toHaveBeenCalled();
            });

            const onErrorCallback = global.YT.Player.mock.calls[0][1].events.onError;
            onErrorCallback({ data: 5 }); // HTML5 player error

            await waitFor(() => {
                expect(screen.getByText(/Retry/)).toBeInTheDocument();
            });

            // Click retry button
            fireEvent.click(screen.getByText(/Retry/));

            // Should attempt to create player again
            await waitFor(() => {
                expect(global.YT.Player).toHaveBeenCalledTimes(2);
            });
        });

        test('logs errors to content error logger', async () => {
            render(<YouTubePlayer {...defaultProps} />);

            await waitFor(() => {
                expect(global.YT.Player).toHaveBeenCalled();
            });

            const onErrorCallback = global.YT.Player.mock.calls[0][1].events.onError;
            onErrorCallback({ data: 100 });

            await waitFor(() => {
                expect(contentErrorLogger.logVideoError).toHaveBeenCalledWith(
                    expect.objectContaining({
                        errorCode: 100,
                        videoUrl: defaultProps.videoUrl
                    })
                );
            });
        });

        test('provides troubleshooting steps', async () => {
            render(<YouTubePlayer {...defaultProps} />);

            await waitFor(() => {
                expect(global.YT.Player).toHaveBeenCalled();
            });

            const onErrorCallback = global.YT.Player.mock.calls[0][1].events.onError;
            onErrorCallback({ data: 100 });

            await waitFor(() => {
                expect(screen.getByText(/Troubleshooting:/)).toBeInTheDocument();
                expect(screen.getByText(/Check your internet connection/)).toBeInTheDocument();
                expect(screen.getByText(/Try refreshing the page/)).toBeInTheDocument();
            });
        });
    });

    describe('Adaptive Quality', () => {
        test('enables adaptive quality by default', () => {
            render(<YouTubePlayer {...defaultProps} enableAdaptiveQuality={true} />);

            // Should render quality selector when player is ready
            // This would be tested with more complex setup simulating player ready state
        });

        test('detects network quality', async () => {
            render(<YouTubePlayer {...defaultProps} enableNetworkDetection={true} />);

            // Network quality detection should be active
            expect(navigator.connection.addEventListener).toHaveBeenCalled();
        });

        test('adjusts video quality based on network', async () => {
            render(<YouTubePlayer {...defaultProps} enableAdaptiveQuality={true} />);

            await waitFor(() => {
                expect(global.YT.Player).toHaveBeenCalled();
            });

            // Simulate player ready
            const onReadyCallback = global.YT.Player.mock.calls[0][1].events.onReady;
            onReadyCallback({ target: mockYouTubePlayer });

            // Should call setPlaybackQuality based on network conditions
            await waitFor(() => {
                expect(mockYouTubePlayer.setPlaybackQuality).toHaveBeenCalled();
            });
        });

        test('allows manual quality selection', async () => {
            render(<YouTubePlayer {...defaultProps} enableAdaptiveQuality={true} />);

            await waitFor(() => {
                expect(global.YT.Player).toHaveBeenCalled();
            });

            const onReadyCallback = global.YT.Player.mock.calls[0][1].events.onReady;
            onReadyCallback({ target: mockYouTubePlayer });

            // Quality dropdown should be available
            await waitFor(() => {
                // This would test the quality dropdown functionality
                expect(mockYouTubePlayer.getAvailableQualityLevels).toHaveBeenCalled();
            });
        });
    });

    describe('Offline Support', () => {
        test('checks offline availability', () => {
            render(<YouTubePlayer {...defaultProps} enableOfflineSupport={true} />);

            // Should check localStorage for offline video data
            expect(localStorage.getItem).toHaveBeenCalledWith(
                expect.stringContaining('offline_video_')
            );
        });

        test('shows download button when offline support enabled', async () => {
            render(<YouTubePlayer {...defaultProps} enableOfflineSupport={true} />);

            await waitFor(() => {
                expect(global.YT.Player).toHaveBeenCalled();
            });

            const onReadyCallback = global.YT.Player.mock.calls[0][1].events.onReady;
            onReadyCallback({ target: mockYouTubePlayer });

            // Download button should be available
            await waitFor(() => {
                expect(screen.getByText(/Download/)).toBeInTheDocument();
            });
        });

        test('simulates video download process', async () => {
            render(<YouTubePlayer {...defaultProps} enableOfflineSupport={true} />);

            await waitFor(() => {
                expect(global.YT.Player).toHaveBeenCalled();
            });

            const onReadyCallback = global.YT.Player.mock.calls[0][1].events.onReady;
            onReadyCallback({ target: mockYouTubePlayer });

            await waitFor(() => {
                expect(screen.getByText(/Download/)).toBeInTheDocument();
            });

            // Click download button
            fireEvent.click(screen.getByText(/Download/));

            // Should show download progress
            await waitFor(() => {
                expect(screen.getByText(/Downloading/)).toBeInTheDocument();
            });
        });

        test('shows offline indicator when video is available offline', () => {
            // Mock offline video data in localStorage
            localStorage.setItem('offline_video_dQw4w9WgXcQ', JSON.stringify({
                videoId: 'dQw4w9WgXcQ',
                title: 'Test Video',
                downloadedAt: new Date().toISOString()
            }));

            render(<YouTubePlayer {...defaultProps} enableOfflineSupport={true} />);

            // Should show offline indicator
            expect(screen.getByText(/Offline/)).toBeInTheDocument();
        });
    });

    describe('Progress Tracking', () => {
        test('tracks video progress', async () => {
            render(<YouTubePlayer {...defaultProps} />);

            await waitFor(() => {
                expect(global.YT.Player).toHaveBeenCalled();
            });

            const onReadyCallback = global.YT.Player.mock.calls[0][1].events.onReady;
            onReadyCallback({ target: mockYouTubePlayer });

            // Progress tracking should start
            await waitFor(() => {
                expect(defaultProps.onProgress).toHaveBeenCalled();
            });
        });

        test('saves and restores playback position', async () => {
            // Set saved position
            localStorage.setItem('video_position_dQw4w9WgXcQ', '60');

            render(<YouTubePlayer {...defaultProps} />);

            await waitFor(() => {
                expect(global.YT.Player).toHaveBeenCalled();
            });

            const onReadyCallback = global.YT.Player.mock.calls[0][1].events.onReady;
            onReadyCallback({ target: mockYouTubePlayer });

            // Should restore saved position
            await waitFor(() => {
                expect(mockYouTubePlayer.seekTo).toHaveBeenCalledWith(60, true);
            });
        });

        test('calls onComplete when video finishes', async () => {
            render(<YouTubePlayer {...defaultProps} />);

            await waitFor(() => {
                expect(global.YT.Player).toHaveBeenCalled();
            });

            const onStateChangeCallback = global.YT.Player.mock.calls[0][1].events.onStateChange;
            onStateChangeCallback({ data: global.YT.PlayerState.ENDED });

            await waitFor(() => {
                expect(defaultProps.onComplete).toHaveBeenCalledWith(
                    expect.objectContaining({
                        completed: true,
                        completedAt: expect.any(String)
                    })
                );
            });
        });

        test('auto-completes at 90% progress', async () => {
            render(<YouTubePlayer {...defaultProps} />);

            await waitFor(() => {
                expect(global.YT.Player).toHaveBeenCalled();
            });

            // Mock 90% progress
            mockYouTubePlayer.getCurrentTime.mockReturnValue(270); // 90% of 300 seconds

            const onReadyCallback = global.YT.Player.mock.calls[0][1].events.onReady;
            onReadyCallback({ target: mockYouTubePlayer });

            // Should auto-complete
            await waitFor(() => {
                expect(defaultProps.onComplete).toHaveBeenCalled();
            });
        });
    });

    describe('Buffer Health Monitoring', () => {
        test('monitors buffer health', async () => {
            render(<YouTubePlayer {...defaultProps} />);

            await waitFor(() => {
                expect(global.YT.Player).toHaveBeenCalled();
            });

            const onReadyCallback = global.YT.Player.mock.calls[0][1].events.onReady;
            onReadyCallback({ target: mockYouTubePlayer });

            // Buffer health monitoring should be active
            await waitFor(() => {
                expect(mockYouTubePlayer.getVideoLoadedFraction).toHaveBeenCalled();
            });
        });

        test('shows buffering indicator', async () => {
            render(<YouTubePlayer {...defaultProps} />);

            await waitFor(() => {
                expect(global.YT.Player).toHaveBeenCalled();
            });

            const onStateChangeCallback = global.YT.Player.mock.calls[0][1].events.onStateChange;
            onStateChangeCallback({ data: global.YT.PlayerState.BUFFERING });

            await waitFor(() => {
                expect(screen.getByText(/Buffering/)).toBeInTheDocument();
            });
        });
    });

    describe('Accessibility', () => {
        test('provides keyboard controls', async () => {
            render(<YouTubePlayer {...defaultProps} />);

            await waitFor(() => {
                expect(global.YT.Player).toHaveBeenCalled();
            });

            const onReadyCallback = global.YT.Player.mock.calls[0][1].events.onReady;
            onReadyCallback({ target: mockYouTubePlayer });

            // Play/pause button should be accessible
            await waitFor(() => {
                const playButton = screen.getByRole('button', { name: /play|pause/i });
                expect(playButton).toBeInTheDocument();
            });
        });

        test('provides progress bar interaction', async () => {
            render(<YouTubePlayer {...defaultProps} />);

            await waitFor(() => {
                expect(global.YT.Player).toHaveBeenCalled();
            });

            const onReadyCallback = global.YT.Player.mock.calls[0][1].events.onReady;
            onReadyCallback({ target: mockYouTubePlayer });

            await waitFor(() => {
                const progressBar = screen.getByRole('progressbar');
                expect(progressBar).toBeInTheDocument();

                // Click on progress bar should seek
                fireEvent.click(progressBar);
                expect(mockYouTubePlayer.seekTo).toHaveBeenCalled();
            });
        });
    });

    describe('Debug Mode', () => {
        test('shows debug information when enabled', () => {
            render(<YouTubePlayer {...defaultProps} debugMode={true} />);

            // Debug info should be visible
            expect(screen.getByText(/API Loaded:/)).toBeInTheDocument();
            expect(screen.getByText(/Video ID:/)).toBeInTheDocument();
        });

        test('logs debug messages when enabled', () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            render(<YouTubePlayer {...defaultProps} debugMode={true} />);

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('[YouTubePlayer]'),
                expect.anything()
            );

            consoleSpy.mockRestore();
        });
    });
});

// Helper function to simulate YouTube API ready state
function simulateYouTubeAPIReady() {
    if (global.onYouTubeIframeAPIReady) {
        global.onYouTubeIframeAPIReady();
    }
}