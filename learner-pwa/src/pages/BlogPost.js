import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import api from '../services/api';
import './BlogPost.css';

function BlogPost() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [relatedPosts, setRelatedPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPost();
    }, [slug]);

    const fetchPost = async () => {
        try {
            setLoading(true);

            // Fetch blog post
            const postResponse = await api.get(`/blog/${slug}`);
            setPost(postResponse.data.post);

            // Increment view count
            await api.post(`/blog/${slug}/view`).catch(err => {
                console.warn('Failed to increment view count:', err);
            });

            // Fetch related posts
            if (postResponse.data.relatedPosts) {
                setRelatedPosts(postResponse.data.relatedPosts);
            }

            setError(null);
        } catch (err) {
            console.error('Error fetching blog post:', err);
            setError('Failed to load blog post. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleShare = (platform) => {
        const url = window.location.href;
        const title = post?.title || '';

        let shareUrl = '';
        switch (platform) {
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
                break;
            default:
                return;
        }

        window.open(shareUrl, '_blank', 'width=600,height=400');
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Loading blog post...</p>
            </Container>
        );
    }

    if (error || !post) {
        return (
            <Container className="py-5">
                <Alert variant="danger">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error || 'Blog post not found'}
                </Alert>
                <Button variant="primary" onClick={() => navigate('/blog')}>
                    <i className="bi bi-arrow-left me-2"></i>
                    Back to Blog
                </Button>
            </Container>
        );
    }

    return (
        <div className="blog-post-page">
            {/* Breadcrumb */}
            <section className="breadcrumb-section bg-light py-3">
                <Container>
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                            <li className="breadcrumb-item"><Link to="/blog">Blog</Link></li>
                            <li className="breadcrumb-item active" aria-current="page">{post.title}</li>
                        </ol>
                    </nav>
                </Container>
            </section>

            {/* Post Header */}
            <section className="post-header py-5">
                <Container>
                    <Row className="justify-content-center">
                        <Col lg={8}>
                            <div className="mb-3">
                                <Badge bg="primary" className="me-2">{post.category}</Badge>
                                <span className="text-muted">
                                    <i className="bi bi-calendar me-1"></i>
                                    {formatDate(post.publishedAt)}
                                </span>
                                <span className="text-muted ms-3">
                                    <i className="bi bi-eye me-1"></i>
                                    {post.views || 0} views
                                </span>
                            </div>
                            <h1 className="display-4 fw-bold mb-4">{post.title}</h1>

                            {/* Author Info */}
                            {post.author && (
                                <div className="author-info d-flex align-items-center mb-4">
                                    <div className="author-avatar me-3">
                                        {post.author.profilePhoto ? (
                                            <img
                                                src={post.author.profilePhoto}
                                                alt={post.author.name}
                                                className="rounded-circle"
                                                width="50"
                                                height="50"
                                            />
                                        ) : (
                                            <div className="avatar-placeholder rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                                                <i className="bi bi-person"></i>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="fw-bold">{post.author.name}</div>
                                        <small className="text-muted">{post.author.role || 'Author'}</small>
                                    </div>
                                </div>
                            )}

                            {/* Featured Image */}
                            {post.featuredImage && (
                                <div className="featured-image-container mb-4">
                                    <img
                                        src={post.featuredImage}
                                        alt={post.title}
                                        className="img-fluid rounded"
                                    />
                                </div>
                            )}
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Post Content */}
            <section className="post-content py-4">
                <Container>
                    <Row className="justify-content-center">
                        <Col lg={8}>
                            <div className="content-body" dangerouslySetInnerHTML={{ __html: post.content }} />

                            {/* Tags */}
                            {post.tags && post.tags.length > 0 && (
                                <div className="tags-section mt-5 pt-4 border-top">
                                    <h5 className="mb-3">Tags</h5>
                                    <div className="tags">
                                        {post.tags.map((tag, index) => (
                                            <Badge key={index} bg="light" text="dark" className="me-2 mb-2 p-2">
                                                #{tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Share Buttons */}
                            <div className="share-section mt-4 pt-4 border-top">
                                <h5 className="mb-3">Share this post</h5>
                                <div className="share-buttons d-flex gap-2">
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => handleShare('twitter')}
                                    >
                                        <i className="bi bi-twitter me-1"></i>
                                        Twitter
                                    </Button>
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => handleShare('facebook')}
                                    >
                                        <i className="bi bi-facebook me-1"></i>
                                        Facebook
                                    </Button>
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => handleShare('linkedin')}
                                    >
                                        <i className="bi bi-linkedin me-1"></i>
                                        LinkedIn
                                    </Button>
                                </div>
                            </div>

                            {/* Author Bio */}
                            {post.author && post.author.bio && (
                                <Card className="author-bio-card mt-5">
                                    <Card.Body>
                                        <h5 className="mb-3">About the Author</h5>
                                        <div className="d-flex">
                                            <div className="author-avatar-large me-3">
                                                {post.author.profilePhoto ? (
                                                    <img
                                                        src={post.author.profilePhoto}
                                                        alt={post.author.name}
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
                                                <h6 className="mb-1">{post.author.name}</h6>
                                                <p className="text-muted small mb-2">{post.author.role || 'Author'}</p>
                                                <p className="mb-0">{post.author.bio}</p>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            )}
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
                <section className="related-posts py-5 bg-light">
                    <Container>
                        <h3 className="mb-4">Related Posts</h3>
                        <Row className="g-4">
                            {relatedPosts.map((relatedPost) => (
                                <Col key={relatedPost._id} lg={4} md={6}>
                                    <Card className="related-post-card h-100 shadow-sm">
                                        <div className="related-post-image-wrapper">
                                            {relatedPost.featuredImage ? (
                                                <Card.Img
                                                    variant="top"
                                                    src={relatedPost.featuredImage}
                                                    alt={relatedPost.title}
                                                    className="related-post-image"
                                                />
                                            ) : (
                                                <div className="related-post-image-placeholder bg-primary text-white d-flex align-items-center justify-content-center">
                                                    <i className="bi bi-newspaper display-4"></i>
                                                </div>
                                            )}
                                        </div>
                                        <Card.Body>
                                            <Badge bg="light" text="dark" className="mb-2">{relatedPost.category}</Badge>
                                            <Card.Title className="h6">
                                                <Link
                                                    to={`/blog/${relatedPost.slug}`}
                                                    className="text-decoration-none text-dark"
                                                >
                                                    {relatedPost.title}
                                                </Link>
                                            </Card.Title>
                                            <Card.Text className="text-muted small">
                                                {relatedPost.excerpt?.substring(0, 100)}
                                                {relatedPost.excerpt?.length > 100 ? '...' : ''}
                                            </Card.Text>
                                            <small className="text-muted">
                                                <i className="bi bi-calendar me-1"></i>
                                                {formatDate(relatedPost.publishedAt)}
                                            </small>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Container>
                </section>
            )}

            {/* Back to Blog Button */}
            <section className="py-4">
                <Container>
                    <Row className="justify-content-center">
                        <Col lg={8}>
                            <Button
                                variant="outline-primary"
                                onClick={() => navigate('/blog')}
                            >
                                <i className="bi bi-arrow-left me-2"></i>
                                Back to Blog
                            </Button>
                        </Col>
                    </Row>
                </Container>
            </section>
        </div>
    );
}

export default BlogPost;
