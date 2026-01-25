import { useState, useEffect, useRef } from 'react';
import { Form, InputGroup, ListGroup, Spinner } from 'react-bootstrap';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { searchAPI } from '../services/api';
import './SearchBar.css';

function SearchBar({ placeholder = 'Search modules, courses...', onSearch, autoFocus = false }) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [popularSearches, setPopularSearches] = useState([]);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Load popular searches
        loadPopularSearches();

        // Click outside to close suggestions
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        // Debounce search suggestions
        const timer = setTimeout(() => {
            if (query.length >= 2) {
                loadSuggestions();
            } else {
                setSuggestions([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const loadPopularSearches = async () => {
        try {
            const response = await searchAPI.getPopular(5);
            if (response.data.success) {
                setPopularSearches(response.data.data || []);
            }
        } catch (error) {
            console.error('Failed to load popular searches:', error);
            // Fallback to default popular searches
            setPopularSearches(['Mobile Phone', 'M-Pesa', 'Email', 'Business', 'Marketing']);
        }
    };

    const loadSuggestions = async () => {
        try {
            setLoading(true);
            const response = await searchAPI.getSuggestions(query, 'modules', 5);
            if (response.data.success) {
                setSuggestions(response.data.data || []);
            }
        } catch (error) {
            console.error('Failed to load suggestions:', error);
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (searchQuery = query) => {
        if (searchQuery.trim()) {
            setShowSuggestions(false);
            if (onSearch) {
                onSearch(searchQuery);
            } else {
                navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleSearch();
    };

    const handleSuggestionClick = (suggestion) => {
        setQuery(suggestion.title);
        handleSearch(suggestion.title);
    };

    const handleClear = () => {
        setQuery('');
        setSuggestions([]);
        setShowSuggestions(false);
    };

    return (
        <div className="search-bar-container" ref={searchRef}>
            <Form onSubmit={handleSubmit}>
                <InputGroup>
                    <InputGroup.Text>
                        <FaSearch />
                    </InputGroup.Text>
                    <Form.Control
                        type="text"
                        placeholder={placeholder}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setShowSuggestions(true)}
                        autoFocus={autoFocus}
                    />
                    {query && (
                        <InputGroup.Text
                            onClick={handleClear}
                            style={{ cursor: 'pointer' }}
                            title="Clear search"
                        >
                            <FaTimes />
                        </InputGroup.Text>
                    )}
                </InputGroup>
            </Form>

            {showSuggestions && (
                <div className="search-suggestions">
                    <ListGroup>
                        {loading && (
                            <ListGroup.Item className="text-center">
                                <Spinner animation="border" size="sm" />
                                <span className="ms-2">Loading...</span>
                            </ListGroup.Item>
                        )}

                        {!loading && suggestions.length > 0 && (
                            <>
                                <ListGroup.Item variant="secondary" className="small fw-bold">
                                    Suggestions
                                </ListGroup.Item>
                                {suggestions.map((suggestion, index) => (
                                    <ListGroup.Item
                                        key={index}
                                        action
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className="d-flex justify-content-between align-items-center"
                                    >
                                        <div>
                                            <FaSearch className="me-2 text-muted" size={12} />
                                            {suggestion.title}
                                        </div>
                                        {suggestion.category && (
                                            <small className="text-muted">{suggestion.category}</small>
                                        )}
                                    </ListGroup.Item>
                                ))}
                            </>
                        )}

                        {!loading && query.length < 2 && popularSearches.length > 0 && (
                            <>
                                <ListGroup.Item variant="secondary" className="small fw-bold">
                                    Popular Searches
                                </ListGroup.Item>
                                {popularSearches.map((search, index) => (
                                    <ListGroup.Item
                                        key={index}
                                        action
                                        onClick={() => handleSearch(search)}
                                    >
                                        <FaSearch className="me-2 text-muted" size={12} />
                                        {search}
                                    </ListGroup.Item>
                                ))}
                            </>
                        )}

                        {!loading && query.length >= 2 && suggestions.length === 0 && (
                            <ListGroup.Item className="text-muted text-center">
                                No suggestions found
                            </ListGroup.Item>
                        )}
                    </ListGroup>
                </div>
            )}
        </div>
    );
}

export default SearchBar;
