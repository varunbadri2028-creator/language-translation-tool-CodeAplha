/**
 * ===========================================
 * APP: Express Application Setup
 * ===========================================
 *
 * WHY THIS FILE EXISTS:
 * - Configures the Express application
 * - Registers all middleware in the correct order
 * - Mounts all route handlers
 * - Separated from server.js so the app can be tested without starting a server
 *
 * MIDDLEWARE ORDER MATTERS:
 * 1. Security (helmet) — sets security headers
 * 2. CORS — allows cross-origin requests from frontend
 * 3. Body parsing — parses JSON request bodies
 * 4. Rate limiting — prevents abuse
 * 5. Routes — handles actual requests
 * 6. 404 handler — catches unknown routes
 * 7. Error handler — catches all errors (MUST BE LAST)
 *
 * HOW IT CONNECTS:
 * - server.js imports this and starts the HTTP server
 * - All routes, middleware, and config come together here
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config');
const rateLimiter = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const translationRoutes = require('./routes/translationRoutes');
const languageRoutes = require('./routes/languageRoutes');
const AppError = require('./utils/AppError');
const logger = require('./utils/logger');

const app = express();

// ─────────────────────────────────────────────
// 1. SECURITY MIDDLEWARE
// ─────────────────────────────────────────────
// Helmet sets various HTTP headers to protect against common attacks
app.use(helmet());

// ─────────────────────────────────────────────
// 2. CORS (Cross-Origin Resource Sharing)
// ─────────────────────────────────────────────
// Without this, the browser blocks requests from localhost:3000 to localhost:5000
// because they're different "origins" (different ports)
app.use(
  cors({
    origin: config.corsOrigin,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─────────────────────────────────────────────
// 3. BODY PARSING
// ─────────────────────────────────────────────
// Parses incoming JSON request bodies (req.body)
app.use(express.json({ limit: '10kb' })); // Limit body size to prevent abuse

// ─────────────────────────────────────────────
// 4. RATE LIMITING
// ─────────────────────────────────────────────
app.use('/api', rateLimiter);

// ─────────────────────────────────────────────
// 5. REQUEST LOGGING (Development only)
// ─────────────────────────────────────────────
if (config.isDev) {
  app.use((req, res, next) => {
    logger.debug(`${req.method} ${req.path}`);
    next();
  });
}

// ─────────────────────────────────────────────
// 6. HEALTH CHECK
// ─────────────────────────────────────────────
// Used by deployment platforms to verify the server is running
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'LinguaTranslate API is running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// ─────────────────────────────────────────────
// 7. API ROUTES
// ─────────────────────────────────────────────
app.use('/api', translationRoutes);
app.use('/api', languageRoutes);

// ─────────────────────────────────────────────
// 8. 404 HANDLER (Unknown routes)
// ─────────────────────────────────────────────
app.all('{*path}', (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

// ─────────────────────────────────────────────
// 9. GLOBAL ERROR HANDLER (Must be last)
// ─────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
