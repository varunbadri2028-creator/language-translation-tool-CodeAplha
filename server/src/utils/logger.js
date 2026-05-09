/**
 * ===========================================
 * UTILS: Logger
 * ===========================================
 *
 * WHY THIS FILE EXISTS:
 * - Provides consistent, structured logging throughout the app
 * - In production, you'd replace this with Winston or Pino
 * - Centralizing logging makes it easy to change log destinations later
 *   (console → file → cloud logging service)
 *
 * HOW IT CONNECTS:
 * - Every module imports logger instead of using console.log directly
 * - Middleware uses it to log requests
 * - Services use it to log API calls and errors
 */

const config = require('../config');

const LogLevel = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

const currentLevel = config.isDev ? LogLevel.DEBUG : LogLevel.INFO;

const formatMessage = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level}] ${message}${metaStr}`;
};

const logger = {
  error: (message, meta = {}) => {
    if (currentLevel >= LogLevel.ERROR) {
      console.error(formatMessage('ERROR', message, meta));
    }
  },

  warn: (message, meta = {}) => {
    if (currentLevel >= LogLevel.WARN) {
      console.warn(formatMessage('WARN', message, meta));
    }
  },

  info: (message, meta = {}) => {
    if (currentLevel >= LogLevel.INFO) {
      console.info(formatMessage('INFO', message, meta));
    }
  },

  debug: (message, meta = {}) => {
    if (currentLevel >= LogLevel.DEBUG) {
      console.debug(formatMessage('DEBUG', message, meta));
    }
  },
};

module.exports = logger;
