/**
 * Simplified Layout Component
 * Provides a simplified UI mode for users with limited digital experience
 * Features: Large touch targets (48px+), icon-based navigation, high contrast
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Container, Nav, Button } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import './SimplifiedLayout.css';

const SimplifiedModeContext = createContext(null);

// Navigation icons with labels
const navigationItems = [
    { path: '/dashboard', icon: '🏠', label: 'Home', labelSw: 'Nyumbani' },
    { path: '/learning', icon: '📚', label: 'Learn', labelSw: 'Jifunze' },
    { path: '/assessment', icon: '✅', label: 'Test', labelSw: 'Mtihani' },
    { path: '/business-tools', icon: '💼', label: 'Tools', labelSw: 'Zana' },
    { path: '/profile', icon: '👤', label: 'Profile', labelSw: 'Wasifu' },
    { path: '/help', icon: '❓', label: 'Help', labelSw: 'Msaada' }
];

export const SimplifiedModeProvider = ({ children }) => {
    const [isSimplifiedMode, setIsSimplifiedMode] = useState(false);
    const [highContrast, setHighContrast] = useState(false);
    const [language, setLanguage] = useState('en');
    const [fontSize, setFontSize] = useState('normal');

    // Load preferences
    useEffect(() => {
        const savedMode = localStorage.getItem('simplifiedMode');
        const savedContrast = localStorage.getItem('highContrast');
        const savedLang = localStorage.getItem('language');
        const savedFontSize = localStorage.getItem('fontSize');

        if (savedMode === 'true') setIsSimplifiedMode(true);
        if (savedContrast === 'true') setHighContrast(true);
        if (savedLang) setLanguage(savedLang);
        if (savedFontSize) setFontSize(savedFontSize);
    }, []);

    // Save preferences
    useEffect(() => {
        localStorage.setItem('simplifiedMode', isSimplifiedMode.toString());
        localStorage.setItem('highContrast', highContrast.toString());
        localStorage.setItem('language', language);
        localStorage.setItem('fontSize', fontSize);

        // Apply body classes
        document.body.classList.toggle('simplified-mode', isSimplifiedMode);
        document.body.classList.toggle('high-contrast', highContrast);
        document.body.classList.toggle('font-large', fontSize === 'large');
        document.body.classList.toggle('font-xlarge', fontSize === 'xlarge');
    }, [isSimplifiedMode, highContrast, language, fontSize]);

    const value = {
        isSimplifiedMode,
        setIsSimplifiedMode,
        highContrast,
        setHighContrast,
        language,
        setLanguage,
        fontSize,
        setFontSize,
        toggleSimplifiedMode: () => setIsSimplifiedMode(prev => !prev),
        toggleHighContrast: () => setHighContrast(prev => !prev)
    };

    return (
        <SimplifiedModeContext.Provider value={value}>
            {children}
        </SimplifiedModeContext.Provider>
    );
};

export const useSimplifiedMode = () => {
    const context = useContext(SimplifiedModeContext);
    if (!context) {
        throw new Error('useSimplifiedMode must be used within SimplifiedModeProvider');
    }
    return context;
};

// Simplified Navigation Component
export const SimplifiedNavigation = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { language } = useSimplifiedMode();

    return (
        <Nav className="simplified-nav">
            {navigationItems.map(item => (
                <Nav.Item key={item.path}>
                    <Button
                        className={`simplified-nav-btn ${location.pathname === item.path ? 'active' : ''}`}
                        onClick={() => navigate(item.path)}
                        aria-label={language === 'sw' ? item.labelSw : item.label}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">
                            {language === 'sw' ? item.labelSw : item.label}
                        </span>
                    </Button>
                </Nav.Item>
            ))}
        </Nav>
    );
};

// Large Touch Target Button
export const SimplifiedButton = ({
    children,
    icon,
    onClick,
    variant = 'primary',
    size = 'large',
    fullWidth = false,
    ...props
}) => {
    return (
        <Button
            className={`simplified-btn simplified-btn-${size} ${fullWidth ? 'w-100' : ''}`}
            variant={variant}
            onClick={onClick}
            {...props}
        >
            {icon && <span className="btn-icon">{icon}</span>}
            <span className="btn-text">{children}</span>
        </Button>
    );
};

// Visual Progress Indicator
export const VisualProgress = ({ current, total, labels = [] }) => {
    const { language } = useSimplifiedMode();

    return (
        <div className="visual-progress">
            <div className="progress-steps">
                {Array.from({ length: total }, (_, i) => (
                    <div
                        key={i}
                        className={`progress-step ${i < current ? 'completed' : ''} ${i === current ? 'current' : ''}`}
                    >
                        <div className="step-circle">
                            {i < current ? '✓' : i + 1}
                        </div>
                        {labels[i] && (
                            <div className="step-label">{labels[i]}</div>
                        )}
                    </div>
                ))}
            </div>
            <div className="progress-text">
                {language === 'sw'
                    ? `Hatua ${current + 1} ya ${total}`
                    : `Step ${current + 1} of ${total}`
                }
            </div>
        </div>
    );
};

// Simplified Card Component
export const SimplifiedCard = ({
    title,
    icon,
    description,
    onClick,
    actionLabel,
    actionLabelSw
}) => {
    const { language } = useSimplifiedMode();

    return (
        <div className="simplified-card" onClick={onClick} role="button" tabIndex={0}>
            {icon && <div className="card-icon">{icon}</div>}
            <div className="card-content">
                <h3 className="card-title">{title}</h3>
                {description && <p className="card-description">{description}</p>}
            </div>
            {actionLabel && (
                <div className="card-action">
                    <span className="action-arrow">→</span>
                    <span className="action-label">
                        {language === 'sw' ? actionLabelSw || actionLabel : actionLabel}
                    </span>
                </div>
            )}
        </div>
    );
};

// Simplified Error Display
export const SimplifiedError = ({ message, messageSw, onRetry, retryLabel = 'Try Again' }) => {
    const { language } = useSimplifiedMode();

    return (
        <div className="simplified-error">
            <div className="error-icon">⚠️</div>
            <div className="error-message">
                {language === 'sw' ? messageSw || message : message}
            </div>
            {onRetry && (
                <SimplifiedButton onClick={onRetry} icon="🔄">
                    {language === 'sw' ? 'Jaribu Tena' : retryLabel}
                </SimplifiedButton>
            )}
        </div>
    );
};

// Main Simplified Layout Wrapper
const SimplifiedLayout = ({ children, showNav = true }) => {
    const { isSimplifiedMode, highContrast } = useSimplifiedMode();

    if (!isSimplifiedMode) {
        return children;
    }

    return (
        <div className={`simplified-layout ${highContrast ? 'high-contrast' : ''}`}>
            <Container className="simplified-container">
                {children}
            </Container>
            {showNav && <SimplifiedNavigation />}
        </div>
    );
};

export default SimplifiedLayout;
