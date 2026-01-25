const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }
};

exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};

// Optional authentication - doesn't require token but sets user if present
exports.optionalAuth = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                req.user = await User.findById(decoded.id).select('-password');
                req.isAuthenticated = !!req.user;
            } catch (error) {
                // Invalid token - treat as unauthenticated
                req.isAuthenticated = false;
                req.user = null;
            }
        } else {
            req.isAuthenticated = false;
            req.user = null;
        }

        next();
    } catch (error) {
        // On any error, treat as unauthenticated and continue
        req.isAuthenticated = false;
        req.user = null;
        next();
    }
};

// Aliases for backward compatibility
exports.auth = exports.protect;
exports.adminAuth = (req, res, next) => {
    exports.protect(req, res, (err) => {
        if (err) return next(err);
        exports.authorize('admin')(req, res, next);
    });
};
