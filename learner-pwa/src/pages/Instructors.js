import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, InputGroup, Button, Badge, Spinner } from 'react-bootstrap';
import api from '../services/api';
import './Instructors.css';

function Instructors() {
    const [instructors, setInstructors] = useState([]);
    const [filteredInstructors, setFilteredInstructors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedExpertise, setSelectedExpertise] = useState('all');

    const expertiseAreas = [
        { value: 'all', label: 'All Expertise' },
        { value: 'web-development', label: 'Web Development' },
        { value: 'data-science', label: 'Data Science' },
        { value: 'mobile-development', label: 'Mobile Development' },
        { value: 'cloud-computing', label: 'Cloud Computing' },
        { value: 'cybersecurity', label: 'Cybersecurity' },
        { value: 'ai-ml', label: 'AI & Machine Learning' },
        { value: 'business', label: 'Business' },
        { value: 'design', label: 'Design' }
    ];

    useEffect(() => {
        fetchInstructors();
    }, []);

    useEffect(() => {
        filterInstructors();
    }, [instructors, searchTerm, selectedExpertise]);

    const fetchInstructors = async () => {
        try {
            setLoading(true);
            const response = await api.get('/instructors');
            setInstructors(response.data.instructors || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching instructors:', err);
            setError('Failed to load instructors. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const filterInstructors = () => {
        let filtered = [...instructors];

        if (searchTerm) {
            filtered = filtered.filter(instructor =>
                instructor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                instructor.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                instructor.expertise?.some(exp => exp.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        if (selectedExpertise !== 'all') {
            filtered = filtered.filter(instructor =>
                instructor.expertise?.some(exp =>
                    exp.toLowerCase().replace(/\s+/g, '-') === selectedExpertise
                )
            );
        }

        setFilteredInstructors(filtered);
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Loading instructors...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-5">
                <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                </div>
                <Button variant="primary" onClick={fetchInstructors}>
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Try Again
                </Button>
            </Container>
        );
    }

    return (
        <div className="instructors-page">
            <section className="instructors-hero bg-primary text-white py-5">
                <Container>
                    <Row className="align-items-center">
                        <Col lg={8}>
                            <h1 className="display-4 fw-bold mb-3">Meet Our Instructors</h1>
                            <p className="lead mb-4">
                                Learn from industry experts and experienced professionals who are passionate
                                about sharing their knowledge and helping you succeed.
                            </p>
                            <div className="d-flex gap-3">
                                <div className="stat-item">
                                    <h3 className="mb-0">{instructors.length}+</h3>
                                    <small>Expert Instructors</small>
                                </div>
                                <div className="stat-item">
                                    <h3 className="mb-0">100K+</h3>
                                    <small>Students Taught</small>
                                </div>
                                <div className="stat-item">
                                    <h3 className="mb-0">4.8</h3>
                                    <small>Average Rating</small>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            <section className="filters-section py-4 bg-light">
                <Container>
                    <Row className="g-3">
                        <Col md={7}>
                            <InputGroup>
                                <InputGroup.Text>
                                    <i className="bi bi-search"></i>
                                </InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="Search instructors by name or expertise..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                        <Col md={4}>
                            <Form.Select
                                value={selectedExpertise}
                                onChange={(e) => setSelectedExpertise(e.target.value)}
                            >
                                {expertiseAreas.map(area => (
                                    <option key={area.value} value={area.value}>{area.label}</option>
                                ))}
                            </Form.Select>
                        </Col>
                        <Col md={1}>
                            <Button
                                variant="outline-secondary"
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedExpertise('all');
                                }}
                                title="Clear filters"
                            >
                                <i className="bi bi-x-lg"></i>
                            </Button>
                        </Col>
                    </Row>
                    <div className="mt-2 text-muted">
                        <small>Showing {filteredInstructors.length} of {instructors.length} instructors</small>
                    </div>
                </Container>
            </section>

            <section className="instructors-grid py-5">
                <Container>
                    {filteredInstructors.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="bi bi-person-x display-1 text-muted"></i>
                            <h3 className="mt-3">No instructors found</h3>
                            <p className="text-muted">Try adjusting your filters or search term</p>
                            <Button
                                variant="primary"
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedExpertise('all');
                                }}
                            >
                                Clear Filters
                            </Button>
                        </div>
                    ) : (
                        <Row className="g-4">
                            {filteredInstructors.map((instructor) => (
                                <Col key={instructor._id} lg={4} md={6}>
                                    <Card className="instructor-card h-100 shadow-sm">
                                        <div className="instructor-image-wrapper">
                                            {instructor.avatar ? (
                                                <Card.Img
                                                    variant="top"
                                                    src={instructor.avatar}
                                                    alt={instructor.name}
                                                    className="instructor-image"
                                                />
                                            ) : (
                                                <div className="instructor-image-placeholder bg-primary text-white d-flex align-items-center justify-content-center">
                                                    <i className="bi bi-person display-3"></i>
                                                </div>
                                            )}
                                        </div>
                                        <Card.Body className="d-flex flex-column">
                                            <Card.Title className="h5 mb-1">
                                                <Link
                                                    to={`/instructors/${instructor._id}`}
                                                    className="text-decoration-none text-dark"
                                                >
                                                    {instructor.name}
                                                </Link>
                                            </Card.Title>
                                            <p className="text-muted small mb-3">{instructor.title}</p>

                                            {instructor.expertise && instructor.expertise.length > 0 && (
                                                <div className="expertise-tags mb-3">
                                                    {instructor.expertise.slice(0, 3).map((exp, index) => (
                                                        <Badge key={index} bg="light" text="dark" className="me-1 mb-1">
                                                            {exp}
                                                        </Badge>
                                                    ))}
                                                    {instructor.expertise.length > 3 && (
                                                        <Badge bg="light" text="dark" className="me-1 mb-1">
                                                            +{instructor.expertise.length - 3} more
                                                        </Badge>
                                                    )}
                                                </div>
                                            )}

                                            <Card.Text className="text-muted flex-grow-1 small">
                                                {instructor.bio?.substring(0, 100)}
                                                {instructor.bio?.length > 100 ? '...' : ''}
                                            </Card.Text>

                                            <div className="instructor-stats mt-3 mb-3">
                                                <Row className="text-center">
                                                    <Col xs={4}>
                                                        <div className="stat-value">
                                                            <i className="bi bi-star-fill text-warning"></i>
                                                            <div className="fw-bold">{instructor.stats?.rating || '4.5'}</div>
                                                            <small className="text-muted">Rating</small>
                                                        </div>
                                                    </Col>
                                                    <Col xs={4}>
                                                        <div className="stat-value">
                                                            <i className="bi bi-people text-primary"></i>
                                                            <div className="fw-bold">{instructor.stats?.students || '0'}</div>
                                                            <small className="text-muted">Students</small>
                                                        </div>
                                                    </Col>
                                                    <Col xs={4}>
                                                        <div className="stat-value">
                                                            <i className="bi bi-book text-success"></i>
                                                            <div className="fw-bold">{instructor.stats?.courses || '0'}</div>
                                                            <small className="text-muted">Courses</small>
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </div>

                                            <Link
                                                to={`/instructors/${instructor._id}`}
                                                className="btn btn-primary w-100"
                                            >
                                                View Profile
                                            </Link>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    )}
                </Container>
            </section>

            <section className="cta-section bg-light py-5">
                <Container>
                    <Row className="align-items-center">
                        <Col lg={8}>
                            <h2 className="mb-3">Want to become an instructor?</h2>
                            <p className="text-muted mb-0">
                                Share your expertise with thousands of students worldwide. Join our community
                                of passionate educators and make an impact.
                            </p>
                        </Col>
                        <Col lg={4} className="text-lg-end">
                            <Link to="/contact" className="btn btn-primary btn-lg">
                                <i className="bi bi-envelope me-2"></i>
                                Get in Touch
                            </Link>
                        </Col>
                    </Row>
                </Container>
            </section>
        </div>
    );
}

export default Instructors;
