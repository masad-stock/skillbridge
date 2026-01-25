// Performance optimization utilities

/**
 * Debounce function to limit function calls
 */
export const debounce = (func, wait = 300) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Throttle function to limit function execution rate
 */
export const throttle = (func, limit = 300) => {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

/**
 * Lazy load images
 */
export const lazyLoadImage = (imageElement) => {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });
        imageObserver.observe(imageElement);
    } else {
        // Fallback for browsers without IntersectionObserver
        imageElement.src = imageElement.dataset.src;
    }
};

/**
 * Measure Web Vitals
 */
export const measureWebVitals = (onPerfEntry) => {
    if (onPerfEntry && onPerfEntry instanceof Function) {
        import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
            getCLS(onPerfEntry);
            getFID(onPerfEntry);
            getFCP(onPerfEntry);
            getLCP(onPerfEntry);
            getTTFB(onPerfEntry);
        });
    }
};

/**
 * Log performance metrics
 */
export const logPerformanceMetrics = () => {
    if (window.performance && window.performance.timing) {
        const timing = window.performance.timing;
        const metrics = {
            // Page load time
            pageLoadTime: timing.loadEventEnd - timing.navigationStart,
            // DOM ready time
            domReadyTime: timing.domContentLoadedEventEnd - timing.navigationStart,
            // Time to first byte
            ttfb: timing.responseStart - timing.navigationStart,
            // DNS lookup time
            dnsTime: timing.domainLookupEnd - timing.domainLookupStart,
            // TCP connection time
            tcpTime: timing.connectEnd - timing.connectStart,
            // Request time
            requestTime: timing.responseEnd - timing.requestStart,
            // DOM processing time
            domProcessingTime: timing.domComplete - timing.domLoading
        };

        console.log('Performance Metrics:', metrics);
        return metrics;
    }
    return null;
};

/**
 * Memoization helper
 */
export const memoize = (fn) => {
    const cache = new Map();
    return (...args) => {
        const key = JSON.stringify(args);
        if (cache.has(key)) {
            return cache.get(key);
        }
        const result = fn(...args);
        cache.set(key, result);
        return result;
    };
};

/**
 * Request Idle Callback wrapper
 */
export const runWhenIdle = (callback, options = {}) => {
    if ('requestIdleCallback' in window) {
        return window.requestIdleCallback(callback, options);
    } else {
        // Fallback for browsers without requestIdleCallback
        return setTimeout(callback, 1);
    }
};

/**
 * Prefetch resources
 */
export const prefetchResource = (url, type = 'fetch') => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = type;
    link.href = url;
    document.head.appendChild(link);
};

/**
 * Preload critical resources
 */
export const preloadResource = (url, type = 'script') => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = type;
    link.href = url;
    document.head.appendChild(link);
};

/**
 * Check if device is low-end
 */
export const isLowEndDevice = () => {
    // Check for navigator.deviceMemory (Chrome only)
    if (navigator.deviceMemory && navigator.deviceMemory < 4) {
        return true;
    }

    // Check for navigator.hardwareConcurrency
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
        return true;
    }

    // Check connection speed
    if (navigator.connection) {
        const connection = navigator.connection;
        if (connection.effectiveType === 'slow-2g' ||
            connection.effectiveType === '2g' ||
            connection.saveData) {
            return true;
        }
    }

    return false;
};

/**
 * Adaptive loading based on device capabilities
 */
export const getAdaptiveConfig = () => {
    const isLowEnd = isLowEndDevice();

    return {
        imageQuality: isLowEnd ? 'low' : 'high',
        enableAnimations: !isLowEnd,
        lazyLoadThreshold: isLowEnd ? 0.1 : 0.5,
        maxConcurrentRequests: isLowEnd ? 2 : 6,
        cacheSize: isLowEnd ? 10 : 50
    };
};

/**
 * Monitor long tasks
 */
export const monitorLongTasks = (callback) => {
    if ('PerformanceObserver' in window) {
        try {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.duration > 50) { // Tasks longer than 50ms
                        callback({
                            name: entry.name,
                            duration: entry.duration,
                            startTime: entry.startTime
                        });
                    }
                }
            });
            observer.observe({ entryTypes: ['longtask'] });
            return observer;
        } catch (e) {
            console.warn('Long task monitoring not supported');
        }
    }
    return null;
};

/**
 * Bundle size analyzer helper
 */
export const logBundleSize = () => {
    if (window.performance && window.performance.getEntriesByType) {
        const resources = window.performance.getEntriesByType('resource');
        const scripts = resources.filter(r => r.initiatorType === 'script');
        const styles = resources.filter(r => r.initiatorType === 'link');

        const totalScriptSize = scripts.reduce((sum, s) => sum + (s.transferSize || 0), 0);
        const totalStyleSize = styles.reduce((sum, s) => sum + (s.transferSize || 0), 0);

        console.log('Bundle Analysis:', {
            scripts: {
                count: scripts.length,
                totalSize: `${(totalScriptSize / 1024).toFixed(2)} KB`
            },
            styles: {
                count: styles.length,
                totalSize: `${(totalStyleSize / 1024).toFixed(2)} KB`
            },
            total: `${((totalScriptSize + totalStyleSize) / 1024).toFixed(2)} KB`
        });
    }
};

/**
 * Memory usage monitor
 */
export const getMemoryUsage = () => {
    if (performance.memory) {
        return {
            usedJSHeapSize: `${(performance.memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
            totalJSHeapSize: `${(performance.memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
            jsHeapSizeLimit: `${(performance.memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`,
            percentage: `${((performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100).toFixed(2)}%`
        };
    }
    return null;
};

export default {
    debounce,
    throttle,
    lazyLoadImage,
    measureWebVitals,
    logPerformanceMetrics,
    memoize,
    runWhenIdle,
    prefetchResource,
    preloadResource,
    isLowEndDevice,
    getAdaptiveConfig,
    monitorLongTasks,
    logBundleSize,
    getMemoryUsage
};
