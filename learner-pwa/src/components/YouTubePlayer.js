import { useEffect, useRef, useState, useCallback } from 'react';
import { Card, Button, ProgressBar, Alert, Badge, Spinner, Dropdown } from 'react-bootstrap';
import contentErrorLogger from '../services/contentErrorLogger';

// Error codes and their meanings
const YOUTUBE_ERROR_CODES = {
    2: { message: 'Invalid video ID', category: 'video', severity: 'high' },
    5: { message: 'HTML5 player error', category: 'player', severity: 'medium' },
    100: { message: 'Video not found or private', category: 'video', severity: 'high' },
    101: { message: 'Video cannot be embedded', category: 'video', severity: 'high' },
    150: { message: 'Video cannot be embedded', category: 'video', severity: 'high' }
};

// Retry configuration with exponential backoff
const RETRY_CONFIG = {
    maxRetries: 3,
    retryDelay: 2000,
    backoffMultiplier: 2
};

// Network quality thresholds (in Mbps)
const NETWORK_QUALITY_THRESHOLDS = {
    excellent: 5,
    good: 2,
    fair: 1,
    poor: 0.5
};

// Video quality settings
const VIDEO_QUALITY_SETTINGS = {
    auto: { label: 'Auto', quality: 'default' },
    hd720: { label: '720p HD', quality: 'hd720' },
    large: { label: '480p', quality: 'large' },
    medium: { label: '360p', quality: 'medium' },
    small: { label: '240p', quality: 'small' }
};

const YouTubePlayer = ({
    videoUrl,
    onProgress,
    onComplete,
    onError,
    title,
    instructor,
    duration,
    autoplay = false,
    debugMode = false,
    fallbackContent = null,
    enableAdaptiveQuality = true,
    enableOfflineSupport = false,
    enableNetworkDetection = true
}) => {
    const playerRef = useRef(null);
    const progressIntervalRef = useRef(null);
    const networkMonitorRef = useRef(null);
    const [player, setPlayer] = useState(null);
    const [isReady, setIsReady] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [totalDuration, setTotalDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [hasStarted, setHasStarted] = useState(false);
    const [watchTime, setWatchTime] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);

    // Enhanced error handling states
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [retryCount, setRetryCount] = useState(0);
    const [apiLoaded, setApiLoaded] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('Initializing video player...');

    // Network and quality states
    const [networkQuality, setNetworkQuality] = useState('unknown');
    const [currentQuality, setCurrentQuality] = useState('auto');
    const [availableQualities, setAvailableQualities] = useState(['auto', 'hd720', 'large', 'medium', 'small']);
    const [isBuffering, setIsBuffering] = useState(false);
    const [bufferHealth, setBufferHealth] = useState(0);

    // Offline support states
    const [isOfflineAvailable, setIsOfflineAvailable] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);

    // Playback position persistence
    const [savedPosition, setSavedPosition] = useState(0);
    const [positionRestored, setPositionRestored] = useState(false);

    // Debug logging
    const debugLog = useCallback((message, data = null) => {
        if (debugMode) {
            console.log(`[YouTubePlayer] ${message}`, data || '');
        }
    }, [debugMode]);

    // Extract video ID from YouTube URL
    const getVideoId = useCallback((url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        const videoId = (match && match[2].length === 11) ? match[2] : null;
        debugLog('Extracted video ID:', videoId);
        return videoId;
    }, [debugLog]);

    const videoId = getVideoId(videoUrl);

    // Network quality detection
    useEffect(() => {
        if (enableNetworkDetection) {
            startNetworkMonitoring();
        }
        return () => {
            if (networkMonitorRef.current) {
                clearInterval(networkMonitorRef.current);
            }
        };
    }, [enableNetworkDetection]);

    // Restore saved playback position
    useEffect(() => {
        if (videoId && !positionRestored) {
            const savedPos = localStorage.getItem(`video_position_${videoId}`);
            if (savedPos) {
                setSavedPosition(parseFloat(savedPos));
            }
            setPositionRestored(true);
        }
    }, [videoId, positionRestored]);

    // Save playback position periodically
    useEffect(() => {
        if (videoId && currentTime > 0) {
            localStorage.setItem(`video_position_${videoId}`, currentTime.toString());
        }
    }, [videoId, currentTime]);

    /**
     * Start network quality monitoring
     */
    const startNetworkMonitoring = useCallback(() => {
        const detectNetworkQuality = () => {
            if ('connection' in navigator) {
                const connection = navigator.connection;
                const downlink = connection.downlink || 0;

                let quality = 'poor';
                if (downlink >= NETWORK_QUALITY_THRESHOLDS.excellent) {
                    quality = 'excellent';
                } else if (downlink >= NETWORK_QUALITY_THRESHOLDS.good) {
                    quality = 'good';
                } else if (downlink >= NETWORK_QUALITY_THRESHOLDS.fair) {
                    quality = 'fair';
                }

                setNetworkQuality(quality);

                // Auto-adjust quality based on network
                if (enableAdaptiveQuality && player && isReady) {
                    adjustVideoQuality(quality);
                }

                debugLog('Network quality detected:', { quality, downlink });
            }
        };

        // Initial detection
        detectNetworkQuality();

        // Monitor network changes
        if ('connection' in navigator) {
            navigator.connection.addEventListener('change', detectNetworkQuality);
        }

        // Periodic monitoring
        networkMonitorRef.current = setInterval(detectNetworkQuality, 30000);
    }, [enableAdaptiveQuality, player, isReady, debugLog]);

    /**
     * Adjust video quality based on network conditions
     */
    const adjustVideoQuality = useCallback((quality) => {
        if (!player || !isReady) return;

        const qualityMap = {
            excellent: 'hd720',
            good: 'large',
            fair: 'medium',
            poor: 'small'
        };

        const targetQuality = qualityMap[quality] || 'medium';

        try {
            player.setPlaybackQuality(targetQuality);
            setCurrentQuality(targetQuality);
            debugLog('Video quality adjusted:', { networkQuality: quality, videoQuality: targetQuality });
        } catch (error) {
            debugLog('Failed to adjust video quality:', error);
        }
    }, [player, isReady, debugLog]);

    /**
     * Manual quality selection
     */
    const setVideoQuality = useCallback((quality) => {
        if (!player || !isReady) return;

        try {
            if (quality === 'auto') {
                adjustVideoQuality(networkQuality);
            } else {
                player.setPlaybackQuality(quality);
                setCurrentQuality(quality);
            }
            debugLog('Manual quality change:', quality);
        } catch (error) {
            debugLog('Failed to set video quality:', error);
        }
    }, [player, isReady, networkQuality, adjustVideoQuality, debugLog]);

    /**
     * Check offline availability
     */
    const checkOfflineAvailability = useCallback(async () => {
        if (!enableOfflineSupport || !videoId) return;

        try {
            const offlineData = localStorage.getItem(`offline_video_${videoId}`);
            setIsOfflineAvailable(!!offlineData);
        } catch (error) {
            debugLog('Failed to check offline availability:', error);
        }
    }, [enableOfflineSupport, videoId, debugLog]);

    /**
     * Download video for offline viewing (simplified implementation)
     */
    const downloadForOffline = useCallback(async () => {
        if (!enableOfflineSupport || !videoId || isDownloading) return;

        setIsDownloading(true);
        setDownloadProgress(0);

        try {
            // Simulate download progress (in real implementation, this would download video data)
            for (let i = 0; i <= 100; i += 10) {
                await new Promise(resolve => setTimeout(resolve, 200));
                setDownloadProgress(i);
            }

            // Store offline availability flag
            const offlineData = {
                videoId,
                title,
                downloadedAt: new Date().toISOString(),
                quality: currentQuality
            };
            localStorage.setItem(`offline_video_${videoId}`, JSON.stringify(offlineData));
            setIsOfflineAvailable(true);

            debugLog('Video downloaded for offline viewing');
        } catch (error) {
            debugLog('Failed to download video:', error);
        } finally {
            setIsDownloading(false);
            setDownloadProgress(0);
        }
    }, [enableOfflineSupport, videoId, isDownloading, title, currentQuality, debugLog]);

    /**
     * Remove offline video
     */
    const removeOfflineVideo = useCallback(() => {
        if (!videoId) return;

        try {
            localStorage.removeItem(`offline_video_${videoId}`);
            setIsOfflineAvailable(false);
            debugLog('Offline video removed');
        } catch (error) {
            debugLog('Failed to remove offline video:', error);
        }
    }, [videoId, debugLog]);

    // Check offline availability on mount
    useEffect(() => {
        checkOfflineAvailability();
    }, [checkOfflineAvailability]);

    // Handle errors with categorization
    const handleError = useCallback((errorCode, customMessage = null) => {
        const errorInfo = YOUTUBE_ERROR_CODES[errorCode] || {
            message: customMessage || `Unknown error (code: ${errorCode})`,
            category: 'unknown',
            severity: 'medium'
        };

        const errorObj = {
            code: errorCode,
            ...errorInfo,
            timestamp: new Date().toISOString(),
            videoUrl,
            videoId,
            retryCount
        };

        debugLog('Error occurred:', errorObj);
        setError(errorObj);
        setIsLoading(false);

        if (onError) {
            onError(errorObj);
        }
    }, [videoUrl, videoId, retryCount, onError, debugLog]);

    // Retry mechanism
    const retryLoad = useCallback(() => {
        if (retryCount < RETRY_CONFIG.maxRetries) {
            const delay = RETRY_CONFIG.retryDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, retryCount);
            debugLog(`Retrying in ${delay}ms (attempt ${retryCount + 1}/${RETRY_CONFIG.maxRetries})`);

            setError(null);
            setIsLoading(true);
            setLoadingMessage(`Retrying... (attempt ${retryCount + 1}/${RETRY_CONFIG.maxRetries})`);

            setTimeout(() => {
                setRetryCount(prev => prev + 1);
                initializePlayer();
            }, delay);
        }
    }, [retryCount, debugLog]);

    // Initialize player
    const initializePlayer = useCallback(() => {
        debugLog('Initializing player...');

        if (!videoId) {
            handleError('INVALID_URL', 'Invalid or missing video URL');
            return;
        }

        if (!playerRef.current) {
            debugLog('Player ref not ready, waiting...');
            return;
        }

        if (!window.YT || !window.YT.Player) {
            debugLog('YouTube API not loaded yet');
            return;
        }

        try {
            // Destroy existing player if any
            if (player) {
                player.destroy();
            }

            setLoadingMessage('Creating video player...');

            const newPlayer = new window.YT.Player(playerRef.current, {
                height: '315',
                width: '100%',
                videoId: videoId,
                playerVars: {
                    autoplay: autoplay ? 1 : 0,
                    controls: 1,
                    modestbranding: 1,
                    rel: 0,
                    showinfo: 0,
                    fs: 1,
                    cc_load_policy: 1,
                    iv_load_policy: 3,
                    autohide: 0,
                    origin: window.location.origin
                },
                events: {
                    onReady: onPlayerReady,
                    onStateChange: onPlayerStateChange,
                    onError: onPlayerError
                }
            });

            setPlayer(newPlayer);
            debugLog('Player created successfully');
        } catch (err) {
            debugLog('Error creating player:', err);
            handleError('PLAYER_CREATE_ERROR', err.message);
        }
    }, [videoId, autoplay, player, handleError, debugLog]);

    // Load YouTube API
    useEffect(() => {
        debugLog('Loading YouTube IFrame API...');
        setLoadingMessage('Loading YouTube API...');

        const loadYouTubeAPI = () => {
            if (window.YT && window.YT.Player) {
                debugLog('YouTube API already loaded');
                setApiLoaded(true);
                return;
            }

            // Check if script is already being loaded
            const existingScript = document.querySelector('script[src*="youtube.com/iframe_api"]');
            if (existingScript) {
                debugLog('YouTube API script already exists, waiting...');
                // Wait for it to load
                const checkInterval = setInterval(() => {
                    if (window.YT && window.YT.Player) {
                        clearInterval(checkInterval);
                        setApiLoaded(true);
                    }
                }, 100);

                // Timeout after 10 seconds
                setTimeout(() => {
                    clearInterval(checkInterval);
                    if (!window.YT || !window.YT.Player) {
                        handleError('API_TIMEOUT', 'YouTube API failed to load');
                    }
                }, 10000);
                return;
            }

            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            tag.async = true;

            tag.onerror = () => {
                debugLog('Failed to load YouTube API script');
                handleError('API_LOAD_ERROR', 'Failed to load YouTube API. Check your internet connection.');
            };

            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

            window.onYouTubeIframeAPIReady = () => {
                debugLog('YouTube API ready');
                setApiLoaded(true);
            };

            // Timeout for API load
            setTimeout(() => {
                if (!window.YT || !window.YT.Player) {
                    handleError('API_TIMEOUT', 'YouTube API took too long to load');
                }
            }, 15000);
        };

        loadYouTubeAPI();

        return () => {
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
            if (player) {
                try {
                    player.destroy();
                } catch (e) {
                    debugLog('Error destroying player:', e);
                }
            }
        };
    }, []);

    // Initialize player when API is loaded
    useEffect(() => {
        if (apiLoaded && videoId && playerRef.current) {
            initializePlayer();
        }
    }, [apiLoaded, videoId, initializePlayer]);

    const onPlayerReady = (event) => {
        debugLog('Player ready');
        setIsReady(true);
        setIsLoading(false);
        setError(null);

        const videoDuration = event.target.getDuration();
        setTotalDuration(videoDuration);
        debugLog('Video duration:', videoDuration);

        // Get available quality levels
        const qualities = event.target.getAvailableQualityLevels();
        setAvailableQualities(qualities);
        debugLog('Available qualities:', qualities);

        // Restore saved position if available
        if (savedPosition > 0 && savedPosition < videoDuration * 0.9) {
            event.target.seekTo(savedPosition, true);
            debugLog('Restored playback position:', savedPosition);
        }

        // Apply initial quality based on network
        if (enableAdaptiveQuality && networkQuality !== 'unknown') {
            adjustVideoQuality(networkQuality);
        }

        // Start progress tracking
        startProgressTracking(event.target);

        // Start buffer health monitoring
        startBufferHealthMonitoring(event.target);
    };

    const onPlayerStateChange = (event) => {
        const playerState = event.data;
        debugLog('Player state changed:', playerState);

        switch (playerState) {
            case window.YT.PlayerState.PLAYING:
                setIsPlaying(true);
                setIsBuffering(false);
                if (!hasStarted) {
                    setHasStarted(true);
                }
                break;
            case window.YT.PlayerState.PAUSED:
                setIsPlaying(false);
                setIsBuffering(false);
                break;
            case window.YT.PlayerState.ENDED:
                setIsPlaying(false);
                setIsBuffering(false);
                handleVideoComplete();
                break;
            case window.YT.PlayerState.BUFFERING:
                setIsBuffering(true);
                debugLog('Video buffering...');
                break;
            case window.YT.PlayerState.CUED:
                setIsBuffering(false);
                break;
            default:
                break;
        }
    };

    /**
     * Start buffer health monitoring
     */
    const startBufferHealthMonitoring = (playerInstance) => {
        const monitorBuffer = () => {
            if (playerInstance && typeof playerInstance.getVideoLoadedFraction === 'function') {
                try {
                    const loadedFraction = playerInstance.getVideoLoadedFraction();
                    const currentTime = playerInstance.getCurrentTime();
                    const duration = playerInstance.getDuration();

                    if (duration > 0) {
                        const currentFraction = currentTime / duration;
                        const bufferAhead = (loadedFraction - currentFraction) * duration;
                        const bufferHealthPercent = Math.min(100, Math.max(0, (bufferAhead / 30) * 100)); // 30 seconds = 100%

                        setBufferHealth(bufferHealthPercent);

                        // Log buffer health issues
                        if (bufferHealthPercent < 20 && isPlaying) {
                            debugLog('Low buffer health detected:', { bufferHealthPercent, bufferAhead });
                        }
                    }
                } catch (e) {
                    debugLog('Error monitoring buffer health:', e);
                }
            }
        };

        // Monitor buffer health every 2 seconds
        const bufferInterval = setInterval(monitorBuffer, 2000);

        // Store interval reference for cleanup
        if (!progressIntervalRef.current) {
            progressIntervalRef.current = bufferInterval;
        }
    };

    const onPlayerError = (event) => {
        debugLog('Player error:', event.data);
        handleError(event.data);
    };

    const startProgressTracking = (playerInstance) => {
        // Clear any existing interval
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
        }

        progressIntervalRef.current = setInterval(() => {
            if (playerInstance && typeof playerInstance.getCurrentTime === 'function') {
                try {
                    const current = playerInstance.getCurrentTime();
                    const total = playerInstance.getDuration();

                    if (total > 0) {
                        const progressPercent = (current / total) * 100;
                        setCurrentTime(current);
                        setProgress(progressPercent);

                        // Track actual watch time (only when playing)
                        if (playerInstance.getPlayerState() === window.YT.PlayerState.PLAYING) {
                            setWatchTime(prev => prev + 1);
                        }

                        // Call progress callback
                        if (onProgress) {
                            onProgress({
                                currentTime: current,
                                duration: total,
                                progress: progressPercent,
                                watchTime: watchTime,
                                isPlaying: playerInstance.getPlayerState() === window.YT.PlayerState.PLAYING
                            });
                        }

                        // Auto-complete if watched 90% or more
                        if (progressPercent >= 90 && !isCompleted) {
                            handleVideoComplete();
                        }
                    }
                } catch (e) {
                    debugLog('Error tracking progress:', e);
                }
            }
        }, 1000);
    };

    const handleVideoComplete = () => {
        if (!isCompleted) {
            setIsCompleted(true);
            debugLog('Video completed');
            if (onComplete) {
                onComplete({
                    completed: true,
                    watchTime: watchTime,
                    progress: progress,
                    completedAt: new Date().toISOString()
                });
            }
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handlePlayPause = () => {
        if (player && isReady) {
            if (isPlaying) {
                player.pauseVideo();
            } else {
                player.playVideo();
            }
        }
    };

    const handleSeek = (percentage) => {
        if (player && isReady && totalDuration > 0) {
            const seekTime = (percentage / 100) * totalDuration;
            player.seekTo(seekTime, true);
        }
    };

    // Render error state with troubleshooting
    if (error) {
        return (
            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-light border-0 py-3">
                    <h6 className="mb-0 fw-bold">{title}</h6>
                </Card.Header>
                <Card.Body className="p-4">
                    <Alert variant="danger" className="mb-3">
                        <Alert.Heading className="h6">
                            <span className="me-2">⚠️</span>
                            Video Playback Error
                        </Alert.Heading>
                        <p className="mb-2">{error.message}</p>
                        <hr />
                        <div className="small">
                            <strong>Troubleshooting:</strong>
                            <ul className="mb-0 mt-2">
                                <li>Check your internet connection</li>
                                <li>Try refreshing the page</li>
                                <li>Disable ad blockers for this site</li>
                                <li>Try a different browser</li>
                            </ul>
                        </div>
                    </Alert>

                    <div className="d-flex gap-2 mb-3">
                        {retryCount < RETRY_CONFIG.maxRetries && (
                            <Button variant="primary" size="sm" onClick={retryLoad}>
                                <span className="me-1">🔄</span>
                                Retry ({RETRY_CONFIG.maxRetries - retryCount} attempts left)
                            </Button>
                        )}
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            href={videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <span className="me-1">🔗</span>
                            Watch on YouTube
                        </Button>
                    </div>

                    {/* Fallback content */}
                    {fallbackContent && (
                        <div className="mt-3 p-3 bg-light rounded">
                            <h6 className="fw-bold mb-2">📚 Alternative Content</h6>
                            {fallbackContent}
                        </div>
                    )}

                    {debugMode && (
                        <div className="mt-3 p-2 bg-dark text-light rounded small">
                            <strong>Debug Info:</strong>
                            <pre className="mb-0 mt-1" style={{ fontSize: '0.75rem' }}>
                                {JSON.stringify(error, null, 2)}
                            </pre>
                        </div>
                    )}
                </Card.Body>
            </Card>
        );
    }

    // Render invalid URL state
    if (!videoId) {
        return (
            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-light border-0 py-3">
                    <h6 className="mb-0 fw-bold">{title}</h6>
                </Card.Header>
                <Card.Body className="p-4">
                    <Alert variant="warning">
                        <Alert.Heading className="h6">
                            <span className="me-2">⚠️</span>
                            Video Not Available
                        </Alert.Heading>
                        <p className="mb-2">The video URL is invalid or missing.</p>
                        {debugMode && (
                            <small className="text-muted d-block mt-2">
                                URL provided: {videoUrl || 'none'}
                            </small>
                        )}
                    </Alert>

                    {fallbackContent && (
                        <div className="mt-3 p-3 bg-light rounded">
                            <h6 className="fw-bold mb-2">📚 Lesson Content</h6>
                            {fallbackContent}
                        </div>
                    )}
                </Card.Body>
            </Card>
        );
    }

    return (
        <Card className="border-0 shadow-sm">
            <Card.Header className="bg-light border-0 py-3">
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 className="mb-1 fw-bold">{title}</h6>
                        {instructor && (
                            <small className="text-muted">Instructor: {instructor}</small>
                        )}
                    </div>
                    <div className="d-flex gap-2">
                        {isCompleted && (
                            <Badge bg="success">
                                <span className="me-1">✅</span>
                                Completed
                            </Badge>
                        )}
                        {hasStarted && !isCompleted && (
                            <Badge bg="info">
                                <span className="me-1">▶️</span>
                                In Progress
                            </Badge>
                        )}
                    </div>
                </div>
            </Card.Header>

            <Card.Body className="p-0">
                {/* YouTube Player Container */}
                <div className="position-relative" style={{ minHeight: '315px' }}>
                    <div ref={playerRef} className="w-100"></div>

                    {isLoading && (
                        <div
                            className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-light"
                            style={{ minHeight: '315px' }}
                        >
                            <div className="text-center">
                                <Spinner animation="border" variant="primary" className="mb-2" />
                                <p className="text-muted mb-0">{loadingMessage}</p>
                                {debugMode && (
                                    <small className="text-muted d-block mt-2">
                                        API Loaded: {apiLoaded ? 'Yes' : 'No'} |
                                        Video ID: {videoId}
                                    </small>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Progress and Controls */}
                {isReady && (
                    <div className="p-3 bg-light">
                        <div className="mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <small className="text-muted">
                                    Progress: {Math.round(progress)}%
                                </small>
                                <small className="text-muted">
                                    {formatTime(currentTime)} / {formatTime(totalDuration)}
                                </small>
                            </div>
                            <ProgressBar
                                now={progress}
                                variant={isCompleted ? 'success' : 'primary'}
                                style={{ height: '8px', cursor: 'pointer' }}
                                onClick={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const clickX = e.clientX - rect.left;
                                    const percentage = (clickX / rect.width) * 100;
                                    handleSeek(percentage);
                                }}
                            />
                        </div>

                        <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex gap-2">
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={handlePlayPause}
                                >
                                    {isPlaying ? '⏸️' : '▶️'}
                                </Button>

                                {/* Quality Selection */}
                                {enableAdaptiveQuality && availableQualities.length > 0 && (
                                    <Dropdown>
                                        <Dropdown.Toggle variant="outline-secondary" size="sm">
                                            <span className="me-1">⚙️</span>
                                            {VIDEO_QUALITY_SETTINGS[currentQuality]?.label || currentQuality}
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <Dropdown.Item onClick={() => setVideoQuality('auto')}>
                                                Auto ({networkQuality})
                                            </Dropdown.Item>
                                            <Dropdown.Divider />
                                            {availableQualities.map(quality => (
                                                <Dropdown.Item
                                                    key={quality}
                                                    onClick={() => setVideoQuality(quality)}
                                                    active={currentQuality === quality}
                                                >
                                                    {VIDEO_QUALITY_SETTINGS[quality]?.label || quality}
                                                </Dropdown.Item>
                                            ))}
                                        </Dropdown.Menu>
                                    </Dropdown>
                                )}

                                {/* Offline Support */}
                                {enableOfflineSupport && (
                                    <div className="d-flex gap-1">
                                        {isOfflineAvailable ? (
                                            <Button
                                                variant="outline-success"
                                                size="sm"
                                                onClick={removeOfflineVideo}
                                                title="Remove offline video"
                                            >
                                                <span className="me-1">📱</span>
                                                Offline
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="outline-info"
                                                size="sm"
                                                onClick={downloadForOffline}
                                                disabled={isDownloading}
                                                title="Download for offline viewing"
                                            >
                                                {isDownloading ? (
                                                    <>
                                                        <Spinner size="sm" className="me-1" />
                                                        {downloadProgress}%
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="me-1">⬇️</span>
                                                        Download
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                )}

                                {duration && (
                                    <small className="text-muted align-self-center">
                                        Expected: {duration} min
                                    </small>
                                )}
                            </div>

                            <div className="text-end">
                                <div className="d-flex flex-column align-items-end gap-1">
                                    <small className="text-muted">
                                        Watch time: {Math.floor(watchTime / 60)}:{(watchTime % 60).toString().padStart(2, '0')}
                                    </small>

                                    {/* Network Quality Indicator */}
                                    {enableNetworkDetection && networkQuality !== 'unknown' && (
                                        <div className="d-flex align-items-center gap-1">
                                            <span className="small text-muted">Network:</span>
                                            <Badge
                                                bg={networkQuality === 'excellent' ? 'success' :
                                                    networkQuality === 'good' ? 'info' :
                                                        networkQuality === 'fair' ? 'warning' : 'danger'}
                                                className="small"
                                            >
                                                {networkQuality}
                                            </Badge>
                                        </div>
                                    )}

                                    {/* Buffer Health Indicator */}
                                    {isPlaying && bufferHealth < 50 && (
                                        <div className="d-flex align-items-center gap-1">
                                            <span className="small text-muted">Buffer:</span>
                                            <div style={{ width: '40px', height: '4px' }} className="bg-light rounded">
                                                <div
                                                    style={{
                                                        width: `${bufferHealth}%`,
                                                        height: '100%',
                                                        backgroundColor: bufferHealth > 30 ? '#28a745' : '#dc3545'
                                                    }}
                                                    className="rounded"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Buffering Indicator */}
                                    {isBuffering && (
                                        <div className="d-flex align-items-center gap-1">
                                            <Spinner size="sm" />
                                            <small className="text-muted">Buffering...</small>
                                        </div>
                                    )}

                                    {progress >= 90 && (
                                        <small className="text-success">
                                            <span className="me-1">🎉</span>
                                            Ready to continue!
                                        </small>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Card.Body>

            {/* Completion Actions */}
            {isCompleted && (
                <Card.Footer className="bg-success bg-opacity-10 border-0">
                    <div className="text-center">
                        <div className="fs-4 mb-2">🎉</div>
                        <h6 className="text-success mb-2">Video Completed!</h6>
                        <p className="text-muted small mb-0">
                            You've successfully watched this training video.
                            You can now proceed to the next lesson.
                        </p>
                    </div>
                </Card.Footer>
            )}
        </Card>
    );
};

export default YouTubePlayer;