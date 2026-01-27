const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists (only in non-production or if writable)
const logsDir = path.join(__dirname, '../logs');
let fileTransportsEnabled = false;

try {
    if (process.env.NODE_ENV !== 'production') {
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }
        fileTransportsEnabled = true;
    }
} catch (err) {
    // Can't create logs directory, skip file transports
    console.warn('Could not create logs directory, using console only');
}

const transports = [
    new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    })
];

// Add file transports only if enabled
if (fileTransportsEnabled) {
    transports.push(
        new winston.transports.File({
            filename: path.join(logsDir, 'error.log'),
            level: 'error'
        }),
        new winston.transports.File({
            filename: path.join(logsDir, 'combined.log')
        })
    );
}

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    defaultMeta: { service: 'adaptive-learning-api' },
    transports
});

module.exports = logger;
