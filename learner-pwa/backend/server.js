require('dotenv').config();

// Global error handlers for uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err.message);
    console.error(err.stack);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION at:', promise);
    console.error('Reason:', reason);
});

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yaml');
const fs = require('fs');
const client = require('prom-client');

const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const assessmentRoutes = require('./routes/assessments');
const learningRoutes = require('./routes/learning');
const businessRoutes = require('./routes/business');
const analyticsRoutes = require('./routes/analytics');
const adminRoutes = require('./routes/admin');
const certificateRoutes = require('./routes/certificates');
const emailRoutes = require('./routes/email');
const searchRoutes = require('./routes/search');
const paymentRoutes = require('./routes/payments');
const imageRoutes = require('./routes/images');
const enhancedContentRoutes = require('./routes/enhancedContent');
const coursesRoutes = require('./routes/courses');
const chatbotRoutes = require('./routes/chatbot');
const researchRoutes = require('./routes/research');
const consentRoutes = require('./routes/consent');
const experimentRoutes = require('./routes/experiment');
const interventionRoutes = require('./routes/intervention');
const economicSurveyRoutes = require('./routes/economicSurvey');
const researchAssessmentRoutes = require('./routes/researchAssessment');
const competencyRoutes = require('./routes/competency');
const learningPathwayRoutes = require('./routes/learningPathway');
const eventTrackingService = require('./services/research/EventTrackingService');
// const contentDiagnosticsRoutes = require('./routes/contentDiagnostics'); // Temporarily disabled

const app = express();

// Trust proxy - CRITICAL for Render deployment
// This allows express-rate-limit to correctly identify users behind proxies
app.set('trust proxy', 1);

const httpServer = createServer(app);
// CORS origins - include production URLs
const corsOrigins = [
    process.env.CORS_ORIGIN || 'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'https://skillbridge-tau.vercel.app',
    'https://skillbridge.vercel.app'
].filter(Boolean);

const io = new Server(httpServer, {
    cors: {
        origin: corsOrigins,
        methods: ['GET', 'POST']
    }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
    origin: corsOrigins,
    credentials: true
}));
app.use(require('./middleware/requestContext'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Structured HTTP logging with correlation IDs
morgan.token('id', (req) => req.requestId);
morgan.token('user', (req) => (req.user && req.user.id) || 'guest');
const httpLogFormat = (tokens, req, res) => JSON.stringify({
    requestId: tokens.id(req, res),
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    status: Number(tokens.status(req, res)),
    contentLength: tokens.res(req, res, 'content-length') || 0,
    responseTimeMs: Number(tokens['response-time'](req, res)),
    userId: tokens.user(req, res),
    remoteAddr: req.ip
});
app.use(morgan(httpLogFormat, {
    stream: {
        write: (message) => {
            try {
                const data = JSON.parse(message);
                logger.info('http', data);
            } catch (e) {
                logger.info(message.trim());
            }
        }
    }
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Static files - serve uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    setHeaders: (res, filePath) => {
        // Set proper CORS headers for images
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    }
}));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Metrics
client.collectDefaultMetrics();
app.get('/metrics', async (req, res) => {
    try {
        res.set('Content-Type', client.register.contentType);
        res.end(await client.register.metrics());
    } catch (e) {
        res.status(500).end(e.message);
    }
});

// API Routes
const API_VERSION = process.env.API_VERSION || 'v1';
app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/users`, userRoutes);
app.use(`/api/${API_VERSION}/assessments`, assessmentRoutes);
app.use(`/api/${API_VERSION}/learning`, learningRoutes);
app.use(`/api/${API_VERSION}/business`, businessRoutes);
app.use(`/api/${API_VERSION}/analytics`, analyticsRoutes);
app.use(`/api/${API_VERSION}/admin`, adminRoutes);
app.use(`/api/${API_VERSION}/certificates`, certificateRoutes);
app.use(`/api/${API_VERSION}/email`, emailRoutes);
app.use(`/api/${API_VERSION}/search`, searchRoutes);
app.use(`/api/${API_VERSION}/payments`, paymentRoutes);
app.use(`/api/${API_VERSION}/images`, imageRoutes);
app.use(`/api/${API_VERSION}/enhanced-content`, enhancedContentRoutes);
app.use(`/api/${API_VERSION}/chatbot`, chatbotRoutes);
app.use(`/api/${API_VERSION}/research`, researchRoutes);
app.use(`/api/${API_VERSION}/consent`, consentRoutes);
app.use(`/api/${API_VERSION}/experiments`, experimentRoutes);
app.use(`/api/${API_VERSION}/interventions`, interventionRoutes);
app.use(`/api/${API_VERSION}/economic-surveys`, economicSurveyRoutes);
app.use(`/api/${API_VERSION}/research-assessments`, researchAssessmentRoutes);
app.use(`/api/${API_VERSION}/competency`, competencyRoutes);
app.use(`/api/${API_VERSION}/learning-pathway`, learningPathwayRoutes);
app.use(`/api/${API_VERSION}/upload`, require('./routes/upload'));
// app.use(`/api/${API_VERSION}/content-diagnostics`, contentDiagnosticsRoutes); // Temporarily disabled
app.use(`/api/${API_VERSION}`, coursesRoutes);

// Swagger UI
try {
    const openApiPath = require('path').join(__dirname, 'openapi.yaml');
    if (fs.existsSync(openApiPath)) {
        const openApiDoc = YAML.parse(fs.readFileSync(openApiPath, 'utf8'));
        app.use(`/api/${API_VERSION}/docs`, swaggerUi.serve, swaggerUi.setup(openApiDoc));
        logger.info(`Swagger UI available at /api/${API_VERSION}/docs`);
    } else {
        logger.warn('OpenAPI spec not found at backend/openapi.yaml; skipping Swagger UI.');
    }
} catch (e) {
    logger.error('Failed to load Swagger UI:', e);
}

// Serve static files (certificates)
app.use('/certificates', express.static('public/certificates'));

// Error handling
app.use(errorHandler);

// Socket.io for real-time features
io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    socket.on('join-learning-session', (sessionId) => {
        socket.join(`session-${sessionId}`);
    });

    socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
    });
});

// Make io accessible to routes
app.set('io', io);

// Database connection
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    logger.error('MONGODB_URI environment variable is not set!');
    logger.error('Please set MONGODB_URI in your environment variables.');
    process.exit(1);
}

logger.info('Connecting to MongoDB...');
mongoose.connect(MONGODB_URI)
    .then(() => {
        logger.info('MongoDB connected successfully');

        // Initialize research event tracking service (if available)
        if (eventTrackingService && typeof eventTrackingService.initialize === 'function') {
            eventTrackingService.initialize();
        }

        // Start server
        const PORT = process.env.PORT || 5001;
        httpServer.listen(PORT, '0.0.0.0', () => {
            logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
        });
    })
    .catch(err => {
        logger.error('MongoDB connection error:', err.message);
        logger.error('Please check your MONGODB_URI and ensure MongoDB Atlas IP whitelist includes 0.0.0.0/0');
        process.exit(1);
    });

// Graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM signal received: closing HTTP server');

    // Flush pending events before shutdown
    await eventTrackingService.shutdown();

    httpServer.close(() => {
        logger.info('HTTP server closed');
        mongoose.connection.close(false, () => {
            logger.info('MongoDB connection closed');
            process.exit(0);
        });
    });
});

module.exports = { app, io };
