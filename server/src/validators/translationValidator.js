/**
 * ===========================================
 * VALIDATORS: Translation Request Validator
 * ===========================================
 *
 * WHY THIS FILE EXISTS:
 * - Validates user input BEFORE it reaches the controller/service
 * - Fails fast with clear error messages
 * - Prevents bad data from reaching external APIs
 * - Uses express-validator for declarative validation rules
 *
 * HOW IT CONNECTS:
 * - Used as middleware in translation routes
 * - Runs BEFORE the controller function
 * - If validation fails, returns 400 with error details
 */

const { body, validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

/**
 * Validation rules for POST /api/translate
 * Each rule checks one field and provides a clear error message
 */
const translateValidationRules = [
  body('text')
    .trim()
    .notEmpty()
    .withMessage('Text to translate is required.')
    .isLength({ max: 5000 })
    .withMessage('Text must be 5,000 characters or less.'),

  body('sourceLanguage')
    .trim()
    .notEmpty()
    .withMessage('Source language is required.')
    .isLength({ min: 2, max: 5 })
    .withMessage('Invalid source language code.'),

  body('targetLanguage')
    .trim()
    .notEmpty()
    .withMessage('Target language is required.')
    .isLength({ min: 2, max: 5 })
    .withMessage('Invalid target language code.'),
];

/**
 * Middleware that checks validation results and throws errors if invalid
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0].msg;
    throw new AppError(firstError, 400);
  }
  next();
};

module.exports = {
  translateValidationRules,
  validate,
};
