import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Tabs, Tab, Accordion, Spinner, Alert } from 'react-bootstrap';
import { useUser } from '../context/UserContext';
import api from '../services/api';
import './CourseDetails.css';

function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/modules/${id}`);
      setCourse(response.data);
      
      // Check if user is enrolled
      if (user && response.data.enrolledUsers) {
        setIsEnrolled(response.data.enrolledUsers.includes(user._id));
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching course details:', err);
      setError('Failed to load course details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate('/');
      return;
    }

    try {
      setEnrolling(true);
      await api.post(`/modules/${id}/enroll`);
      setIsEnrolled(true);
      alert('Successfully enrolled in the course!');
      navigate('/learning');
    } catch (err) {
      console.error('Error enrolling:', err);
      alert(err.response?.data?.message || 'Failed to enroll. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  const getLevelBadgeVariant = (level) => {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return 'success';
      case 'intermediate':
        return 'warning';
      case 'advanced':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading course details...</p>
      </Container>
    );
  }

  if (error || !course) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error || 'Course not found'}
        </Alert>
        <Button variant="primary" onClick={() => navigate('/courses')}>
          <i className="bi bi-arrow-left me-2"></i>
          Back to Courses
        </Button>
      </Container>
    );
  }

  return (
    <div className="course-details-page">
      {/* Breadcrumb */}
      <section className="breadcrumb-section bg-light py-3">
        <Container>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item"><Link to="/">Home</Link></li>
              <li className="breadcrumb-item"><Link to="/courses">Courses</Link></li>
              <li className="breadcrumb-item active" aria-current="page">{course.title}</li>
            </ol>
          </nav>
        </Container>
      </section>

      {/* Hero Section */}
      <section className="course-hero bg-primary text-white py-5">
        <Container>
          <Row>
            <Col lg={8}>
              <div className="mb-3">
                <Badge bg={getLevelBadgeVariant(course.difficulty)} className="me-2">
                  {course.difficulty || 'Beginner'}
                </Badge>
                <Badge bg="light" text="dark">
                  {course.category || 'General'}
                </Badge>
              </div>
              <h1 className="display-4 fw-bold mb-3">{course.title}</h1>
              <p className="lead mb-4">{course.description}</p>
              
              <div className="course-meta d-flex flex-wrap gap-4 mb-4">
                <div className="meta-item">
                  <i className="bi bi-star-fill text-warning me-1"></i>
                  <strong>{course.rating || '4.5'}</strong>
                  <span className="ms-1">({course.reviews || '0'} reviews)</span>
                </div>
                <div className="meta-item">
                  <i className="bi bi-people me-1"></i>
                  <strong>{course.enrolledCount || '0'}</strong>
                  <span className="ms-1">students</span>
                </div>
                {course.duration && (
                  <div className="meta-item">
                    <i className="bi bi-clock me-1"></i>
                    <strong>{course.duration}</strong>
                  </div>
                )}
                <div className="meta-item">
                  <i className="bi bi-globe me-1"></i>
                  <strong>English</strong>
                </div>
              </div>

              {!isEnrolled ? (
                <Button
                  variant="light"
                  size="lg"
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="px-5"
                >
                  {enrolling ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Enrolling...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-play-circle me-2"></i>
                      Enroll Now
                    </>
                  )}
                </Button>
              ) : (
                <div>
                  <Badge bg="success" className="p-3 fs-6">
                    <i className="bi bi-check-circle me-2"></i>
                    You're enrolled in this course
                  </Badge>
                  <div className="mt-3">
                    <Button
                      variant="light"
                      size="lg"
                      onClick={() => navigate('/learning')}
                      className="px-5"
                    >
                      <i className="bi bi-play-circle me-2"></i>
                      Continue Learning
                    </Button>
                  </div>
                </div>
              )}
            </Col>
            <Col lg={4}>
              <Card className="course-preview-card shadow-lg">
                {course.thumbnail ? (
                  <Card.Img variant="top" src={course.thumbnail} alt={course.title} />
                ) : (
                  <div className="preview-placeholder bg-secondary text-white d-flex align-items-center justify-content-center" style={{ height: '250px' }}>
                    <i className="bi bi-play-circle display-1"></i>
                  </div>
                )}
                <Card.Body>
                  <h5 className="mb-3">This course includes:</h5>
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <i className="bi bi-play-circle text-primary me-2"></i>
                      {course.lessons?.length || '10'} video lessons
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-file-earmark-text text-primary me-2"></i>
                      Downloadable resources
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-phone text-primary me-2"></i>
                      Mobile access
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-infinity text-primary me-2"></i>
                      Lifetime access
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-award text-primary me-2"></i>
                      Certificate of completion
                    </li>
                  </ul>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Course Content */}
      <section className="course-content py-5">
        <Container>
          <Row>
            <Col lg={8}>
              <Tabs defaultActiveKey="overview" className="mb-4">
                <Tab eventKey="overview" title="Overview">
                  <div className="tab-content-wrapper">
                    <h3 className="mb-3">What you'll learn</h3>
                    <Row className="g-3 mb-4">
                      {course.learningObjectives?.map((objective, index) => (
                        <Col md={6} key={index}>
                          <div className="d-flex">
                            <i className="bi bi-check-circle-fill text-success me-2 mt-1"></i>
                            <span>{objective}</span>
                          </div>
                        </Col>
                      )) || (
                        <>
                          <Col md={6}>
                            <div className="d-flex">
                              <i className="bi bi-check-circle-fill text-success me-2 mt-1"></i>
                              <span>Master the fundamentals</span>
                            </div>
                          </Col>
                          <Col md={6}>
                            <div className="d-flex">
                              <i className="bi bi-check-circle-fill text-success me-2 mt-1"></i>
                              <span>Build real-world projects</span>
                            </div>
                          </Col>
                          <Col md={6}>
                            <div className="d-flex">
                              <i className="bi bi-check-circle-fill text-success me-2 mt-1"></i>
                              <span>Gain practical experience</span>
                            </div>
                          </Col>
                          <Col md={6}>
                            <div className="d-flex">
                              <i className="bi bi-check-circle-fill text-success me-2 mt-1"></i>
                              <span>Earn a certificate</span>
                            </div>
                          </Col>
                        </>
                      )}
                    </Row>

                    <h3 className="mb-3">Course Description</h3>
                    <p className="text-muted">{course.description}</p>

                    {course.prerequisites && course.prerequisites.length > 0 && (
                      <>
                        <h3 className="mb-3 mt-4">Prerequisites</h3>
                        <ul>
                          {course.prerequisites.map((prereq, index) => (
                            <li key={index} className="mb-2">{prereq}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </Tab>

                <Tab eventKey="curriculum" title="Curriculum">
                  <div className="tab-content-wrapper">
                    <h3 className="mb-4">Course Curriculum</h3>
                    {course.lessons && course.lessons.length > 0 ? (
                      <Accordion>
                        {course.lessons.map((lesson, index) => (
                          <Accordion.Item eventKey={index.toString()} key={index}>
                            <Accordion.Header>
                              <div className="d-flex justify-content-between w-100 pe-3">
                                <span>
                                  <strong>Lesson {index + 1}:</strong> {lesson.title}
                                </span>
                                {lesson.duration && (
                                  <span className="text-muted">
                                    <i className="bi bi-clock me-1"></i>
                                    {lesson.duration}
                                  </span>
                                )}
                              </div>
                            </Accordion.Header>
                            <Accordion.Body>
                              <p>{lesson.description || 'Lesson content will be available after enrollment.'}</p>
                              {lesson.resources && (
                                <div className="mt-2">
                                  <strong>Resources:</strong>
                                  <ul className="mt-2">
                                    {lesson.resources.map((resource, idx) => (
                                      <li key={idx}>{resource}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </Accordion.Body>
                          </Accordion.Item>
                        ))}
                      </Accordion>
                    ) : (
                      <Alert variant="info">
                        <i className="bi bi-info-circle me-2"></i>
                        Curriculum details will be available after enrollment.
                      </Alert>
                    )}
                  </div>
                </Tab>

                <Tab eventKey="instructor" title="Instructor">
                  <div className="tab-content-wrapper">
                    <div className="instructor-info d-flex align-items-start">
                      <div className="instructor-avatar me-3">
                        {course.instructor?.avatar ? (
                          <img
                            src={course.instructor.avatar}
                            alt={course.instructor.name}
                            className="rounded-circle"
                            width="80"
                            height="80"
                          />
                        ) : (
                          <div className="avatar-placeholder rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                            <i className="bi bi-person fs-2"></i>
                          </div>
                        )}
                      </div>
                      <div>
                        <h4>{course.instructor?.name || 'Expert Instructor'}</h4>
                        <p className="text-muted">{course.instructor?.title || 'Professional Educator'}</p>
                        <p>{course.instructor?.bio || 'Experienced professional with years of industry expertise.'}</p>
                        {course.instructor?.stats && (
                          <div className="instructor-stats d-flex gap-4 mt-3">
                            <div>
                              <i className="bi bi-star-fill text-warning me-1"></i>
                              <strong>{course.instructor.stats.rating || '4.8'}</strong> Rating
                            </div>
                            <div>
                              <i className="bi bi-people me-1"></i>
                              <strong>{course.instructor.stats.students || '10,000'}</strong> Students
                            </div>
                            <div>
                              <i className="bi bi-play-circle me-1"></i>
                              <strong>{course.instructor.stats.courses || '15'}</strong> Courses
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Tab>

                <Tab eventKey="reviews" title="Reviews">
                  <div className="tab-content-wrapper">
                    <h3 className="mb-4">Student Reviews</h3>
                    <Alert variant="info">
                      <i className="bi bi-info-circle me-2"></i>
                      Reviews will be available soon. Be the first to enroll and leave a review!
                    </Alert>
                  </div>
                </Tab>
              </Tabs>
            </Col>

            <Col lg={4}>
              <Card className="sticky-sidebar">
                <Card.Body>
                  <h5 className="mb-3">Course Features</h5>
                  <ul className="list-unstyled">
                    <li className="mb-3">
                      <i className="bi bi-clock text-primary me-2"></i>
                      <strong>Duration:</strong> {course.duration || '8 weeks'}
                    </li>
                    <li className="mb-3">
                      <i className="bi bi-bar-chart text-primary me-2"></i>
                      <strong>Level:</strong> {course.difficulty || 'Beginner'}
                    </li>
                    <li className="mb-3">
                      <i className="bi bi-people text-primary me-2"></i>
                      <strong>Students:</strong> {course.enrolledCount || '0'}
                    </li>
                    <li className="mb-3">
                      <i className="bi bi-translate text-primary me-2"></i>
                      <strong>Language:</strong> English
                    </li>
                    <li className="mb-3">
                      <i className="bi bi-award text-primary me-2"></i>
                      <strong>Certificate:</strong> Yes
                    </li>
                  </ul>

                  {!isEnrolled && (
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-100"
                      onClick={handleEnroll}
                      disabled={enrolling}
                    >
                      {enrolling ? 'Enrolling...' : 'Enroll Now'}
                    </Button>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
}

export default CourseDetails;
