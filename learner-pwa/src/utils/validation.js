// Input validation and sanitization utilities

/**
 * Sanitize string input to prevent XSS
 */
export const sanitizeString = (input) => {
    if (typeof input !== 'string') return input;

    return input
        .replace(/[<>]/g, '') // Remove < and >
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, '') // Remove event handlers
        .trim();
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate phone number (Kenyan format)
 */
export const isValidPhone = (phone) => {
    const phoneRegex = /^(\+254|0)[17]\d{8}$/;
    return phoneRegex.test(phone);
};

/**
 * Validate password strength
 */
export const validatePassword = (password) => {
    const errors = [];

    // Minimum length requirement
    if (password.length < 6) {
        errors.push('Password must be at least 6 characters');
        return {
            isValid: false,
            errors
        };
    }

    // Check for common weak passwords
    const weakPasswords = ['password', '123456', '123456789', 'qwerty', 'abc123', 'password123'];
    if (weakPasswords.includes(password.toLowerCase())) {
        errors.push('This password is too common. Please choose a stronger password.');
        return {
            isValid: false,
            errors
        };
    }

    // Optional: Encourage stronger passwords
    const warnings = [];
    if (password.length < 8) {
        warnings.push('Consider using 8+ characters for better security');
    }
    if (!/[A-Z]/.test(password)) {
        warnings.push('Consider adding uppercase letters for better security');
    }
    if (!/[a-z]/.test(password)) {
        warnings.push('Consider adding lowercase letters for better security');
    }
    if (!/[0-9]/.test(password)) {
        warnings.push('Consider adding numbers for better security');
    }

    return {
        isValid: true,
        errors: [],
        warnings
    };
};

/**
 * Sanitize object recursively
 */
export const sanitizeObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            sanitized[key] = sanitizeString(value);
        } else if (typeof value === 'object') {
            sanitized[key] = sanitizeObject(value);
        } else {
            sanitized[key] = value;
        }
    }
    return sanitized;
};

/**
 * Validate user registration data
 */
export const validateRegistration = (data) => {
    const errors = {};

    if (!data.email || !isValidEmail(data.email)) {
        errors.email = 'Please enter a valid email address';
    }

    if (!data.password) {
        errors.password = 'Password is required';
    } else if (data.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
    }

    if (data.password !== data.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
    }

    if (!data.firstName || data.firstName.length < 2) {
        errors.firstName = 'First name must be at least 2 characters';
    }

    if (!data.lastName || data.lastName.length < 2) {
        errors.lastName = 'Last name must be at least 2 characters';
    }

    if (data.phoneNumber && !isValidPhone(data.phoneNumber)) {
        errors.phoneNumber = 'Please enter a valid Kenyan phone number';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

/**
 * Validate login data
 */
export const validateLogin = (data) => {
    const errors = {};

    if (!data.email || !isValidEmail(data.email)) {
        errors.email = 'Please enter a valid email address';
    }

    if (!data.password || data.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

/**
 * Rate limiting helper
 */
class RateLimiter {
    constructor(maxAttempts = 5, windowMs = 15 * 60 * 1000) {
        this.maxAttempts = maxAttempts;
        this.windowMs = windowMs;
        this.attempts = new Map();
    }

    isAllowed(key) {
        const now = Date.now();
        const userAttempts = this.attempts.get(key) || [];

        // Remove old attempts outside the window
        const recentAttempts = userAttempts.filter(
            timestamp => now - timestamp < this.windowMs
        );

        if (recentAttempts.length >= this.maxAttempts) {
            return false;
        }

        recentAttempts.push(now);
        this.attempts.set(key, recentAttempts);
        return true;
    }

    getRemainingAttempts(key) {
        const now = Date.now();
        const userAttempts = this.attempts.get(key) || [];
        const recentAttempts = userAttempts.filter(
            timestamp => now - timestamp < this.windowMs
        );
        return Math.max(0, this.maxAttempts - recentAttempts.length);
    }

    reset(key) {
        this.attempts.delete(key);
    }
}

export const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
export const registrationRateLimiter = new RateLimiter(3, 60 * 60 * 1000); // 3 attempts per hour
