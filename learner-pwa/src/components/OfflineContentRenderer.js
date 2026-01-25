/**
 * OfflineContentRenderer
 * 
 * Renders module content optimized for offline viewing with:
 * - Text-first display
 * - Progressive image loading
 * - Video transcript display
 * - Adaptive quality based on connectivity
 * 
 * Requirements: 3.1, 3.3, 3.4
 */

import React, { useState, useEffect } from 'react';
import './OfflineContentRenderer.css';

const OfflineContentRenderer = ({
    module,
    quality = 'medium',
    textOnly = false,
    isOffline = false
}) => {
    const [loadedImages, setLoadedImages] = useState(new Set());
    const [imageErrors, setImageErrors] = useState(new Set());

    // Get offline-optimized content
    const content = module.offlineContent || module.content || {};
    const textContent = content.textContent || content.plainText || module.description;
    const videoTranscript = content.videoTranscript || module.content?.transcript;
    const videoSummary = content.videoSummary;
    const images = content.images || [];

    // Handle image load success
    const handleImageLoad = (imageId) => {
        setLoadedImages(prev => new Set([...prev, imageId]));
    };

    // Handle image load error
    const handleImageError = (imageId) => {
        setImageErrors(prev => new Set([...prev, imageId]));
    };

    // Get image URL based on quality
    const getImageUrl = (image) => {
        if (textOnly) return null;

        // Try to get quality-specific version
        if (image[quality]) return image[quality];

        // Fallback chain
        return image.medium || image.low || image.original;
    };

    // Render text content (HTML or markdown)
    const renderTextContent = () => {
        if (!textContent) return null;

        // If it's HTML, render it
        if (textContent.includes('<')) {
            return (
                <div
                    className="text-content"
                    dangerouslySetInnerHTML={{ __html: textContent }}
                />
            );
        }

        // Otherwise treat as plain text with paragraphs
        return (
            <div className="text-content">
                {textContent.split('\n\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                ))}
            </div>
        );
    };

    // Render images with progressive loading
    const renderImages = () => {
        if (textOnly || !images || images.length === 0) return null;

        return (
            <div className="images-container">
                {images.map((image, index) => {
                    const imageUrl = getImageUrl(image);
                    if (!imageUrl) return null;

                    const imageId = `img-${index}`;
                    const isLoaded = loadedImages.has(imageId);
                    const hasError = imageErrors.has(imageId);

                    return (
                        <figure key={index} className="image-figure">
                            <div className={`image-wrapper ${isLoaded ? 'loaded' : 'loading'}`}>
                                {!hasError ? (
                                    <>
                                        {!isLoaded && (
                                            <div className="image-placeholder">
                                                <div className="spinner"></div>
                                                <span>Loading image...</span>
                                            </div>
                                        )}
                                        <img
                                            src={imageUrl}
                                            alt={image.alt || `Image ${index + 1}`}
                                            onLoad={() => handleImageLoad(imageId)}
                                            onError={() => handleImageError(imageId)}
                                            style={{ display: isLoaded ? 'block' : 'none' }}
                                        />
                                    </>
                                ) : (
                                    <div className="image-error">
                                        <span>📷</span>
                                        <p>Image unavailable offline</p>
                                    </div>
                                )}
                            </div>
                            {image.caption && (
                                <figcaption>{image.caption}</figcaption>
                            )}
                        </figure>
                    );
                })}
            </div>
        );
    };

    // Render video transcript
    const renderVideoTranscript = () => {
        if (!videoTranscript && !videoSummary) return null;

        return (
            <div className="video-transcript-section">
                <h3>📝 Video Content</h3>

                {isOffline && (
                    <div className="offline-notice">
                        <span>⚠️</span>
                        <p>Video playback requires internet connection. Text transcript provided below.</p>
                    </div>
                )}

                {videoSummary && (
                    <div className="video-summary">
                        <h4>Summary</h4>
                        <p>{videoSummary}</p>
                    </div>
                )}

                {videoTranscript && (
                    <details className="transcript-details" open={isOffline}>
                        <summary>Full Transcript</summary>
                        <div className="transcript-content">
                            {videoTranscript.split('\n\n').map((paragraph, index) => (
                                <p key={index}>{paragraph}</p>
                            ))}
                        </div>
                    </details>
                )}
            </div>
        );
    };

    // Render quality indicator
    const renderQualityIndicator = () => {
        if (textOnly) {
            return (
                <div className="quality-indicator text-only">
                    <span>📄</span>
                    <span>Text-only mode</span>
                </div>
            );
        }

        const qualityLabels = {
            low: { icon: '📶', label: 'Low quality', color: '#ff9800' },
            medium: { icon: '📶📶', label: 'Medium quality', color: '#2196f3' },
            high: { icon: '📶📶📶', label: 'High quality', color: '#4caf50' }
        };

        const qualityInfo = qualityLabels[quality] || qualityLabels.medium;

        return (
            <div className="quality-indicator" style={{ borderColor: qualityInfo.color }}>
                <span>{qualityInfo.icon}</span>
                <span>{qualityInfo.label}</span>
                {isOffline && <span className="offline-badge">Offline</span>}
            </div>
        );
    };

    return (
        <div className="offline-content-renderer">
            {renderQualityIndicator()}

            <div className="module-header">
                <h1>{module.title}</h1>
                <p className="module-description">{module.description}</p>
                {module.estimatedTime && (
                    <div className="estimated-time">
                        <span>⏱️</span>
                        <span>{module.estimatedTime} minutes</span>
                    </div>
                )}
            </div>

            {renderTextContent()}
            {renderImages()}
            {renderVideoTranscript()}

            {textOnly && (
                <div className="text-only-footer">
                    <p>💡 <strong>Tip:</strong> Enable images for a richer learning experience when you have better connectivity.</p>
                </div>
            )}
        </div>
    );
};

export default OfflineContentRenderer;
