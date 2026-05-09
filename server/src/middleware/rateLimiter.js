/**
 * ===========================================
 * MIDDLEWARE: Rate Limiter
 * ===========================================
 *
 * WHY THIS FILE EXISTS:
 * - Prevents abuse and DDoS attacks
 * - Limits each IP to N requests per time window
 * - Essential for any public API (especially one calling external APIs)
 * - Without this, one user could exhaust our API quota
 *
 * HOW IT CONNECTS:
 * - Applied globally in app.js before routes
 * - Uses config values for window and max requests
 * - Returns 429 (Too Many Requests) when limit is exceeded
 */

const rateLimit = require('express-rate-limit');
const config = require('../config');

const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    status: 'fail',
    message: 'Too many requests. Please try again later.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,  // Disable the `X-RateLimit-*` headers
});

module.exports = rateLimiter;
