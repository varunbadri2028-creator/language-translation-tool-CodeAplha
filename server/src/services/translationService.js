/**
 * ===========================================
 * SERVICE: Translation Service (Provider Pattern)
 * ===========================================
 *
 * WHY THIS FILE EXISTS:
 * - Contains ALL business logic for translation
 * - Implements the PROVIDER PATTERN — the core scalability feature
 * - Controllers don't know which external API is being used
 * - To add Google Translate: add a provider function, update the switch
 *
 * PROVIDER PATTERN EXPLAINED:
 * ┌─────────────┐     ┌──────────────────────┐
 * │ Controller   │────▶│ translationService    │
 * │ (thin layer) │     │   .translate()        │
 * └─────────────┘     └──────────┬───────────┘
 *                                │
 *                     ┌──────────▼───────────┐
 *                     │  Provider Selection   │
 *                     │  (based on config)    │
 *                     └──────────┬───────────┘
 *                                │
 *              ┌─────────────────┼─────────────────┐
 *              ▼                 ▼                  ▼
 *     ┌──────────────┐ ┌──────────────┐  ┌──────────────┐
 *     │  MyMemory     │ │ LibreTranslate│  │   Google     │
 *     │  (free, no    │ │ (self-hosted  │  │   (paid,     │
 *     │   API key)    │ │  or cloud)    │  │   accurate)  │
 *     └──────────────┘ └──────────────┘  └──────────────┘
 *
 * HOW IT CONNECTS:
 * - translationController calls translationService.translate()
 * - This service picks the provider based on config.translationProvider
 * - Each provider function handles the external API call
 */

const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');
const AppError = require('../utils/AppError');

// ─────────────────────────────────────────────
// PROVIDER 1: MyMemory Translation API (Free)
// ─────────────────────────────────────────────
// Docs: https://mymemory.translated.net/doc/spec.php
// Free tier: 5,000 chars/day (no API key needed)
// Response format: { responseData: { translatedText: "..." } }

async function translateWithMyMemory(text, sourceLanguage, targetLanguage) {
  const langPair = `${sourceLanguage}|${targetLanguage}`;
  const url = 'https://api.mymemory.translated.net/get';

  logger.debug('Calling MyMemory API', { langPair, textLength: text.length });

  const response = await axios.get(url, {
    params: {
      q: text,
      langpair: langPair,
      de: 'varun.developer2026@gmail.com', // Using an email bypasses IP limits and gives 5000/words a day
    },
    timeout: 10000, // 10 second timeout
  });

  const { responseData, responseStatus, responseDetails, quotaFinished } = response.data;

  if (quotaFinished || responseStatus === 403) {
    throw new AppError('Translation failed. Daily limit may have been reached.', 429);
  }

  if (!responseData || responseStatus !== 200) {
    throw new AppError(
      responseDetails || 'Translation failed.',
      400
    );
  }

  return responseData.translatedText;
}

// ─────────────────────────────────────────────
// PROVIDER 2: LibreTranslate API
// ─────────────────────────────────────────────
// Docs: https://libretranslate.com/docs
// Self-hostable, open source, optional API key
// Response format: { translatedText: "..." }

async function translateWithLibreTranslate(text, sourceLanguage, targetLanguage) {
  const url = `${config.libreTranslate.url}/translate`;

  logger.debug('Calling LibreTranslate API', { url, sourceLanguage, targetLanguage });

  const payload = {
    q: text,
    source: sourceLanguage,
    target: targetLanguage,
    format: 'text',
  };

  if (config.libreTranslate.apiKey) {
    payload.api_key = config.libreTranslate.apiKey;
  }

  const response = await axios.post(url, payload, { timeout: 10000 });

  if (!response.data || !response.data.translatedText) {
    throw new AppError('LibreTranslate returned an invalid response.', 502);
  }

  return response.data.translatedText;
}

// ─────────────────────────────────────────────
// PROVIDER 3: Free Google Translate API
// ─────────────────────────────────────────────
// Uses the free Google Translate web endpoint for much better
// support for native scripts (like Telugu, Hindi) instead of romanization.
async function translateWithGoogle(text, sourceLanguage, targetLanguage) {
  const url = 'https://translate.googleapis.com/translate_a/single';
  
  logger.debug('Calling Google Translate API', { sourceLanguage, targetLanguage });

  const response = await axios.get(url, {
    params: {
      client: 'gtx',
      sl: sourceLanguage,
      tl: targetLanguage,
      dt: 't',
      q: text,
    },
    timeout: 10000,
  });

  if (!response.data || !response.data[0]) {
    throw new AppError('Google Translate returned an invalid response.', 502);
  }

  // The response is a nested array. We map over the chunks and join them.
  const translatedText = response.data[0].map(chunk => chunk[0]).join('');
  return translatedText;
}

// ─────────────────────────────────────────────
// MAIN TRANSLATE FUNCTION (Provider Router)
// ─────────────────────────────────────────────

/**
 * Translates text using the configured provider
 *
 * @param {string} text - Text to translate
 * @param {string} sourceLanguage - Source language code (e.g., "en")
 * @param {string} targetLanguage - Target language code (e.g., "es")
 * @returns {Promise<{translatedText: string, provider: string}>}
 */
async function translate(text, sourceLanguage, targetLanguage) {
  // Override config to always use google for better script support
  const provider = 'google'; 

  logger.info('Translation request', {
    provider,
    source: sourceLanguage,
    target: targetLanguage,
    textLength: text.length,
  });

  let translatedText;

  try {
    switch (provider) {
      case 'mymemory':
        translatedText = await translateWithMyMemory(text, sourceLanguage, targetLanguage);
        break;

      case 'libretranslate':
        translatedText = await translateWithLibreTranslate(text, sourceLanguage, targetLanguage);
        break;

      case 'google':
        translatedText = await translateWithGoogle(text, sourceLanguage, targetLanguage);
        break;

      default:
        throw new AppError(`Unknown translation provider: ${provider}`, 500, false);
    }
  } catch (error) {
    // If it's already an AppError, re-throw it
    if (error instanceof AppError) {
      throw error;
    }

    // Handle axios errors (network issues, timeouts, etc.)
    if (error.code === 'ECONNABORTED') {
      throw new AppError('Translation request timed out. Please try again.', 504);
    }

    if (error.response) {
      // External API returned an error
      logger.error('Translation API error', {
        status: error.response.status,
        data: error.response.data,
      });
      throw new AppError('Translation service is temporarily unavailable.', 502);
    }

    // Network error (no response received)
    logger.error('Translation network error', { message: error.message });
    throw new AppError('Unable to reach translation service. Check your connection.', 503);
  }

  return {
    translatedText,
    provider,
    sourceLanguage,
    targetLanguage,
    timestamp: new Date().toISOString(),
  };
}

module.exports = {
  translate,
};
