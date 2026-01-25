import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Badge, Spinner, Alert, Pagination } from 'react-bootstrap';
import { FaSearch, FaFilter, FaTimes, FaBook, FaClock, FaStar } from 'react-icons/fa';
import SearchBar from '../components/SearchBar';
import { searchAPI } from '../services/api';

function SearchResults() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState(null);
    const [filters, setFilters] = useState({
        category: searchParams.get('category') || '',
        difficulty: searchParams.get('difficulty') || '',
        sortBy: searchParams.get('sortBy') || 'relevance'
    });
    const [showFilters, setShowFilters] = useState(false);
    const [availableFilters, setAvailableFilters] = useState(null);

    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page')) || 1;

    useEffect(() => {
        loadFilters();
    }, []);

    useEffect(() => {
        if (query) {
            performSearch();
        }
    }, [query, page, filters]);

    const loadFilters = async () => {
        try {
            const response = await searchAPI.getFilters();
            if (response.data.success) {
                setAvailableFilters(response.data.data);
            }
        } catch (error) {
            console.error('Failed to load filters:', error);
        }
    };

    const performSearch = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await searchAPI.searchModules(query, {
                ...filters,
                page,
                limit: 12
            });

            if (response.data.success) {
                setResults(response.data.data || []);
                setPagination(response.data.pagination);
            }
        } catch (err) {
            console.error('Search error:', err);
            if (err.response?.status === 404) {
                setResults([]);
                setPagination(null);
            } else {
                setError(err.response?.data?.message || 'Failed to perform search. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (newQuery) => {
        setSearchParams({ q: newQuery, page: 1 });
    };

    const handleFilterChange = (filterName, value) => {
        const newFilters = { ...filters, [filterName]: value };
        setFilters(newFilters);

        // Update URL
        const params = { q: query, page: 1 };
        if (value) params[filterName] = value;
        setSearchParams(params);
    };

    const clearFilters = () => {
        setFilters({
            category: '',
            difficulty: '',
            sortBy: 'relevance'
        });
        setSearchParams({ q: query, page: 1 });
    };

    const handlePageChange = (newPage) => {
        setSearchParams({ q: query, page: newPage, ...filters });
        window.scrollTo(0, 0);
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'beginner': return 'success';
            case 'intermediate': return 'warning';
            case 'advanced': return 'danger';
            default: return 'secondary';
        }
    };

    return (
        <Container className="py-4">
            {/* Search Bar */}
            <Row className="mb-4">
                <Col>
                    <SearchBar
                        placeholder="Search modules, courses..."
                        onSearch={handleSearch}
                        autoFocus
                    />
                </Col>
            </Row>

            {/* Results Header */}
            {query && (
                <Row className="mb-3">
                    <Col>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h4 className="mb-1">
                                    Search Results for "{query}"
                                </h4>
                                {pagination && (
                                    <p className="text-muted mb-0">
                                        Found {pagination.total} result{pagination.total !== 1 ? 's' : ''}
                                    </p>
                                )}
                            </div>
                            <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <FaFilter className="me-2" />
                                {showFilters ? 'Hide' : 'Show'} Filters
                            </Button>
                        </div>
                    </Col>
                </Row>
            )}

            <Row>
                {/* Filters Sidebar */}
                {showFilters && (
                    <Col md={3} className="mb-4">
                        <Card>
                            <Card.Header className="d-flex justify-content-between align-items-center">
                                <strong>Filters</strong>
                                <Button
                                    variant="link"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="text-decoration-none p-0"
                                >
                                    Clear All
                                </Button>
                            </Card.Header>
                            <Card.Body>
                                {/* Sort By */}
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">Sort By</Form.Label>
                                    <Form.Select
                                        size="sm"
                                        value={filters.sortBy}
                                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                    >
                                        <option value="relevance">Relevance</option>
                                        <option value="title">Title (A-Z)</option>
                                        <option value="newest">Newest First</option>
                                        <option value="popular">Most Popular</option>
                                        <option value="duration">Duration</option>
                                    </Form.Select>
                                </Form.Group>

                                {/* Category */}
                                {availableFilters?.categories && (
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold">Category</Form.Label>
                                        <Form.Select
                                            size="sm"
                                            value={filters.category}
                                            onChange={(e) => handleFilterChange('category', e.target.value)}
                                        >
                                            <option value="">All Categories</option>
                                            {availableFilters.categories.map((cat) => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                )}

                                {/* Difficulty */}
                                {availableFilters?.difficulties && (
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold">Difficulty</Form.Label>
                                        <Form.Select
                                            size="sm"
                                            value={filters.difficulty}
                                            onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                                        >
                                            <option value="">All Levels</option>
                                            {availableFilters.difficulties.map((diff) => (
                                                <option key={diff} value={diff}>{diff}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                )}

                                {/* Active Filters */}
                                {(filters.category || filters.difficulty) && (
                                    <div className="mt-3 pt-3 border-top">
                                        <p className="small fw-bold mb-2">Active Filters:</p>
                                        {filters.category && (
                                            <Badge bg="primary" className="me-2 mb-2">
                                                {filters.category}
                                                <FaTimes
                                                    className="ms-1"
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => handleFilterChange('category', '')}
                                                />
                                            </Badge>
                                        )}
                                        {filters.difficulty && (
                                            <Badge bg="primary" className="me-2 mb-2">
                                                {filters.difficulty}
                                                <FaTimes
                                                    className="ms-1"
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => handleFilterChange('difficulty', '')}
                                                />
                                            </Badge>
                                        )}
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                )}

                {/* Results */}
                <Col md={showFilters ? 9 : 12}>
                    {error && (
                        <Alert variant="danger" dismissible onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    )}

                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-3 text-muted">Searching...</p>
                        </div>
                    ) : results.length === 0 && query ? (
                        <Card className="text-center py-5">
                            <Card.Body>
                                <FaSearch size={50} className="text-muted mb-3" />
                                <h4>No Results Found</h4>
                                <p className="text-muted">
                                    Try adjusting your search or filters
                                </p>
                                <Button variant="primary" onClick={clearFilters}>
                                    Clear Filters
                                </Button>
                            </Card.Body>
                        </Card>
                    ) : (
                        <>
                            <Row>
                                {results.map((module) => (
                                    <Col key={module._id} md={showFilters ? 6 : 4} lg={showFilters ? 4 : 3} className="mb-4">
                                        <Card className="h-100 shadow-sm hover-shadow">
                                            <Card.Body>
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <Badge bg={getDifficultyColor(module.difficulty)}>
                                                        {module.difficulty || 'N/A'}
                                                    </Badge>
                                                    {module.duration && (
                                                        <small className="text-muted">
                                                            <FaClock className="me-1" />
                                                            {module.duration}h
                                                        </small>
                                                    )}
                                                </div>

                                                <h5 className="mb-2">{module.title}</h5>

                                                <p className="text-muted small mb-3" style={{
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical'
                                                }}>
                                                    {module.description}
                                                </p>

                                                <div className="d-flex justify-content-between align-items-center">
                                                    <small className="text-muted">
                                                        <FaBook className="me-1" />
                                                        {module.category}
                                                    </small>
                                                    {module.rating && (
                                                        <small className="text-warning">
                                                            <FaStar className="me-1" />
                                                            {module.rating}
                                                        </small>
                                                    )}
                                                </div>
                                            </Card.Body>
                                            <Card.Footer className="bg-white border-top-0">
                                                <Link
                                                    to={`/learning/${module._id}`}
                                                    className="btn btn-primary btn-sm w-100"
                                                >
                                                    View Module
                                                </Link>
                                            </Card.Footer>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>

                            {/* Pagination */}
                            {pagination && pagination.pages > 1 && (
                                <div className="d-flex justify-content-center mt-4">
                                    <Pagination>
                                        <Pagination.First
                                            onClick={() => handlePageChange(1)}
                                            disabled={pagination.page === 1}
                                        />
                                        <Pagination.Prev
                                            onClick={() => handlePageChange(pagination.page - 1)}
                                            disabled={pagination.page === 1}
                                        />

                                        {[...Array(pagination.pages)].map((_, index) => {
                                            const pageNum = index + 1;
                                            if (
                                                pageNum === 1 ||
                                                pageNum === pagination.pages ||
                                                (pageNum >= pagination.page - 2 && pageNum <= pagination.page + 2)
                                            ) {
                                                return (
                                                    <Pagination.Item
                                                        key={pageNum}
                                                        active={pageNum === pagination.page}
                                                        onClick={() => handlePageChange(pageNum)}
                                                    >
                                                        {pageNum}
                                                    </Pagination.Item>
                                                );
                                            } else if (
                                                pageNum === pagination.page - 3 ||
                                                pageNum === pagination.page + 3
                                            ) {
                                                return <Pagination.Ellipsis key={pageNum} disabled />;
                                            }
                                            return null;
                                        })}

                                        <Pagination.Next
                                            onClick={() => handlePageChange(pagination.page + 1)}
                                            disabled={pagination.page === pagination.pages}
                                        />
                                        <Pagination.Last
                                            onClick={() => handlePageChange(pagination.pages)}
                                            disabled={pagination.page === pagination.pages}
                                        />
                                    </Pagination>
                                </div>
                            )}
                        </>
                    )}
                </Col>
            </Row>
        </Container>
    );
}

export default SearchResults;
