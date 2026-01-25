import { useState, useEffect } from 'react';
import './SuccessStoryImage.css';

// Curated portrait images for success stories
// ALL images feature Black/African professionals and blue-collar workers
// For Kiharu Constituency, Kenya context - NO white people
const PORTRAIT_IMAGES = {
    female: [
        // African women professionals and entrepreneurs
        'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=200&h=200&fit=crop&crop=face', // African woman professional
        'https://images.unsplash.com/photo-1589156191108-c762ff4b96ab?w=200&h=200&fit=crop&crop=face', // African businesswoman
        'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop&crop=face', // African woman smiling
        'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=200&h=200&fit=crop&crop=face', // African woman entrepreneur
        'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=200&h=200&fit=crop&crop=face', // African woman at work
        'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&h=200&fit=crop&crop=face', // African business professional
        'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=200&h=200&fit=crop&crop=face', // African woman leader
        'https://images.unsplash.com/photo-1573497019236-17f8177b81e8?w=200&h=200&fit=crop&crop=face', // African woman in office
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face', // African professional woman
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face'  // African businesswoman portrait
    ],
    male: [
        // African men professionals and entrepreneurs
        'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=200&h=200&fit=crop&crop=face', // African man professional
        'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop&crop=face', // African businessman
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face', // African man portrait
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=face', // African entrepreneur
        'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=200&h=200&fit=crop&crop=face', // African professional
        'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=200&h=200&fit=crop&crop=face', // African business man
        'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face', // African business professional
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face', // African business portrait
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face', // African professional man
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face'  // African man professional
    ]
};

// Generate a consistent index based on name for deterministic image selection
const getImageIndex = (name, arrayLength) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        const char = name.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash) % arrayLength;
};

// Generate initials from name
const getInitials = (name) => {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

// Generate gradient based on name for fallback avatar
const getGradient = (name) => {
    const gradients = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
        'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
    ];
    const index = getImageIndex(name, gradients.length);
    return gradients[index];
};

function SuccessStoryImage({ name, gender = 'female', size = 80, className = '' }) {
    const [imageUrl, setImageUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        // Get deterministic image based on name
        const images = PORTRAIT_IMAGES[gender] || PORTRAIT_IMAGES.female;
        const index = getImageIndex(name, images.length);
        const selectedImage = images[index];

        // Preload image
        const img = new Image();
        img.onload = () => {
            setImageUrl(selectedImage);
            setLoading(false);
            setError(false);
        };
        img.onerror = () => {
            setLoading(false);
            setError(true);
        };
        img.src = selectedImage;

        return () => {
            img.onload = null;
            img.onerror = null;
        };
    }, [name, gender]);

    const containerStyle = {
        width: `${size}px`,
        height: `${size}px`
    };

    // Loading skeleton
    if (loading) {
        return (
            <div
                className={`success-story-image-container ${className}`}
                style={containerStyle}
            >
                <div className="success-story-image-skeleton" />
            </div>
        );
    }

    // Error fallback - show initials avatar
    if (error || !imageUrl) {
        return (
            <div
                className={`success-story-image-container ${className}`}
                style={containerStyle}
            >
                <div
                    className="success-story-image-fallback"
                    style={{ background: getGradient(name) }}
                >
                    {getInitials(name)}
                </div>
            </div>
        );
    }

    // Success - show portrait image
    return (
        <div
            className={`success-story-image-container ${className}`}
            style={containerStyle}
        >
            <img
                src={imageUrl}
                alt={`Portrait of ${name}`}
                className="success-story-image"
                loading="lazy"
            />
        </div>
    );
}

export default SuccessStoryImage;
