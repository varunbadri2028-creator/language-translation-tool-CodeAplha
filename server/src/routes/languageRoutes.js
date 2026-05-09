/**
 * ===========================================
 * ROUTES: Language Routes
 * ===========================================
 *
 * WHY THIS FILE EXISTS:
 * - Serves the list of supported languages
 * - No validation needed — it's a simple GET endpoint
 *
 * HOW IT CONNECTS:
 * - Mounted in app.js: app.use('/api', languageRoutes)
 */

const express = require('express');
const router = express.Router();
const languageController = require('../controllers/languageController');

// GET /api/languages — Get all supported languages
router.get('/languages', languageController.getLanguages);

module.exports = router;
