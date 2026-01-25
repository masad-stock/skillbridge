// Security utilities

/**
 * Generate CSRF token
 */
export const generateCSRFToken = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Store CSRF token
 */
export const setCSRFToken = () => {
    const token = generateCSRFToken();
    sessionStorage.setItem('csrf_token', token);
    return token;
};

/**
 * Get CSRF token
 */
export const getCSRFToken = () => {
    let token = sessionStorage.getItem('csrf_token');
    if (!token) {
        token = setCSRFToken();
    }
    return token;
};

/**
 * Simple encryption for localStorage (not cryptographically secure, just obfuscation)
 */
const SECRET_KEY = 'learner-pwa-2025'; // In production, use env variable

export const encryptData = (data) => {
    try {
        const jsonString = JSON.stringify(data);
        const encrypted = btoa(jsonString); // Base64 encoding
        return encrypted;
    } catch (error) {
        console.error('Encryption error:', error);
        return null;
    }
};

export const decryptData = (encryptedData) => {
    try {
        const decrypted = atob(encryptedData); // Base64 decoding
        return JSON.parse(decrypted);
    } catch (error) {
        console.error('Decryption error:', error);
        return null;
    }
};

/**
 * Secure storage wrapper
 */
export const secureStorage = {
    setItem: (key, value) => {
        try {
            const encrypted = encryptData(value);
            if (encrypted) {
                localStorage.setItem(key, encrypted);
            }
        } catch (error) {
            console.error('Secure storage set error:', error);
        }
    },

    getItem: (key) => {
        try {
            const encrypted = localStorage.getItem(key);
            if (encrypted) {
                return decryptData(encrypted);
            }
            return null;
        } catch (error) {
            console.error('Secure storage get error:', error);
            return null;
        }
    },

    removeItem: (key) => {
        localStorage.removeItem(key);
    },

    clear: () => {
        localStorage.clear();
    }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token) => {
    if (!token) return true;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expirationTime = payload.exp * 1000; // Convert to milliseconds
        return Date.now() >= expirationTime;
    } catch (error) {
        return true;
    }
};

/**
 * Content Security Policy helper
 */
export const setupCSP = () => {
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https: http:",
        "media-src 'self' https://www.youtube.com",
        "frame-src 'self' https://www.youtube.com",
        "connect-src 'self' http://localhost:5001 https://api.yourdomain.com"
    ].join('; ');

    document.head.appendChild(meta);
};

/**
 * Prevent clickjacking
 */
export const preventClickjacking = () => {
    if (window.self !== window.top) {
        window.top.location = window.self.location;
    }
};

/**
 * Sanitize URL to prevent open redirect
 */
export const sanitizeRedirectURL = (url) => {
    if (!url) return '/';

    // Only allow relative URLs or same origin
    try {
        const urlObj = new URL(url, window.location.origin);
        if (urlObj.origin === window.location.origin) {
            return urlObj.pathname + urlObj.search + urlObj.hash;
        }
    } catch (error) {
        // Invalid URL
    }

    return '/';
};

/**
 * Generate secure random string
 */
export const generateSecureRandom = (length = 32) => {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Check if running in secure context (HTTPS)
 */
export const isSecureContext = () => {
    return window.isSecureContext || window.location.protocol === 'https:';
};

/**
 * Implement subresource integrity check
 */
export const verifySRI = (element, expectedHash) => {
    // This would be used for external scripts/styles
    // Implementation depends on your build process
    return true;
};

/**
 * Session timeout handler
 */
export class SessionManager {
    constructor(timeoutMinutes = 30) {
        this.timeoutMs = timeoutMinutes * 60 * 1000;
        this.warningMs = 5 * 60 * 1000; // Warn 5 minutes before
        this.lastActivity = Date.now();
        this.timeoutId = null;
        this.warningId = null;
        this.onTimeout = null;
        this.onWarning = null;
    }

    start(onTimeout, onWarning) {
        this.onTimeout = onTimeout;
        this.onWarning = onWarning;
        this.resetTimer();
        this.setupActivityListeners();
    }

    setupActivityListeners() {
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        events.forEach(event => {
            document.addEventListener(event, () => this.resetTimer(), true);
        });
    }

    resetTimer() {
        this.lastActivity = Date.now();

        if (this.timeoutId) clearTimeout(this.timeoutId);
        if (this.warningId) clearTimeout(this.warningId);

        this.warningId = setTimeout(() => {
            if (this.onWarning) this.onWarning();
        }, this.timeoutMs - this.warningMs);

        this.timeoutId = setTimeout(() => {
            if (this.onTimeout) this.onTimeout();
        }, this.timeoutMs);
    }

    stop() {
        if (this.timeoutId) clearTimeout(this.timeoutId);
        if (this.warningId) clearTimeout(this.warningId);
    }
}

export default {
    generateCSRFToken,
    setCSRFToken,
    getCSRFToken,
    encryptData,
    decryptData,
    secureStorage,
    isTokenExpired,
    setupCSP,
    preventClickjacking,
    sanitizeRedirectURL,
    generateSecureRandom,
    isSecureContext,
    SessionManager
};
