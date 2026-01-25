/**
 * Analytics Utility
 * Provides Google Analytics integration for tracking user behavior
 */

const isProduction = process.env.NODE_ENV === 'production';
const gaId = process.env.REACT_APP_GA_MEASUREMENT_ID || process.env.REACT_APP_GOOGLE_ANALYTICS_ID;
const isAnalyticsEnabled = process.env.REACT_APP_ENABLE_ANALYTICS === 'true' && gaId && isProduction;

// Initialize Google Analytics
export const initAnalytics = () => {
    if (!isAnalyticsEnabled) {
        return;
    }

    // Load Google Analytics script
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${gaId}', {
            page_path: window.location.pathname,
        });
    `;
    document.head.appendChild(script2);
};

// Track page view
export const trackPageView = (path) => {
    if (!isAnalyticsEnabled || !window.gtag) {
        return;
    }

    window.gtag('config', gaId, {
        page_path: path,
    });
};

// Track event
export const trackEvent = (action, category, label, value) => {
    if (!isAnalyticsEnabled || !window.gtag) {
        return;
    }

    window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
    });
};

// Track custom events
export const trackLogin = () => trackEvent('login', 'authentication', 'User Login');
export const trackRegistration = () => trackEvent('register', 'authentication', 'User Registration');
export const trackModuleStart = (moduleId) => trackEvent('module_start', 'learning', moduleId);
export const trackModuleComplete = (moduleId) => trackEvent('module_complete', 'learning', moduleId);
export const trackAssessmentStart = () => trackEvent('assessment_start', 'assessment', 'Skills Assessment');
export const trackAssessmentComplete = () => trackEvent('assessment_complete', 'assessment', 'Skills Assessment');
export const trackBusinessToolUse = (toolName) => trackEvent('business_tool_use', 'business', toolName);

export default {
    initAnalytics,
    trackPageView,
    trackEvent,
    trackLogin,
    trackRegistration,
    trackModuleStart,
    trackModuleComplete,
    trackAssessmentStart,
    trackAssessmentComplete,
    trackBusinessToolUse,
};
