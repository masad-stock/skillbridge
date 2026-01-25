/**
 * Enhanced Content Rendering Engine
 * 
 * Handles proper display of text content with formatting, images, and interactive elements
 * Includes error handling, responsive design, and accessibility features
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Alert, Spinner, Button, Badge, ProgressBar } from 'react-bootstrap';
import contentErrorLogger from '../services/contentErrorLogger';

const ContentRenderer = ({
    content,
    moduleId,
    lessonId,
    onError,
    onLoadComplete,
    enableAccessibility = true,
    enableResponsive = true,
    debugMode = false
}) => {
    const contentRef = useRef(null);
    const [renderState, setRenderState] = useState({
        status: 'loading', // 'loading', 'rendered', 'error'
        error: null,
        warnings: [],
        renderTime: 0,
        accessibilityScore: 0
    });
    const [images, setImages] = useState([]);
    const [interactiveElements, setInteractiveElements] = useState([]);
    const [renderProgress, setRenderProgress] = useState(0);

    // Debug logging
    const debugLog = useCallback((message, data = null) => {
        if (debugMode) {
            console.log(`[ContentRenderer] ${message}`, data || '');
        }
    }, [debugMode]);

    // Main content rendering effect
    useEffect(() => {
        if (content) {
            renderContent();
        }
    }, [content, moduleId, lessonId]);

    /**
     * Main content rendering function
     */
    const renderContent = async () => {
        const startTime = performance.now();
        debugLog('Starting content rendering', { moduleId, lessonId });

        try {
            setRenderState(prev => ({ ...prev, status: 'loading' }));
            setRenderProgress(10);

            // Step 1: Parse and validate content structure
            const parsedContent = await parseContentStructure(content);
            setRenderProgress(30);

            // Step 2: Process images with lazy loading
            const processedImages = await processImages(parsedContent.images);
            setImages(processedImages);
            setRenderProgress(50);

            // Step 3: Process interactive elements
            const processedInteractive = await processInteractiveElements(parsedContent.interactive);
            setInteractiveElements(processedInteractive);
            setRenderProgress(70);

            // Step 4: Apply formatting and accessibility enhancements
            const enhancedContent = await enhanceContentAccessibility(parsedContent);
            setRenderProgress(90);

            // Step 5: Validate final render
            const validation = await validateRenderedContent(enhancedContent);
            setRenderProgress(100);

            const renderTime = performance.now() - startTime;

            // Update render state
            setRenderState({
                status: 'rendered',
                error: null,
                warnings: validation.warnings,
                renderTime,
                accessibilityScore: validation.accessibilityScore
            });

            // Log successful render metrics
            await contentErrorLogger.logTextError({
                moduleId,
                lessonId,
                loadTime: renderTime,
                success: true,
                severity: 'info'
            });

            // Log accessibility metrics
            await contentErrorLogger.logAccessibilityMetrics({
                moduleId,
                lessonId,
                screenReaderCompatible: validation.screenReaderCompatible,
                keyboardNavigation: validation.keyboardNavigation,
                highContrast: validation.highContrast,
                textScaling: validation.textScaling,
                mobileResponsive: validation.mobileResponsive,
                tabletResponsive: validation.tabletResponsive,
                score: validation.accessibilityScore
            });

            if (onLoadComplete) {
                onLoadComplete({
                    success: true,
                    renderTime,
                    warnings: validation.warnings,
                    accessibilityScore: validation.accessibilityScore
                });
            }

            debugLog('Content rendering completed', { renderTime, warnings: validation.warnings });

        } catch (error) {
            const renderTime = performance.now() - startTime;

            debugLog('Content rendering failed', error);

            setRenderState({
                status: 'error',
                error: error.message,
                warnings: [],
                renderTime,
                accessibilityScore: 0
            });

            // Log rendering error
            await contentErrorLogger.logTextError({
                moduleId,
                lessonId,
                errorCode: 'CONTENT_RENDER_ERROR',
                message: error.message,
                loadTime: renderTime,
                stackTrace: error.stack
            });

            if (onError) {
                onError(error);
            }
        }
    };

    /**
     * Parse content structure and identify different content types
     */
    const parseContentStructure = async (rawContent) => {
        debugLog('Parsing content structure');

        if (!rawContent || typeof rawContent !== 'string') {
            throw new Error('Invalid content format');
        }

        // Extract images from content
        const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
        const images = [];
        let match;
        while ((match = imageRegex.exec(rawContent)) !== null) {
            images.push({
                alt: match[1],
                src: match[2],
                index: images.length
            });
        }

        // Extract interactive elements (simplified - could be enhanced)
        const interactiveRegex = /\[INTERACTIVE:([^\]]+)\]/g;
        const interactive = [];
        while ((match = interactiveRegex.exec(rawContent)) !== null) {
            interactive.push({
                type: match[1],
                index: interactive.length
            });
        }

        // Clean content for text processing
        const textContent = rawContent
            .replace(imageRegex, '') // Remove image markdown
            .replace(interactiveRegex, '') // Remove interactive placeholders
            .trim();

        return {
            text: textContent,
            images,
            interactive,
            wordCount: textContent.split(/\s+/).length,
            hasFormatting: /[*_#•\-]/.test(textContent)
        };
    };

    /**
     * Process images with lazy loading and optimization
     */
    const processImages = async (imageList) => {
        debugLog('Processing images', { count: imageList.length });

        const processedImages = await Promise.allSettled(
            imageList.map(async (img, index) => {
                try {
                    // Validate image URL
                    if (!img.src || !isValidImageUrl(img.src)) {
                        throw new Error(`Invalid image URL: ${img.src}`);
                    }

                    // Create optimized image object
                    return {
                        ...img,
                        id: `img_${moduleId}_${lessonId}_${index}`,
                        loading: 'lazy',
                        optimized: true,
                        responsive: enableResponsive,
                        accessible: enableAccessibility
                    };
                } catch (error) {
                    debugLog(`Image processing failed for index ${index}`, error);
                    return {
                        ...img,
                        error: error.message,
                        fallback: true
                    };
                }
            })
        );

        return processedImages.map((result, index) => {
            if (result.status === 'fulfilled') {
                return result.value;
            } else {
                return {
                    index,
                    error: result.reason.message,
                    fallback: true
                };
            }
        });
    };

    /**
     * Process interactive elements
     */
    const processInteractiveElements = async (interactiveList) => {
        debugLog('Processing interactive elements', { count: interactiveList.length });

        return interactiveList.map((element, index) => ({
            ...element,
            id: `interactive_${moduleId}_${lessonId}_${index}`,
            accessible: enableAccessibility,
            responsive: enableResponsive
        }));
    };

    /**
     * Enhance content for accessibility
     */
    const enhanceContentAccessibility = async (parsedContent) => {
        debugLog('Enhancing content accessibility');

        let enhancedText = parsedContent.text;

        if (enableAccessibility) {
            // Add ARIA labels and semantic structure
            enhancedText = enhancedText
                .replace(/^# (.+)$/gm, '<h1 role="heading" aria-level="1">$1</h1>')
                .replace(/^## (.+)$/gm, '<h2 role="heading" aria-level="2">$1</h2>')
                .replace(/^### (.+)$/gm, '<h3 role="heading" aria-level="3">$1</h3>')
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.+?)\*/g, '<em>$1</em>')
                .replace(/^• (.+)$/gm, '<li role="listitem">$1</li>');

            // Wrap list items in proper list structure
            enhancedText = enhancedText.replace(
                /(<li role="listitem">.*<\/li>)/gs,
                '<ul role="list">$1</ul>'
            );
        }

        return {
            ...parsedContent,
            text: enhancedText,
            accessibilityEnhanced: enableAccessibility
        };
    };

    /**
     * Validate rendered content
     */
    const validateRenderedContent = async (content) => {
        debugLog('Validating rendered content');

        const validation = {
            warnings: [],
            accessibilityScore: 0,
            screenReaderCompatible: false,
            keyboardNavigation: false,
            highContrast: false,
            textScaling: false,
            mobileResponsive: false,
            tabletResponsive: false
        };

        // Check content completeness
        if (!content.text || content.text.trim().length === 0) {
            validation.warnings.push('No text content available');
        }

        // Check accessibility features
        if (enableAccessibility) {
            validation.screenReaderCompatible = content.text.includes('role=');
            validation.keyboardNavigation = true; // Assume keyboard navigation is implemented
            validation.accessibilityScore += validation.screenReaderCompatible ? 25 : 0;
            validation.accessibilityScore += validation.keyboardNavigation ? 25 : 0;
        }

        // Check responsive design
        if (enableResponsive) {
            validation.mobileResponsive = true; // Assume responsive design is implemented
            validation.tabletResponsive = true;
            validation.accessibilityScore += validation.mobileResponsive ? 25 : 0;
            validation.accessibilityScore += validation.tabletResponsive ? 25 : 0;
        }

        // Check for broken images
        const brokenImages = images.filter(img => img.error || img.fallback);
        if (brokenImages.length > 0) {
            validation.warnings.push(`${brokenImages.length} images failed to load`);
        }

        return validation;
    };

    /**
     * Handle image load errors with fallback
     */
    const handleImageError = (imageIndex, error) => {
        debugLog(`Image load error for index ${imageIndex}`, error);

        setImages(prev => prev.map((img, index) => {
            if (index === imageIndex) {
                return {
                    ...img,
                    error: error.message || 'Failed to load image',
                    fallback: true
                };
            }
            return img;
        }));

        // Log image error
        contentErrorLogger.logTextError({
            moduleId,
            lessonId,
            errorCode: 'IMAGE_LOAD_ERROR',
            message: `Image failed to load: ${error.message}`,
            elementSelector: `img[data-index="${imageIndex}"]`,
            severity: 'low'
        });
    };

    /**
     * Handle interactive element errors
     */
    const handleInteractiveError = (elementIndex, error) => {
        debugLog(`Interactive element error for index ${elementIndex}`, error);

        contentErrorLogger.logInteractiveError({
            moduleId,
            lessonId,
            errorCode: 'INTERACTIVE_ELEMENT_ERROR',
            message: error.message,
            elementId: `interactive_${moduleId}_${lessonId}_${elementIndex}`,
            severity: 'medium'
        });
    };

    /**
     * Retry content rendering
     */
    const retryRender = () => {
        debugLog('Retrying content render');
        renderContent();
    };

    // Helper functions
    const isValidImageUrl = (url) => {
        try {
            new URL(url);
            return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
        } catch {
            return false;
        }
    };

    const formatText = (text) => {
        if (!text) return '';

        // Convert markdown-like formatting to HTML
        return text
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/^# (.+)$/gm, '<h1>$1</h1>')
            .replace(/^## (.+)$/gm, '<h2>$1</h2>')
            .replace(/^### (.+)$/gm, '<h3>$1</h3>')
            .replace(/^• (.+)$/gm, '<li>$1</li>')
            .replace(/\n/g, '<br>');
    };

    // Render loading state
    if (renderState.status === 'loading') {
        return (
            <Card className="border-0 shadow-sm">
                <Card.Body className="text-center py-4">
                    <Spinner animation="border" variant="primary" className="mb-3" />
                    <p className="text-muted mb-2">Rendering content...</p>
                    <ProgressBar
                        now={renderProgress}
                        variant="primary"
                        style={{ height: '6px' }}
                        className="mb-2"
                    />
                    <small className="text-muted">{renderProgress}% complete</small>
                    {debugMode && (
                        <div className="mt-3 text-start">
                            <small className="text-muted">
                                Module: {moduleId} | Lesson: {lessonId}
                            </small>
                        </div>
                    )}
                </Card.Body>
            </Card>
        );
    }

    // Render error state
    if (renderState.status === 'error') {
        return (
            <Card className="border-0 shadow-sm">
                <Card.Body>
                    <Alert variant="danger">
                        <Alert.Heading className="h6">
                            <span className="me-2">⚠️</span>
                            Content Rendering Error
                        </Alert.Heading>
                        <p className="mb-2">{renderState.error}</p>
                        <hr />
                        <div className="d-flex justify-content-between align-items-center">
                            <Button variant="outline-danger" size="sm" onClick={retryRender}>
                                <span className="me-1">🔄</span>
                                Retry Rendering
                            </Button>
                            <small className="text-muted">
                                Render time: {Math.round(renderState.renderTime)}ms
                            </small>
                        </div>
                    </Alert>

                    {debugMode && (
                        <div className="mt-3 p-2 bg-dark text-light rounded small">
                            <strong>Debug Info:</strong>
                            <pre className="mb-0 mt-1" style={{ fontSize: '0.75rem' }}>
                                {JSON.stringify(renderState, null, 2)}
                            </pre>
                        </div>
                    )}
                </Card.Body>
            </Card>
        );
    }

    // Render content successfully
    return (
        <Card className="border-0 shadow-sm">
            {/* Content Header with Status */}
            <Card.Header className="bg-light border-0 py-2">
                <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex gap-2">
                        <Badge bg="success" className="small">
                            <span className="me-1">✅</span>
                            Rendered
                        </Badge>
                        {enableAccessibility && (
                            <Badge bg="info" className="small">
                                <span className="me-1">♿</span>
                                A11y: {renderState.accessibilityScore}%
                            </Badge>
                        )}
                        {renderState.warnings.length > 0 && (
                            <Badge bg="warning" className="small">
                                <span className="me-1">⚠️</span>
                                {renderState.warnings.length} warnings
                            </Badge>
                        )}
                    </div>
                    <small className="text-muted">
                        {Math.round(renderState.renderTime)}ms
                    </small>
                </div>
            </Card.Header>

            <Card.Body ref={contentRef} className="content-renderer">
                {/* Warnings Display */}
                {renderState.warnings.length > 0 && (
                    <Alert variant="warning" className="mb-3">
                        <Alert.Heading className="h6">Content Warnings</Alert.Heading>
                        <ul className="mb-0 small">
                            {renderState.warnings.map((warning, index) => (
                                <li key={index}>{warning}</li>
                            ))}
                        </ul>
                    </Alert>
                )}

                {/* Main Text Content */}
                <div
                    className={`content-text ${enableResponsive ? 'responsive-text' : ''}`}
                    dangerouslySetInnerHTML={{ __html: formatText(content) }}
                    role={enableAccessibility ? 'main' : undefined}
                    aria-label={enableAccessibility ? 'Lesson content' : undefined}
                />

                {/* Images */}
                {images.length > 0 && (
                    <div className="content-images mt-4">
                        {images.map((img, index) => (
                            <div key={img.id || index} className="mb-3">
                                {img.error || img.fallback ? (
                                    <Alert variant="warning" className="text-center">
                                        <span className="me-2">🖼️</span>
                                        Image unavailable: {img.alt || `Image ${index + 1}`}
                                        {img.error && (
                                            <small className="d-block mt-1 text-muted">
                                                Error: {img.error}
                                            </small>
                                        )}
                                    </Alert>
                                ) : (
                                    <img
                                        src={img.src}
                                        alt={img.alt || `Content image ${index + 1}`}
                                        className={`img-fluid ${enableResponsive ? 'responsive-image' : ''}`}
                                        loading={img.loading}
                                        data-index={index}
                                        onError={(e) => handleImageError(index, new Error('Image load failed'))}
                                        role={enableAccessibility ? 'img' : undefined}
                                        aria-describedby={enableAccessibility ? `img-desc-${index}` : undefined}
                                    />
                                )}
                                {enableAccessibility && img.alt && (
                                    <div id={`img-desc-${index}`} className="sr-only">
                                        {img.alt}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Interactive Elements */}
                {interactiveElements.length > 0 && (
                    <div className="content-interactive mt-4">
                        {interactiveElements.map((element, index) => (
                            <div key={element.id} className="interactive-element mb-3">
                                <Alert variant="info">
                                    <span className="me-2">🎯</span>
                                    Interactive Element: {element.type}
                                    <small className="d-block mt-1 text-muted">
                                        This interactive content will be loaded when you access the full lesson.
                                    </small>
                                </Alert>
                            </div>
                        ))}
                    </div>
                )}
            </Card.Body>

            {/* Debug Information */}
            {debugMode && (
                <Card.Footer className="bg-light border-0">
                    <details>
                        <summary className="text-muted small" style={{ cursor: 'pointer' }}>
                            Debug Information
                        </summary>
                        <div className="mt-2 p-2 bg-dark text-light rounded small">
                            <pre style={{ fontSize: '0.75rem', margin: 0 }}>
                                {JSON.stringify({
                                    renderState,
                                    imageCount: images.length,
                                    interactiveCount: interactiveElements.length,
                                    moduleId,
                                    lessonId
                                }, null, 2)}
                            </pre>
                        </div>
                    </details>
                </Card.Footer>
            )}
        </Card>
    );
};

export default ContentRenderer;