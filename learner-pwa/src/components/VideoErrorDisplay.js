import { useState } from 'react';
import { Alert, Button, Card, Collapse, ListGroup } from 'react-bootstrap';

/**
 * VideoErrorDisplay Component
 * 
 * Displays user-friendly error messages with troubleshooting steps
 * and recovery options for video playback issues.
 */

// Error categories with troubleshooting steps
const ERROR_TROUBLESHOOTING = {
    network: {
        title: 'Network Connection Issue',
        icon: '🌐',
        description: 'Unable to connect to YouTube servers.',
        steps: [
            'Check your internet connection',
            'Try refreshing the page',
            'Check if YouTube is accessible in your browser',
            'Disable VPN if you\'re using one',
            'Try switching between WiFi and mobile data'
        ],
        quickFix: 'Check your internet connection and try again.'
    },
    api: {
        title: 'Video Player Error',
        icon: '⚙️',
        description: 'The video player failed to initialize.',
        steps: [
            'Refresh the page',
            'Clear your browser cache',
            'Try a different browser (Chrome, Firefox, Edge)',
            'Disable browser extensions that might block videos',
            'Check if JavaScript is enabled'
        ],
        quickFix: 'Try refreshing the page or using a different browser.'
    },
    video: {
        title: 'Video Unavailable',
        icon: '🎬',
        description: 'This video cannot be played.',
        steps: [
            'The video may have been removed or made private',
            'The video may be restricted in your region',
            'Try watching directly on YouTube',
            'Contact support if the issue persists'
        ],
        quickFix: 'Try watching the video directly on YouTube.'
    },
    player: {
        title: 'Playback Error',
        icon: '▶️',
        description: 'An error occurred during video playback.',
        steps: [
            'Pause and resume the video',
            'Refresh the page',
            'Check your internet speed',
            'Try lowering the video quality',
            'Clear browser cache and cookies'
        ],
        quickFix: 'Try pausing and resuming, or refresh the page.'
    },
    unknown: {
        title: 'Unexpected Error',
        icon: '❓',
        description: 'An unexpected error occurred.',
        steps: [
            'Refresh the page',
            'Try again in a few minutes',
            'Clear your browser cache',
            'Try a different browser',
            'Contact support if the issue persists'
        ],
        quickFix: 'Please try refreshing the page.'
    }
};

const VideoErrorDisplay = ({
    error,
    onRetry,
    onWatchOnYouTube,
    videoUrl,
    showTroubleshooting = true,
    fallbackContent = null,
    compact = false
}) => {
    const [showDetails, setShowDetails] = useState(false);
    const [showSteps, setShowSteps] = useState(false);

    // Get error category info
    const category = error?.category || 'unknown';
    const troubleshooting = ERROR_TROUBLESHOOTING[category] || ERROR_TROUBLESHOOTING.unknown;

    if (compact) {
        return (
            <Alert variant="warning" className="mb-0">
                <div className="d-flex align-items-center justify-content-between">
                    <div>
                        <span className="me-2">{troubleshooting.icon}</span>
                        <strong>{troubleshooting.title}</strong>
                        <span className="ms-2 text-muted small">{troubleshooting.quickFix}</span>
                    </div>
                    <div className="d-flex gap-2">
                        {onRetry && (
                            <Button variant="outline-primary" size="sm" onClick={onRetry}>
                                Retry
                            </Button>
                        )}
                        {videoUrl && (
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                href={videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                YouTube
                            </Button>
                        )}
                    </div>
                </div>
            </Alert>
        );
    }

    return (
        <Card className="border-danger">
            <Card.Header className="bg-danger bg-opacity-10 border-0">
                <div className="d-flex align-items-center">
                    <span className="fs-4 me-2">{troubleshooting.icon}</span>
                    <div>
                        <h6 className="mb-0 fw-bold">{troubleshooting.title}</h6>
                        <small className="text-muted">{troubleshooting.description}</small>
                    </div>
                </div>
            </Card.Header>

            <Card.Body>
                {/* Quick Fix */}
                <Alert variant="info" className="mb-3">
                    <strong>💡 Quick Fix:</strong> {troubleshooting.quickFix}
                </Alert>

                {/* Action Buttons */}
                <div className="d-flex flex-wrap gap-2 mb-3">
                    {onRetry && (
                        <Button variant="primary" onClick={onRetry}>
                            <span className="me-1">🔄</span>
                            Try Again
                        </Button>
                    )}

                    {videoUrl && (
                        <Button
                            variant="outline-danger"
                            href={videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={onWatchOnYouTube}
                        >
                            <span className="me-1">▶️</span>
                            Watch on YouTube
                        </Button>
                    )}

                    {showTroubleshooting && (
                        <Button
                            variant="outline-secondary"
                            onClick={() => setShowSteps(!showSteps)}
                        >
                            <span className="me-1">🔧</span>
                            {showSteps ? 'Hide' : 'Show'} Troubleshooting
                        </Button>
                    )}
                </div>

                {/* Troubleshooting Steps */}
                {showTroubleshooting && (
                    <Collapse in={showSteps}>
                        <div>
                            <Card className="bg-light border-0 mb-3">
                                <Card.Body>
                                    <h6 className="fw-bold mb-3">
                                        <span className="me-2">🔧</span>
                                        Troubleshooting Steps
                                    </h6>
                                    <ListGroup variant="flush">
                                        {troubleshooting.steps.map((step, index) => (
                                            <ListGroup.Item
                                                key={index}
                                                className="bg-transparent border-0 py-2"
                                            >
                                                <span className="badge bg-secondary me-2">{index + 1}</span>
                                                {step}
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                </Card.Body>
                            </Card>
                        </div>
                    </Collapse>
                )}

                {/* Fallback Content */}
                {fallbackContent && (
                    <div className="mt-3 p-3 bg-success bg-opacity-10 rounded">
                        <h6 className="fw-bold mb-2">
                            <span className="me-2">📚</span>
                            Continue Learning Without Video
                        </h6>
                        <p className="text-muted small mb-2">
                            You can still learn from the text content below while we resolve the video issue.
                        </p>
                        {fallbackContent}
                    </div>
                )}

                {/* Error Details (for debugging) */}
                {error && (
                    <div className="mt-3">
                        <Button
                            variant="link"
                            size="sm"
                            className="text-muted p-0"
                            onClick={() => setShowDetails(!showDetails)}
                        >
                            {showDetails ? '▼' : '▶'} Technical Details
                        </Button>
                        <Collapse in={showDetails}>
                            <div className="mt-2 p-2 bg-dark text-light rounded small font-monospace">
                                <div>Error Code: {error.code || 'N/A'}</div>
                                <div>Category: {error.category || 'unknown'}</div>
                                <div>Message: {error.message || 'No message'}</div>
                                <div>Time: {error.timestamp || new Date().toISOString()}</div>
                                {error.videoId && <div>Video ID: {error.videoId}</div>}
                            </div>
                        </Collapse>
                    </div>
                )}
            </Card.Body>

            <Card.Footer className="bg-light border-0">
                <small className="text-muted">
                    <span className="me-1">💬</span>
                    Still having issues?
                    <a href="/contact" className="ms-1">Contact Support</a>
                </small>
            </Card.Footer>
        </Card>
    );
};

export default VideoErrorDisplay;