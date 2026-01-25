import { useState, useEffect, useRef } from 'react';
import { Modal, Button, ProgressBar, Alert, Spinner } from 'react-bootstrap';

function InAppViewer({
    show,
    onHide,
    url,
    title,
    type,
    onProgress,
    onComplete,
    moduleId,
    materialId
}) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [progress, setProgress] = useState(0);
    const [timeSpent, setTimeSpent] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const intervalRef = useRef(null);
    const viewerRef = useRef(null);

    useEffect(() => {
        if (show) {
            setStartTime(Date.now());
            setProgress(0);
            setTimeSpent(0);
            setIsCompleted(false);
            setError(null);

            // Start progress tracking
            intervalRef.current = setInterval(() => {
                setTimeSpent(prev => {
                    const newTime = prev + 1;

                    // Auto-progress for PDFs and documents based on time spent
                    if (type === 'pdf' || type === 'document') {
                        const estimatedReadingTime = 300; // 5 minutes default
                        const newProgress = Math.min((newTime / estimatedReadingTime) * 100, 100);
                        setProgress(newProgress);

                        if (onProgress) {
                            onProgress({
                                progress: newProgress,
                                timeSpent: newTime,
                                type: type
                            });
                        }

                        // Mark as completed at 80% progress or 4 minutes
                        if (newProgress >= 80 && !isCompleted) {
                            setIsCompleted(true);
                            if (onComplete) {
                                onComplete({
                                    progress: newProgress,
                                    timeSpent: newTime,
                                    completed: true,
                                    type: type
                                });
                            }
                        }
                    }

                    return newTime;
                });
            }, 1000);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [show, type, onProgress, onComplete, isCompleted]);

    const handleVideoProgress = (event) => {
        if (type === 'video' && event.target) {
            const video = event.target;
            const progressPercent = (video.currentTime / video.duration) * 100;
            setProgress(progressPercent);

            if (onProgress) {
                onProgress({
                    progress: progressPercent,
                    timeSpent: timeSpent,
                    currentTime: video.currentTime,
                    duration: video.duration,
                    type: 'video'
                });
            }

            // Mark as completed at 90% for videos
            if (progressPercent >= 90 && !isCompleted) {
                setIsCompleted(true);
                if (onComplete) {
                    onComplete({
                        progress: progressPercent,
                        timeSpent: timeSpent,
                        completed: true,
                        type: 'video'
                    });
                }
            }
        }
    };

    const handleLoad = () => {
        setLoading(false);
        setError(null);
    };

    const handleError = (errorMsg) => {
        setLoading(false);
        setError(errorMsg || 'Failed to load content');
    };

    const getFileTypeIcon = () => {
        switch (type) {
            case 'pdf': return '📄';
            case 'video': return '🎥';
            case 'document': return '📝';
            case 'image': return '🖼️';
            default: return '📎';
        }
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3">Loading content...</p>
                </div>
            );
        }

        if (error) {
            return (
                <Alert variant="danger">
                    <Alert.Heading>Error Loading Content</Alert.Heading>
                    <p>{error}</p>
                    <Button variant="outline-danger" onClick={() => window.open(url, '_blank')}>
                        Open in New Tab
                    </Button>
                </Alert>
            );
        }

        switch (type) {
            case 'pdf':
                return (
                    <div style={{ height: '70vh' }}>
                        <iframe
                            ref={viewerRef}
                            src={`${url}#toolbar=1&navpanes=1&scrollbar=1`}
                            width="100%"
                            height="100%"
                            style={{ border: 'none' }}
                            onLoad={handleLoad}
                            onError={() => handleError('Failed to load PDF')}
                            title={title}
                        />
                    </div>
                );

            case 'video':
                return (
                    <div style={{ height: '70vh' }}>
                        <video
                            ref={viewerRef}
                            controls
                            width="100%"
                            height="100%"
                            onLoadedData={handleLoad}
                            onError={() => handleError('Failed to load video')}
                            onTimeUpdate={handleVideoProgress}
                            onEnded={() => {
                                setProgress(100);
                                setIsCompleted(true);
                                if (onComplete) {
                                    onComplete({
                                        progress: 100,
                                        timeSpent: timeSpent,
                                        completed: true,
                                        type: 'video'
                                    });
                                }
                            }}
                        >
                            <source src={url} type="video/mp4" />
                            <source src={url} type="video/webm" />
                            <source src={url} type="video/ogg" />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                );

            case 'document':
            case 'image':
            default:
                return (
                    <div style={{ height: '70vh' }}>
                        <iframe
                            ref={viewerRef}
                            src={url}
                            width="100%"
                            height="100%"
                            style={{ border: 'none' }}
                            onLoad={handleLoad}
                            onError={() => handleError('Failed to load content')}
                            title={title}
                        />
                    </div>
                );
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="xl" centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    <span className="me-2">{getFileTypeIcon()}</span>
                    {title}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-0">
                {renderContent()}
            </Modal.Body>
            <Modal.Footer className="d-flex justify-content-between align-items-center">
                <div className="flex-grow-1 me-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <small className="text-muted">Progress</small>
                        <small className="text-muted">{Math.round(progress)}%</small>
                    </div>
                    <ProgressBar
                        now={progress}
                        variant={isCompleted ? 'success' : 'primary'}
                        style={{ height: '6px' }}
                    />
                </div>
                <div className="d-flex align-items-center gap-3">
                    <small className="text-muted">
                        ⏱️ {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
                    </small>
                    {isCompleted && (
                        <small className="text-success">
                            ✅ Completed
                        </small>
                    )}
                    <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => window.open(url, '_blank')}
                    >
                        Open External
                    </Button>
                    <Button variant="secondary" onClick={onHide}>
                        Close
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
}

export default InAppViewer;