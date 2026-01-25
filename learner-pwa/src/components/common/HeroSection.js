import { useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import AIImage from './AIImage';

function HeroSection({
    title,
    subtitle,
    imagePrompt,
    category = 'hero',
    overlay = true,
    height = '400px',
    className = '',
    children,
    ctaButton,
    contentId
}) {
    const [imageLoaded, setImageLoaded] = useState(false);

    // Generate a unique content ID for caching
    const heroContentId = contentId || `hero-${category}-${title?.toLowerCase().replace(/\s+/g, '-')}`;

    // Default gradient background
    const gradientBackground = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

    return (
        <div
            className={`position-relative overflow-hidden ${className}`}
            style={{ height, minHeight: '300px' }}
        >
            {/* Background Image */}
            <div className="position-absolute top-0 start-0 w-100 h-100">
                {imagePrompt ? (
                    <AIImage
                        prompt={imagePrompt}
                        category={category}
                        alt={`${title} hero image`}
                        className="w-100 h-100"
                        style={{ objectFit: 'cover' }}
                        priority={true}
                        contentId={heroContentId}
                        contentType="hero"
                        onLoad={() => setImageLoaded(true)}
                    />
                ) : (
                    <div
                        className="w-100 h-100"
                        style={{ background: gradientBackground }}
                    />
                )}
            </div>

            {/* Overlay */}
            {overlay && (
                <div
                    className="position-absolute top-0 start-0 w-100 h-100"
                    style={{
                        background: imageLoaded
                            ? 'linear-gradient(45deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 100%)'
                            : 'rgba(0,0,0,0.4)',
                        zIndex: 1
                    }}
                />
            )}

            {/* Content */}
            <Container className="position-relative h-100" style={{ zIndex: 2 }}>
                <Row className="h-100 align-items-center">
                    <Col lg={8} xl={7}>
                        <div className="text-white">
                            {title && (
                                <h1
                                    className="display-4 fw-bold mb-4"
                                    style={{
                                        textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                                        lineHeight: '1.2'
                                    }}
                                >
                                    {title}
                                </h1>
                            )}

                            {subtitle && (
                                <p
                                    className="lead mb-4"
                                    style={{
                                        textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                                        fontSize: '1.25rem',
                                        lineHeight: '1.5'
                                    }}
                                >
                                    {subtitle}
                                </p>
                            )}

                            {ctaButton && (
                                <div className="mt-4">
                                    {ctaButton}
                                </div>
                            )}

                            {children && (
                                <div className="mt-4">
                                    {children}
                                </div>
                            )}
                        </div>
                    </Col>
                </Row>
            </Container>

            {/* Loading indicator for background image */}
            {imagePrompt && !imageLoaded && (
                <div
                    className="position-absolute top-50 start-50 translate-middle text-white"
                    style={{ zIndex: 3 }}
                >
                    <div className="text-center">
                        <div className="spinner-border spinner-border-sm mb-2" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <div className="small">Loading hero image...</div>
                    </div>
                </div>
            )}

            {/* Decorative elements */}
            <div
                className="position-absolute"
                style={{
                    top: '20%',
                    right: '10%',
                    width: '100px',
                    height: '100px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%',
                    zIndex: 1
                }}
            />
            <div
                className="position-absolute"
                style={{
                    bottom: '30%',
                    right: '5%',
                    width: '60px',
                    height: '60px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '50%',
                    zIndex: 1
                }}
            />
        </div>
    );
}

// Preset hero sections for common use cases
export const WelcomeHero = ({ userName }) => (
    <HeroSection
        title={`Welcome back${userName ? `, ${userName}` : ''}!`}
        subtitle="Continue your digital skills journey and unlock new opportunities"
        imagePrompt="digital learning success celebration achievement"
        category="hero"
        height="350px"
    />
);

export const CategoryHero = ({ categoryName, description, imagePrompt }) => (
    <HeroSection
        title={categoryName}
        subtitle={description}
        imagePrompt={imagePrompt}
        category="category"
        height="300px"
    />
);

export const CourseHero = ({ courseTitle, courseDescription, category }) => (
    <HeroSection
        title={courseTitle}
        subtitle={courseDescription}
        imagePrompt={`${courseTitle} ${category} learning course education`}
        category={category}
        height="250px"
    />
);

export default HeroSection;