import { useState, useEffect, useRef } from 'react';
import { Spinner } from 'react-bootstrap';

function AIImage({
    prompt,
    category,
    alt,
    className = '',
    fallbackSrc,
    width,
    height,
    priority = false,
    contentId,
    contentType = 'module'
}) {
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [cached, setCached] = useState(false);
    const imgRef = useRef(null);
    const observerRef = useRef(null);

    // Generate fallback image URL based on category - featuring Black/African people
    const getFallbackImage = (cat) => {
        const fallbacks = {
            'basic_digital': 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800', // African woman with laptop
            'business_automation': 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800', // African business meeting
            'digital_marketing': 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800', // African marketing team
            'financial_management': 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800', // African financial discussion
            'e_commerce': 'https://images.unsplash.com/photo-1556761175-129418cb2dfe?w=800', // African e-commerce work
            'hero': 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=1200', // African students learning
            'default': 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800' // African professional
        };
        return fallbackSrc || fallbacks[cat] || fallbacks.default;
    };

    // Load image from API
    const loadImage = async () => {
        if (!prompt || !category) {
            setImageUrl(getFallbackImage(category));
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(false);

            const token = localStorage.getItem('token') || localStorage.getItem('authToken');
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001/api/v1';

            const params = new URLSearchParams({
                prompt,
                category,
                contentType
            });

            if (contentId) {
                params.append('contentId', contentId);
            }

            const response = await fetch(`${apiUrl}/images/generate?${params}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            if (data.success && data.data?.url) {
                setImageUrl(data.data.url);
                setCached(data.data.cached || false);
            } else {
                throw new Error('No image URL returned');
            }

        } catch (err) {
            console.warn('Failed to load AI image:', err.message);
            setError(true);
            setImageUrl(getFallbackImage(category));
        } finally {
            setLoading(false);
        }
    };

    // Intersection Observer for lazy loading
    useEffect(() => {
        if (priority) {
            // Load immediately if priority
            loadImage();
            return;
        }

        // Set up intersection observer for lazy loading
        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        loadImage();
                        observerRef.current?.unobserve(entry.target);
                    }
                });
            },
            {
                rootMargin: '50px' // Start loading 50px before entering viewport
            }
        );

        if (imgRef.current) {
            observerRef.current.observe(imgRef.current);
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [prompt, category, contentId, priority]);

    // Handle image load success
    const handleImageLoad = () => {
        setLoading(false);
        setError(false);
    };

    // Handle image load error
    const handleImageError = () => {
        console.warn('Image failed to load, using fallback');
        setError(true);
        setImageUrl(getFallbackImage(category));
        setLoading(false);
    };

    // Loading skeleton component
    const LoadingSkeleton = () => (
        <div
            className={`d-flex align-items-center justify-content-center bg-light ${className}`}
            style={{
                width: width || '100%',
                height: height || '200px',
                minHeight: '150px'
            }}
        >
            <div className="text-center">
                <Spinner animation="border" variant="primary" size="sm" />
                <div className="mt-2 small text-muted">Loading image...</div>
            </div>
        </div>
    );

    // Error placeholder component
    const ErrorPlaceholder = () => (
        <div
            className={`d-flex align-items-center justify-content-center bg-light border ${className}`}
            style={{
                width: width || '100%',
                height: height || '200px',
                minHeight: '150px'
            }}
        >
            <div className="text-center text-muted">
                <div className="fs-1 mb-2">🖼️</div>
                <div className="small">Image unavailable</div>
            </div>
        </div>
    );

    // Show loading skeleton while loading and no image URL yet
    if (loading && !imageUrl) {
        return <LoadingSkeleton />;
    }

    // Show error placeholder if error and no fallback loaded
    if (error && !imageUrl) {
        return <ErrorPlaceholder />;
    }

    return (
        <div className="position-relative">
            <img
                ref={imgRef}
                src={imageUrl}
                alt={alt || `${category} related image`}
                className={`${className} ${loading ? 'opacity-50' : ''}`}
                style={{
                    width: width || '100%',
                    height: height || 'auto',
                    objectFit: 'cover',
                    transition: 'opacity 0.3s ease'
                }}
                onLoad={handleImageLoad}
                onError={handleImageError}
                loading={priority ? 'eager' : 'lazy'}
            />

            {/* Loading overlay */}
            {loading && imageUrl && (
                <div
                    className="position-absolute top-50 start-50 translate-middle"
                    style={{ zIndex: 1 }}
                >
                    <Spinner animation="border" variant="light" size="sm" />
                </div>
            )}

            {/* Cache indicator (only in development) */}
            {process.env.NODE_ENV === 'development' && cached && (
                <div
                    className="position-absolute top-0 end-0 bg-success text-white px-2 py-1 small"
                    style={{ fontSize: '0.7rem', zIndex: 2 }}
                >
                    Cached
                </div>
            )}
        </div>
    );
}

export default AIImage;