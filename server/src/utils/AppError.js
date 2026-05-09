/**
 * ===========================================
 * UTILS: AppError - Custom Error Class
 * ===========================================
 *
 * WHY THIS FILE EXISTS:
 * - Standard Error objects don't have HTTP status codes
 * - We need to distinguish between operational errors (bad user input)
 *   and programming errors (bugs)
 * - The error handler middleware uses isOperational to decide
 *   whether to show the error message to the user
 *
 * HOW IT CONNECTS:
 * - Controllers and services throw AppError when something goes wrong
 * - errorHandler middleware catches these and sends proper HTTP responses
 */

class AppError extends Error {
  /**
   * @param {string} message - Human-readable error message
   * @param {number} statusCode - HTTP status code (400, 404, 500, etc.)
   * @param {boolean} isOperational - true = expected error, false = bug
   */
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    // Captures the stack trace, excluding the constructor call
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
