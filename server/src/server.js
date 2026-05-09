/**
 * ===========================================
 * SERVER: HTTP Server Entry Point
 * ===========================================
 *
 * WHY THIS FILE EXISTS:
 * - Separated from app.js so the Express app can be imported for testing
 *   without actually starting a server
 * - Handles graceful shutdown and uncaught error recovery
 * - This is the file you run: `node src/server.js`
 *
 * HOW IT CONNECTS:
 * - Imports the configured Express app from app.js
 * - Starts listening on the configured port
 * - Handles process-level errors (uncaughtException, unhandledRejection)
 */

const app = require('./app');
const config = require('./config');
const logger = require('./utils/logger');

// ─────────────────────────────────────────────
// START THE SERVER
// ─────────────────────────────────────────────
const server = app.listen(config.port, () => {
  logger.info(`🌐 LinguaTranslate API running on port ${config.port}`, {
    environment: config.nodeEnv,
    provider: config.translationProvider,
  });
  logger.info(`📍 Health check: http://localhost:${config.port}/api/health`);
});

// ─────────────────────────────────────────────
// GRACEFUL SHUTDOWN
// ─────────────────────────────────────────────
// When the process receives a termination signal (Ctrl+C, Docker stop, etc.),
// we close the server gracefully instead of killing open connections
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down...');
  server.close(() => {
    process.exit(0);
  });
});

// ─────────────────────────────────────────────
// UNHANDLED ERROR RECOVERY
// ─────────────────────────────────────────────
// These catch errors that escape all try/catch blocks
// In production, you'd also send these to an error tracking service (Sentry, etc.)

process.on('uncaughtException', (error) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...', {
    name: error.name,
    message: error.message,
  });
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  logger.error('UNHANDLED REJECTION! Shutting down...', {
    name: error.name,
    message: error.message,
  });
  server.close(() => {
    process.exit(1);
  });
});
