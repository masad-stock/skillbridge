import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function NotFound() {
    return (
        <Container className="py-5">
            <Row className="justify-content-center align-items-center min-vh-50">
                <Col lg={6} className="text-center">
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="p-5">
                            <div className="display-1 mb-4" style={{ fontSize: '120px' }}>404</div>
                            <h2 className="fw-bold mb-3">Page Not Found</h2>
                            <p className="text-muted mb-4">
                                Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
                            </p>
                            <div className="d-flex gap-3 justify-content-center flex-wrap">
                                <Button as={Link} to="/" variant="primary" size="lg">
                                    <span className="me-2">🏠</span>
                                    Go to Home
                                </Button>
                                <Button as={Link} to="/dashboard" variant="outline-primary" size="lg">
                                    <span className="me-2">📈</span>
                                    Dashboard
                                </Button>
                                <Button variant="outline-secondary" size="lg" onClick={() => window.history.back()}>
                                    <span className="me-2">⬅️</span>
                                    Go Back
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default NotFound;
