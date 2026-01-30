import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, InputGroup, Button, Badge, Spinner, Pagination } from 'react-bootstrap';
import api from '../services/api';
import './Blog.css';

function Blog() {
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 9;

    const categories = [
        { value: 'all', label: 'All Categories' },
        { value: 'technology', label: 'Technology' },
        { value: 'business', label: 'Business' },
        { value: 'education', label: 'Education' },
        { value: 'career', label: 'Career' },
        { value: 'entrepreneurship', label: 'Entrepreneurship' },
        { value: 'skills', label: 'Skills Development' }
    ];

    useEffect(() => {
        fetchPosts();
    }, []);

    useEffect(() => {
        filterPosts();
    }, [posts, searchTerm, selectedCategory]);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/blog');
            setPosts(response.data.posts || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching blog posts:', err);
            setError('Failed to load blog posts. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const filterPosts = () => {
        let filtered = [...posts];

        if (searchTerm) {
            filtered = filtered.filter(post =>
                post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                post.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        if (selectedCategory !== 'all') {
            filtered = filtered.filter(post =>
                post.category?.toLowerCase() === selectedCategory.toLowerCase()
            );
        }

        setFilteredPosts(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Pagination logic
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Get featured post (first post)
    const featuredPost = posts.length > 0 ? posts[0] : null;

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Loading blog posts...</p>
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
                <Button variant="primary" onClick={fetchPosts}>
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Try Again
                </Button>
            </Container>
        );
    }

    return (
        <div className="blog-page">
            <section className="blog-hero bg-primary text-white py-5">
                <Container>
                    <Row className="align-items-center">
                        <Col lg={8}>
                            <h1 className="display-4 fw-bold mb-3">Our Blog</h1>
                            <p className="lead mb-4">
                                Insights, tips, and stories to help you grow your skills and advance your career.
                                Stay updated with the latest trends in education and technology.
                            </p>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Featured Post */}
            {featuredPost && (
                <section className="featured-post py-5 bg-light">
                    <Container>
                        <h2 className="mb-4">Featured Post</h2>
                        <Card className="featured-card shadow-lg">
                            <Row className="g-0">
                                <Col md={6}>
                                    {featuredPost.featuredImage ? (
                                        <Card.Img
                                            src={featuredPost.featuredImage}
                                            alt={featuredPost.title}
                                            className="featured-image"
                                        />
                                    ) : (
                                        <div className="featured-image-placeholder bg-primary text-white d-flex align-items-center justify-content-center">
                                            <i className="bi bi-newspaper display-1"></i>
                                        </div>
                                    )}
                                </Col>
                                <Col md={6}>
                                    <Card.Body className="d-flex flex-column h-100">
                                        <div className="mb-2">
                                            <Badge bg="primary">{featuredPost.category}</Badge>
                                            <span className="text-muted ms-2 small">
                                                <i className="bi bi-calendar me-1"></i>
                                                {formatDate(featuredPost.publishedAt)}
                                            </span>
                                        </div>
                                        <Card.Title className="h3 mb-3">{featuredPost.title}</Card.Title>
                                        <Card.Text className="text-muted flex-grow-1">
                                            {featuredPost.excerpt}
                                        </Card.Text>
                                        <div className="d-flex justify-content-between align-items-center mt-3">
                                            <div className="text-muted small">
                                                <i className="bi bi-eye me-1"></i>
                                                {featuredPost.views || 0} views
                                            </div>
                                            <Link
                                                to={`/blog/${featuredPost.slug}`}
                                                className="btn btn-primary"
                                            >
                                                Read More <i className="bi bi-arrow-right ms-1"></i>
                                            </Link>
                                        </div>
                                    </Card.Body>
                                </Col>
                            </Row>
                        </Card>
                    </Container>
                </section>
            )}

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
                                    placeholder="Search blog posts..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                        <Col md={4}>
                            <Form.Select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                {categories.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </Form.Select>
                        </Col>
                        <Col md={1}>
                            <Button
                                variant="outline-secondary"
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedCategory('all');
                                }}
                                title="Clear filters"
                            >
                                <i className="bi bi-x-lg"></i>
                            </Button>
                        </Col>
                    </Row>
                    <div className="mt-2 text-muted">
                        <small>Showing {filteredPosts.length} of {posts.length} posts</small>
                    </div>
                </Container>
            </section>

            <section className="blog-grid py-5">
                <Container>
                    {currentPosts.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="bi bi-inbox display-1 text-muted"></i>
                            <h3 className="mt-3">No posts found</h3>
                            <p className="text-muted">Try adjusting your filters or search term</p>
                            <Button
                                variant="primary"
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedCategory('all');
                                }}
                            >
                                Clear Filters
                            </Button>
                        </div>
                    ) : (
                        <>
                            <Row className="g-4">
                                {currentPosts.map((post) => (
                                    <Col key={post._id} lg={4} md={6}>
                                        <Card className="blog-card h-100 shadow-sm">
                                            <div className="blog-image-wrapper">
                                                {post.featuredImage ? (
                                                    <Card.Img
                                                        variant="top"
                                                        src={post.featuredImage}
                                                        alt={post.title}
                                                        className="blog-image"
                                                    />
                                                ) : (
                                                    <div className="blog-image-placeholder bg-primary text-white d-flex align-items-center justify-content-center">
                                                        <i className="bi bi-newspaper display-4"></i>
                                                    </div>
                                                )}
                                            </div>
                                            <Card.Body className="d-flex flex-column">
                                                <div className="blog-meta mb-2">
                                                    <Badge bg="light" text="dark">{post.category}</Badge>
                                                    <small className="text-muted ms-2">
                                                        <i className="bi bi-calendar me-1"></i>
                                                        {formatDate(post.publishedAt)}
                                                    </small>
                                                </div>
                                                <Card.Title className="h5 mb-2">
                                                    <Link
                                                        to={`/blog/${post.slug}`}
                                                        className="text-decoration-none text-dark"
                                                    >
                                                        {post.title}
                                                    </Link>
                                                </Card.Title>
                                                <Card.Text className="text-muted flex-grow-1">
                                                    {post.excerpt?.substring(0, 120)}
                                                    {post.excerpt?.length > 120 ? '...' : ''}
                                                </Card.Text>
                                                {post.tags && post.tags.length > 0 && (
                                                    <div className="tags mb-3">
                                                        {post.tags.slice(0, 3).map((tag, index) => (
                                                            <Badge key={index} bg="light" text="dark" className="me-1">
                                                                #{tag}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <small className="text-muted">
                                                        <i className="bi bi-eye me-1"></i>
                                                        {post.views || 0} views
                                                    </small>
                                                    <Link
                                                        to={`/blog/${post.slug}`}
                                                        className="btn btn-sm btn-outline-primary"
                                                    >
                                                        Read More
                                                    </Link>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="d-flex justify-content-center mt-5">
                                    <Pagination>
                                        <Pagination.Prev
                                            onClick={() => paginate(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        />
                                        {[...Array(totalPages)].map((_, index) => (
                                            <Pagination.Item
                                                key={index + 1}
                                                active={index + 1 === currentPage}
                                                onClick={() => paginate(index + 1)}
                                            >
                                                {index + 1}
                                            </Pagination.Item>
                                        ))}
                                        <Pagination.Next
                                            onClick={() => paginate(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                        />
                                    </Pagination>
                                </div>
                            )}
                        </>
                    )}
                </Container>
            </section>
        </div>
    );
}

export default Blog;
