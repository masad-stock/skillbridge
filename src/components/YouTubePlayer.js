import React, { useEffect, useRef, useState } from 'react';
import { Card, Button, ProgressBar, Alert, Badge } from 'react-bootstrap';

const YouTubePlayer = ({
    videoUrl,
    onProgress,
    onComplete,
    title,
    instructor,
    duration,
    autoplay = false
}) => {
    const playerRef = useRef(null);
    const [player, setPlayer] = useState(null);
    const [isReady, setIsReady] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [totalDuration, setTotalDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [hasStarted, setHasStarted] = useState(false);
    const [watchTime, setWatchTime] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);

    // Extract video ID from YouTube URL
    const getVideoId = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const videoId = getVideoId(videoUrl);

    useEffect(() => {
        // Load YouTube IFrame API
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

            window.onYouTubeIframeAPIReady = initializePlayer;
        } else {
            initializePlayer();
        }

        return () => {
            if (player) {
                player.destroy();
            }
        };
    }, [videoId]);

    const initializePlayer = () => {
        if (!videoId || !playerRef.current) return;

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
                autohide: 0
            },
            events: {
                onReady: onPlayerReady,
                onStateChange: onPlayerStateChange,
                onError: onPlayerError
            }
        });

        setPlayer(newPlayer);
    };

    const onPlayerReady = (event) => {
        setIsReady(true);
        const duration = event.target.getDuration();
        setTotalDuration(duration);

        // Start progress tracking
        startProgressTracking(event.target);
    };

    const onPlayerStateChange = (event) => {
        const playerState = event.data;

        switch (playerState) {
            case window.YT.PlayerState.PLAYING:
                setIsPlaying(true);
                if (!hasStarted) {
                    setHasStarted(true);
                }
                break;
            case window.YT.PlayerState.PAUSED:
                setIsPlaying(false);
                break;
            case window.YT.PlayerState.ENDED:
                setIsPlaying(false);
                handleVideoComplete();
                break;
            default:
                break;
        }
    };

    const onPlayerError = (event) => {
        console.error('YouTube Player Error:', event.data);
    };

    const startProgressTracking = (playerInstance) => {
        const interval = setInterval(() => {
            if (playerInstance && typeof playerInstance.getCurrentTime === 'function') {
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
            }
        }, 1000);

        return () => clearInterval(interval);
    };

    const handleVideoComplete = () => {
        if (!isCompleted) {
            setIsCompleted(true);
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

    if (!videoId) {
        return (
            <Alert variant="danger">
                <Alert.Heading className="h6">Invalid Video URL</Alert.Heading>
                <p className="mb-0">Please check the YouTube video link.</p>
            </Alert>
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
                <div className="position-relative">
                    <div ref={playerRef} className="w-100"></div>

                    {!isReady && (
                        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-light">
                            <div className="text-center">
                                <div className="spinner-border text-primary mb-2" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="text-muted mb-0">Loading video...</p>
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

                                {duration && (
                                    <small className="text-muted align-self-center">
                                        Expected: {duration} min
                                    </small>
                                )}
                            </div>

                            <div className="text-end">
                                <small className="text-muted d-block">
                                    Watch time: {Math.floor(watchTime / 60)}:{(watchTime % 60).toString().padStart(2, '0')}
                                </small>
                                {progress >= 90 && (
                                    <small className="text-success">
                                        <span className="me-1">🎉</span>
                                        Ready to continue!
                                    </small>
                                )}
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