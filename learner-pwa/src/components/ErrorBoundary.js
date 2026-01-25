import { Component } from 'react';
import { Container, Card, Button, Alert } from 'react-bootstrap';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorCount: 0
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log error to console in development
        console.error('Error caught by boundary:', error, errorInfo);

        // Update state
        this.setState(prevState => ({
            error,
            errorInfo,
            errorCount: prevState.errorCount + 1
        }));

        // In production, send to error tracking service
        if (process.env.NODE_ENV === 'production') {
            this.logErrorToService(error, errorInfo);
        }
    }

    logErrorToService = (error, errorInfo) => {
        // TODO: Integrate with Sentry, LogRocket, or similar
        const errorData = {
            message: error.toString(),
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        // For now, just log to console
        console.error('Error logged:', errorData);

        // In production, send to your error tracking service:
        // fetch('/api/log-error', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(errorData)
        // });
    };

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            // Too many errors - suggest reload
            if (this.state.errorCount > 3) {
                return (
                    <Container className="py-5">
                        <Card className="border-0 shadow-sm">
                            <Card.Body className="p-5 text-center">
                                <div className="fs-1 mb-4">⚠️</div>
                                <h3 className="fw-bold mb-3">Multiple Errors Detected</h3>
                                <p className="text-muted mb-4">
                                    The application has encountered multiple errors.
                                    Please reload the page to continue.
                                </p>
                                <Button
                                    variant="primary"
                                    size="lg"
                                    onClick={this.handleReload}
                                >
                                    Reload Page
                                </Button>
                            </Card.Body>
                        </Card>
                    </Container>
                );
            }

            // Show error UI
            return (
                <Container className="py-5">
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="p-5">
                            <div className="text-center mb-4">
                                <div className="fs-1 mb-3">😕</div>
                                <h3 className="fw-bold mb-2">Oops! Something went wrong</h3>
                                <p className="text-muted">
                                    We're sorry for the inconvenience. The error has been logged
                                    and we'll look into it.
                                </p>
                            </div>

                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <Alert variant="danger" className="mb-4">
                                    <Alert.Heading className="h6">Error Details (Development Only)</Alert.Heading>
                                    <p className="mb-2">
                                        <strong>Message:</strong> {this.state.error.toString()}
                                    </p>
                                    <details className="mt-2">
                                        <summary style={{ cursor: 'pointer' }}>
                                            Stack Trace
                                        </summary>
                                        <pre className="mt-2 p-2 bg-light rounded" style={{ fontSize: '0.75rem', overflow: 'auto' }}>
                                            {this.state.error.stack}
                                        </pre>
                                    </details>
                                    {this.state.errorInfo && (
                                        <details className="mt-2">
                                            <summary style={{ cursor: 'pointer' }}>
                                                Component Stack
                                            </summary>
                                            <pre className="mt-2 p-2 bg-light rounded" style={{ fontSize: '0.75rem', overflow: 'auto' }}>
                                                {this.state.errorInfo.componentStack}
                                            </pre>
                                        </details>
                                    )}
                                </Alert>
                            )}

                            <div className="text-center">
                                <Button
                                    variant="primary"
                                    className="me-2"
                                    onClick={this.handleReset}
                                >
                                    Try Again
                                </Button>
                                <Button
                                    variant="outline-secondary"
                                    onClick={this.handleReload}
                                >
                                    Reload Page
                                </Button>
                            </div>

                            <div className="text-center mt-4">
                                <small className="text-muted">
                                    If this problem persists, please contact support.
                                </small>
                            </div>
                        </Card.Body>
                    </Card>
                </Container>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
