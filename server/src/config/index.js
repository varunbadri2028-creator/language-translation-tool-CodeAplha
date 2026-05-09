/**
 * ===========================================
 * CONFIG: Environment & Application Settings
 * ===========================================
 *
 * WHY THIS FILE EXISTS:
 * - Centralizes ALL configuration in one place
 * - Environment variables are loaded once and validated
 * - Other files import config values instead of reading process.env directly
 * - Makes it easy to swap between environments (dev, staging, prod)
 *
 * HOW IT CONNECTS:
 * - app.js imports this to configure Express
 * - Services import this for API keys and URLs
 * - Middleware imports this for rate limit settings
 */

require('dotenv').config();

const config = {
  // Server settings
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV !== 'production',

  // CORS settings
  corsOrigin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
    : ['http://localhost:3000'],

  // Translation provider configuration
  translationProvider: process.env.TRANSLATION_PROVIDER || 'mymemory',

  // LibreTranslate settings
  libreTranslate: {
    url: process.env.LIBRETRANSLATE_URL || 'https://libretranslate.com',
    apiKey: process.env.LIBRETRANSLATE_API_KEY || '',
  },

  // Google Translate settings
  googleTranslate: {
    apiKey: process.env.GOOGLE_TRANSLATE_API_KEY || '',
  },

  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },
};

module.exports = config;
