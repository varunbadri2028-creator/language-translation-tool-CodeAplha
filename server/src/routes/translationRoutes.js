/**
 * ===========================================
 * ROUTES: Translation Routes
 * ===========================================
 *
 * WHY THIS FILE EXISTS:
 * - Maps URL paths to controller functions
 * - Applies validation middleware before controllers
 * - Follows REST API conventions
 *
 * ROUTE FLOW:
 * POST /api/translate
 *   → translateValidationRules (check input)
 *   → validate (return errors if any)
 *   → translationController.translate (handle request)
 *
 * HOW IT CONNECTS:
 * - Mounted in app.js: app.use('/api', translationRoutes)
 * - Validators run BEFORE the controller (middleware chain)
 */

const express = require('express');
const router = express.Router();
const translationController = require('../controllers/translationController');
const { translateValidationRules, validate } = require('../validators/translationValidator');

// POST /api/translate — Translate text
router.post(
  '/translate',
  translateValidationRules,
  validate,
  translationController.translate
);

module.exports = router;
