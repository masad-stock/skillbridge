import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, InputGroup, Button, Badge, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import './Courses.css';

function Courses() {
  const { t } = useTranslation();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'computer-science', label: 'Computer Science' },
    { value: 'business', label: 'Business' },
    { value: 'design', label: 'Design' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'data-science', label: 'Data Science' },
    { value: 'web-development', label: 'Web Development' }
  ];

  const levels = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm, selectedCategory, selectedLevel]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/modules');
      setCourses(response.data.modules || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = [...courses];

    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(course =>
        course.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (selectedLevel !== 'all') {
      filtered = filtered.filter(course =>
        course.difficulty?.toLowerCase() === selectedLevel.toLowerCase()
      );
    }

    setFilteredCourses(filtered);
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
        <p className="mt-3">Loading courses...</p>
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
        <Button variant="primary" onClick={fetchCourses}>
          <i className="bi bi-arrow-clockwise me-2"></i>
          Try Again
        </Button>
      </Container>
    );
  }

  return (
    <div className="courses-page">
      <section className="courses-hero bg-primary text-white py-5">
        <Container>
          <Row className="align-items-center">
            <Col lg={8}>
              <h1 className="display-4 fw-bold mb-3">Explore Our Courses</h1>
              <p className="lead mb-4">
                Discover thousands of high-quality courses designed by industry professionals.
                Learn at your own pace and advance your career.
              </p>
              <div className="d-flex gap-3">
                <div className="stat-item">
                  <h3 className="mb-0">{courses.length}+</h3>
                  <small>Courses Available</small>
                </div>
                <div className="stat-item">
                  <h3 className="mb-0">50K+</h3>
                  <small>Students Enrolled</small>
                </div>
                <div className="stat-item">
                  <h3 className="mb-0">98%</h3>
                  <small>Success Rate</small>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="filters-section py-4 bg-light">
        <Container>
          <Row className="g-3">
            <Col md={5}>
              <InputGroup>
                <InputGroup.Text>
                  <i className="bi bi-search"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
              >
                {levels.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={1}>
              <Button
                variant="outline-secondary"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedLevel('all');
                }}
                title="Clear filters"
              >
                <i className="bi bi-x-lg"></i>
              </Button>
            </Col>
          </Row>
          <div className="mt-2 text-muted">
            <small>Showing {filteredCourses.length} of {courses.length} courses</small>
          </div>
        </Container>
      </section>

      <section className="courses-grid py-5">
        <Container>
          {filteredCourses.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-inbox display-1 text-muted"></i>
              <h3 className="mt-3">No courses found</h3>
              <p className="text-muted">Try adjusting your filters or search term</p>
              <Button
                variant="primary"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedLevel('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <Row className="g-4">
              {filteredCourses.map((course) => (
                <Col key={course._id} lg={4} md={6}>
                  <Card className="course-card h-100 shadow-sm">
                    <div className="course-image-wrapper">
                      {course.thumbnail ? (
                        <Card.Img
                          variant="top"
                          src={course.thumbnail}
                          alt={course.title}
                          className="course-image"
                        />
                      ) : (
                        <div className="course-image-placeholder bg-primary text-white d-flex align-items-center justify-content-center">
                          <i className="bi bi-book display-4"></i>
                        </div>
                      )}
                      <div className="course-badges">
                        <Badge bg={getLevelBadgeVariant(course.difficulty)}>
                          {course.difficulty || 'Beginner'}
                        </Badge>
                      </div>
                    </div>
                    <Card.Body className="d-flex flex-column">
                      <div className="course-meta mb-2">
                        <small className="text-muted">
                          <i className="bi bi-folder me-1"></i>
                          {course.category || 'General'}
                        </small>
                        {course.duration && (
                          <small className="text-muted ms-3">
                            <i className="bi bi-clock me-1"></i>
                            {course.duration}
                          </small>
                        )}
                      </div>
                      <Card.Title className="h5 mb-2">
                        <Link
                          to={`/courses/${course._id}`}
                          className="text-decoration-none text-dark"
                        >
                          {course.title}
                        </Link>
                      </Card.Title>
                      <Card.Text className="text-muted flex-grow-1">
                        {course.description?.substring(0, 120)}
                        {course.description?.length > 120 ? '...' : ''}
                      </Card.Text>
                      <div className="course-footer mt-3">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <div className="rating">
                            <i className="bi bi-star-fill text-warning"></i>
                            <span className="ms-1">
                              {course.rating || '4.5'} ({course.reviews || '0'})
                            </span>
                          </div>
                          <div className="students text-muted">
                            <i className="bi bi-people me-1"></i>
                            {course.enrolledCount || '0'} students
                          </div>
                        </div>
                        <Link
                          to={`/courses/${course._id}`}
                          className="btn btn-primary w-100"
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
        </Container>
      </section>

      <section className="cta-section bg-light py-5">
        <Container>
          <Row className="align-items-center">
            <Col lg={8}>
              <h2 className="mb-3">Can't find what you're looking for?</h2>
              <p className="text-muted mb-0">
                We're constantly adding new courses. Contact us to suggest a course or
                check back soon for updates.
              </p>
            </Col>
            <Col lg={4} className="text-lg-end">
              <Link to="/contact" className="btn btn-primary btn-lg">
                <i className="bi bi-envelope me-2"></i>
                Contact Us
              </Link>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
}

export default Courses;
