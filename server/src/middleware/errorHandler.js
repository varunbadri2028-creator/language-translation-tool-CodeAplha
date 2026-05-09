/**
 * ===========================================
 * MIDDLEWARE: Error Handler
 * ===========================================
 *
 * WHY THIS FILE EXISTS:
 * - Express needs a centralized error handler (4 params: err, req, res, next)
 * - Without this, unhandled errors crash the server
 * - It formats ALL errors into a consistent JSON response
 * - In dev: includes stack trace. In prod: hides internal details.
 *
 * HOW IT CONNECTS:
 * - Registered LAST in app.js (after all routes)
 * - Any next(error) call or thrown error lands here
 * - Works with AppError for structured error responses
 */

const logger = require('../utils/logger');
const config = require('../config');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Default values
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';

  // Log the error
  logger.error(`${statusCode} - ${err.message}`, {
    path: req.path,
    method: req.method,
    ...(config.isDev && { stack: err.stack }),
  });

  // Send response
  res.status(statusCode).json({
    status,
    message: err.isOperational ? err.message : 'Something went wrong. Please try again later.',
    ...(config.isDev && {
      error: err.message,
      stack: err.stack,
    }),
  });
};

module.exports = errorHandler;
