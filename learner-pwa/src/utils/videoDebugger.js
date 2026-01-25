/**
 * Video Debugger Utility
 * 
 * Provides comprehensive debugging tools for video playback issues
 * including logging, error tracking, and performance monitoring.
 */

// Debug log levels
const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
};

// Current log level (can be changed at runtime)
let currentLogLevel = LOG_LEVELS.INFO;

// Log storage for debugging
const logHistory = [];
const MAX_LOG_HISTORY = 100;

// Performance metrics
const performanceMetrics = {
    apiLoadTime: null,
    playerInitTime: null,
    firstPlayTime: null,
    bufferingEvents: 0,
    errors: []
};

/**
 * Set the current log level
 * @param {string} level - 'DEBUG', 'INFO', 'WARN', or 'ERROR'
 */
export const setLogLevel = (level) => {
    if (LOG_LEVELS[level] !== undefined) {
        currentLogLevel = LOG_LEVELS[level];
    }
};

/**
 * Enable debug mode (shows all logs)
 */
export const enableDebugMode = () => {
    currentLogLevel = LOG_LEVELS.DEBUG;
    console.log('[VideoDebugger] Debug mode enabled');
};

/**
 * Disable debug mode (shows only warnings and errors)
 */
export const disableDebugMode = () => {
    currentLogLevel = LOG_LEVELS.WARN;
    console.log('[VideoDebugger] Debug mode disabled');
};

/**
 * Log a message with timestamp and category
 */
const log = (level, category, message, data = null) => {
    if (LOG_LEVELS[level] < currentLogLevel) return;

    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        level,
        category,
        message,
        data
    };

    // Store in history
    logHistory.push(logEntry);
    if (logHistory.length > MAX_LOG_HISTORY) {
        logHistory.shift();
    }

    // Console output
    const prefix = `[VideoDebugger][${category}]`;
    const style = level === 'ERROR' ? 'color: red' :
        level === 'WARN' ? 'color: orange' :
            level === 'DEBUG' ? 'color: gray' : 'color: blue';

    if (data) {
        console.log(`%c${prefix} ${message}`, style, data);
    } else {
        console.log(`%c${prefix} ${message}`, style);
    }
};

/**
 * Debug level logging
 */
export const debug = (category, message, data = null) => {
    log('DEBUG', category, message, data);
};

/**
 * Info level logging
 */
export const info = (category, message, data = null) => {
    log('INFO', category, message, data);
};

/**
 * Warning level logging
 */
export const warn = (category, message, data = null) => {
    log('WARN', category, message, data);
};

/**
 * Error level logging
 */
export const error = (category, message, data = null) => {
    log('ERROR', category, message, data);

    // Track errors in metrics
    performanceMetrics.errors.push({
        timestamp: new Date().toISOString(),
        category,
        message,
        data
    });
};

/**
 * Track API load time
 */
export const trackApiLoadStart = () => {
    performanceMetrics.apiLoadStartTime = performance.now();
    debug('Performance', 'YouTube API load started');
};

export const trackApiLoadEnd = () => {
    if (performanceMetrics.apiLoadStartTime) {
        performanceMetrics.apiLoadTime = performance.now() - performanceMetrics.apiLoadStartTime;
        info('Performance', `YouTube API loaded in ${performanceMetrics.apiLoadTime.toFixed(2)}ms`);
    }
};

/**
 * Track player initialization time
 */
export const trackPlayerInitStart = () => {
    performanceMetrics.playerInitStartTime = performance.now();
    debug('Performance', 'Player initialization started');
};

export const trackPlayerInitEnd = () => {
    if (performanceMetrics.playerInitStartTime) {
        performanceMetrics.playerInitTime = performance.now() - performanceMetrics.playerInitStartTime;
        info('Performance', `Player initialized in ${performanceMetrics.playerInitTime.toFixed(2)}ms`);
    }
};

/**
 * Track first play time
 */
export const trackFirstPlay = () => {
    if (!performanceMetrics.firstPlayTime && performanceMetrics.playerInitStartTime) {
        performanceMetrics.firstPlayTime = performance.now() - performanceMetrics.playerInitStartTime;
        info('Performance', `First play at ${performanceMetrics.firstPlayTime.toFixed(2)}ms after init`);
    }
};

/**
 * Track buffering events
 */
export const trackBuffering = () => {
    performanceMetrics.bufferingEvents++;
    debug('Performance', `Buffering event #${performanceMetrics.bufferingEvents}`);
};

/**
 * Get performance metrics
 */
export const getPerformanceMetrics = () => ({
    ...performanceMetrics,
    errorCount: performanceMetrics.errors.length
});

/**
 * Get log history
 */
export const getLogHistory = () => [...logHistory];

/**
 * Clear log history
 */
export const clearLogHistory = () => {
    logHistory.length = 0;
    info('System', 'Log history cleared');
};

/**
 * Export logs as JSON
 */
export const exportLogs = () => {
    return JSON.stringify({
        exportedAt: new Date().toISOString(),
        logLevel: Object.keys(LOG_LEVELS).find(key => LOG_LEVELS[key] === currentLogLevel),
        performanceMetrics: getPerformanceMetrics(),
        logs: logHistory
    }, null, 2);
};

/**
 * Check browser compatibility for video playback
 */
export const checkBrowserCompatibility = () => {
    const compatibility = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        cookiesEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        language: navigator.language,
        features: {
            postMessage: typeof window.postMessage === 'function',
            localStorage: typeof localStorage !== 'undefined',
            sessionStorage: typeof sessionStorage !== 'undefined',
            fetch: typeof fetch === 'function',
            promise: typeof Promise !== 'undefined'
        },
        issues: []
    };

    // Check for potential issues
    if (!compatibility.features.postMessage) {
        compatibility.issues.push('postMessage not supported - YouTube API may not work');
    }

    if (!compatibility.onLine) {
        compatibility.issues.push('Browser is offline - videos will not load');
    }

    if (!compatibility.cookiesEnabled) {
        compatibility.issues.push('Cookies disabled - may affect video playback');
    }

    info('Compatibility', 'Browser compatibility check', compatibility);
    return compatibility;
};

/**
 * Check network connectivity
 */
export const checkNetworkConnectivity = async () => {
    const results = {
        online: navigator.onLine,
        youtubeReachable: false,
        latency: null
    };

    if (!navigator.onLine) {
        warn('Network', 'Browser reports offline status');
        return results;
    }

    try {
        const startTime = performance.now();
        const response = await fetch('https://www.youtube.com/favicon.ico', {
            method: 'HEAD',
            mode: 'no-cors',
            cache: 'no-store'
        });
        results.latency = performance.now() - startTime;
        results.youtubeReachable = true;
        info('Network', `YouTube reachable, latency: ${results.latency.toFixed(2)}ms`);
    } catch (err) {
        warn('Network', 'Could not reach YouTube', err.message);
    }

    return results;
};

/**
 * Generate a diagnostic report
 */
export const generateDiagnosticReport = async () => {
    const report = {
        generatedAt: new Date().toISOString(),
        browser: checkBrowserCompatibility(),
        network: await checkNetworkConnectivity(),
        performance: getPerformanceMetrics(),
        recentLogs: logHistory.slice(-20),
        recommendations: []
    };

    // Generate recommendations based on findings
    if (!report.network.online) {
        report.recommendations.push('Check your internet connection');
    }

    if (!report.network.youtubeReachable) {
        report.recommendations.push('YouTube may be blocked - check firewall or network settings');
    }

    if (report.performance.apiLoadTime > 5000) {
        report.recommendations.push('Slow API load time - check network speed');
    }

    if (report.performance.bufferingEvents > 5) {
        report.recommendations.push('Frequent buffering - consider lower video quality');
    }

    if (report.browser.issues.length > 0) {
        report.recommendations.push(...report.browser.issues);
    }

    info('Diagnostic', 'Report generated', report);
    return report;
};

// Auto-enable debug mode in development
if (process.env.NODE_ENV === 'development') {
    enableDebugMode();
}

export default {
    setLogLevel,
    enableDebugMode,
    disableDebugMode,
    debug,
    info,
    warn,
    error,
    trackApiLoadStart,
    trackApiLoadEnd,
    trackPlayerInitStart,
    trackPlayerInitEnd,
    trackFirstPlay,
    trackBuffering,
    getPerformanceMetrics,
    getLogHistory,
    clearLogHistory,
    exportLogs,
    checkBrowserCompatibility,
    checkNetworkConnectivity,
    generateDiagnosticReport
};