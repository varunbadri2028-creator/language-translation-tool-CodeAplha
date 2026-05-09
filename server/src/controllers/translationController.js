/**
 * ===========================================
 * CONTROLLER: Translation Controller
 * ===========================================
 *
 * WHY THIS FILE EXISTS:
 * - Handles HTTP request/response for translation endpoints
 * - "Thin controller" pattern: extracts params, calls service, returns response
 * - NO business logic lives here — that's the service's job
 *
 * HOW IT CONNECTS:
 * - Routes map URLs to these controller functions
 * - Controllers call services (translationService)
 * - Errors are passed to the error handler via next(error)
 *
 * INDUSTRY PATTERN:
 * Route → Validator → Controller → Service → External API
 *                                     ↓
 *                              Controller formats response
 */

const translationService = require('../services/translationService');
const logger = require('../utils/logger');

/**
 * POST /api/translate
 * Translates text from source language to target language
 */
const translate = async (req, res, next) => {
  try {
    const { text, sourceLanguage, targetLanguage } = req.body;

    const result = await translationService.translate(
      text,
      sourceLanguage,
      targetLanguage
    );

    logger.info('Translation successful', {
      source: sourceLanguage,
      target: targetLanguage,
      inputLength: text.length,
      outputLength: result.translatedText.length,
    });

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error); // Passes to error handler middleware
  }
};

module.exports = {
  translate,
};
