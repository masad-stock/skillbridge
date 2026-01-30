import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import api from '../services/api';
import './InstructorProfile.css';

function InstructorProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [instructor, setInstructor] = useState(null);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchInstructorDetails();
    }, [id]);

    const fetchInstructorDetails = async () => {
        try {
            setLoading(true);

            // Fetch instructor details
            const instructorResponse = await api.get(`/instructors/${id}`);
            setInstructor(instructorResponse.data.instructor);

            // Fetch instructor's courses
            const coursesResponse = await api.get(`/instructors/${id}/courses`);
            setCourses(coursesResponse.data.courses || []);

            setError(null);
        } catch (err) {
            console.error('Error fetching instructor details:', err);
            setError('Failed to load instructor details. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Loading instructor profile...</p>
            </Container>
        );
    }

    if (error || !instructor) {
        return (
            <Container className="py-5">
                <Alert variant="danger">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error || 'Instructor not found'}
                </Alert>
                <Button variant="primary" onClick={() => navigate('/instructors')}>
                    <i className="bi bi-arrow-left me-2"></i>
                    Back to Instructors
                </Button>
            </Container>
        );
    }

    return (
        <div className="instructor-profile-page">
            {/* Breadcrumb */}
            <section className="breadcrumb-section bg-light py-3">
                <Container>
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                            <li className="breadcrumb-item"><Link to="/instructors">Instructors</Link></li>
                            <li className="breadcrumb-item active" aria-current="page">{instructor.name}</li>
                        </ol>
                    </nav>
                </Container>
            </section>

            {/* Instructor Header */}
            <section className="instructor-header bg-primary text-white py-5">
                <Container>
                    <Row className="align-items-center">
                        <Col lg={3} md={4} className="text-center mb-4 mb-md-0">
                            <div className="instructor-avatar-large">
                                {instructor.avatar ? (
                                    <img
                                        src={instructor.avatar}
                                        alt={instructor.name}
                                        className="rounded-circle img-fluid"
                                    />
                                ) : (
                                    <div className="avatar-placeholder rounded-circle bg-white text-primary d-flex align-items-center justify-content-center">
                                        <i className="bi bi-person display-1"></i>
                                    </div>
                                )}
                            </div>
                        </Col>
                        <Col lg={9} md={8}>
                            <h1 className="display-4 fw-bold mb-2">{instructor.name}</h1>
                            <p className="lead mb-3">{instructor.title}</p>

                            <div className="instructor-stats-header d-flex flex-wrap gap-4 mb-4">
                                <div className="stat-item">
                                    <i className="bi bi-star-fill text-warning me-2"></i>
                                    <strong>{instructor.stats?.rating || '4.5'}</strong>
                                    <span className="ms-1">Instructor Rating</span>
                                </div>
                                <div className="stat-item">
                                    <i className="bi bi-people me-2"></i>
                                    <strong>{instructor.stats?.students || '0'}</strong>
                                    <span className="ms-1">Students</span>
                                </div>
                                <div className="stat-item">
                                    <i className="bi bi-book me-2"></i>
                                    <strong>{instructor.stats?.courses || courses.length}</strong>
                                    <span className="ms-1">Courses</span>
                                </div>
                            </div>

                            {/* Social Links */}
                            {instructor.socialLinks && (
                                <div className="social-links d-flex gap-3">
                                    {instructor.socialLinks.linkedin && (
                                        <a
                                            href={instructor.socialLinks.linkedin}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-light btn-sm"
                                            title="LinkedIn"
                                        >
                                            <i className="bi bi-linkedin"></i>
                                        </a>
                                    )}
                                    {instructor.socialLinks.twitter && (
                                        <a
                                            href={instructor.socialLinks.twitter}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-light btn-sm"
                                            title="Twitter"
                                        >
                                            <i className="bi bi-twitter"></i>
                                        </a>
                                    )}
                                    {instructor.socialLinks.github && (
                                        <a
                                            href={instructor.socialLinks.github}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-light btn-sm"
                                            title="GitHub"
                                        >
                                            <i className="bi bi-github"></i>
                                        </a>
                                    )}
                                    {instructor.socialLinks.website && (
                                        <a
                                            href={instructor.socialLinks.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-light btn-sm"
                                            title="Website"
                                        >
                                            <i className="bi bi-globe"></i>
                                        </a>
                                    )}
                                </div>
                            )}
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Instructor Bio and Details */}
            <section className="instructor-details py-5">
                <Container>
                    <Row>
                        <Col lg={8}>
                            {/* About Section */}
                            <Card className="mb-4 shadow-sm">
                                <Card.Body>
                                    <h3 className="mb-3">
                                        <i className="bi bi-person-badge me-2 text-primary"></i>
                                        About {instructor.name}
                                    </h3>
                                    <p className="text-muted" style={{ whiteSpace: 'pre-line' }}>
                                        {instructor.bio || 'No bio available.'}
                                    </p>
                                </Card.Body>
                            </Card>

                            {/* Expertise Section */}
                            {instructor.expertise && instructor.expertise.length > 0 && (
                                <Card className="mb-4 shadow-sm">
                                    <Card.Body>
                                        <h3 className="mb-3">
                                            <i className="bi bi-lightbulb me-2 text-primary"></i>
                                            Areas of Expertise
                                        </h3>
                                        <div className="expertise-tags-large">
                                            {instructor.expertise.map((exp, index) => (
                                                <Badge key={index} bg="primary" className="me-2 mb-2 p-2">
                                                    {exp}
                                                </Badge>
                                            ))}
                                        </div>
                                    </Card.Body>
                                </Card>
                            )}

                            {/* Courses Section */}
                            <Card className="shadow-sm">
                                <Card.Body>
                                    <h3 className="mb-4">
                                        <i className="bi bi-book me-2 text-primary"></i>
                                        Courses by {instructor.name}
                                    </h3>
                                    {courses.length === 0 ? (
                                        <Alert variant="info">
                                            <i className="bi bi-info-circle me-2"></i>
                                            No courses available yet. Check back soon!
                                        </Alert>
                                    ) : (
                                        <Row className="g-3">
                                            {courses.map((course) => (
                                                <Col md={6} key={course._id}>
                                                    <Card className="course-card-small h-100">
                                                        <Card.Body>
                                                            <Card.Title className="h6">
                                                                <Link
                                                                    to={`/courses/${course._id}`}
                                                                    className="text-decoration-none text-dark"
                                                                >
                                                                    {course.title}
                                                                </Link>
                                                            </Card.Title>
                                                            <Card.Text className="text-muted small">
                                                                {course.description?.substring(0, 80)}
                                                                {course.description?.length > 80 ? '...' : ''}
                                                            </Card.Text>
                                                            <div className="d-flex justify-content-between align-items-center mt-2">
                                                                <div className="small text-muted">
                                                                    <i className="bi bi-people me-1"></i>
                                                                    {course.enrolledCount || '0'} students
                                                                </div>
                                                                <Link
                                                                    to={`/courses/${course._id}`}
                                                                    className="btn btn-sm btn-outline-primary"
                                                                >
                                                                    View Course
                                                                </Link>
                                                            </div>
                                                        </Card.Body>
                                                    </Card>
                                                </Col>
                                            ))}
                                        </Row>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Sidebar */}
                        <Col lg={4}>
                            <Card className="sticky-sidebar shadow-sm">
                                <Card.Body>
                                    <h5 className="mb-3">Quick Stats</h5>
                                    <ul className="list-unstyled">
                                        <li className="mb-3">
                                            <i className="bi bi-star-fill text-warning me-2"></i>
                                            <strong>Rating:</strong> {instructor.stats?.rating || '4.5'}/5.0
                                        </li>
                                        <li className="mb-3">
                                            <i className="bi bi-people text-primary me-2"></i>
                                            <strong>Total Students:</strong> {instructor.stats?.students || '0'}
                                        </li>
                                        <li className="mb-3">
                                            <i className="bi bi-book text-success me-2"></i>
                                            <strong>Total Courses:</strong> {instructor.stats?.courses || courses.length}
                                        </li>
                                        <li className="mb-3">
                                            <i className="bi bi-envelope text-info me-2"></i>
                                            <strong>Email:</strong>{' '}
                                            <a href={`mailto:${instructor.email}`} className="text-decoration-none">
                                                Contact
                                            </a>
                                        </li>
                                    </ul>

                                    <hr />

                                    <div className="d-grid gap-2">
                                        <Button
                                            variant="primary"
                                            onClick={() => navigate('/courses')}
                                        >
                                            <i className="bi bi-search me-2"></i>
                                            Browse All Courses
                                        </Button>
                                        <Button
                                            variant="outline-primary"
                                            onClick={() => navigate('/instructors')}
                                        >
                                            <i className="bi bi-arrow-left me-2"></i>
                                            Back to Instructors
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </section>
        </div>
    );
}

export default InstructorProfile;
