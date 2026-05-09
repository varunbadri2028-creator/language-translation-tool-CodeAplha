/**
 * ===========================================
 * CONTROLLER: Language Controller
 * ===========================================
 *
 * WHY THIS FILE EXISTS:
 * - Serves the list of supported languages to the frontend
 * - The frontend fetches this on load to populate dropdowns
 * - Separating this from translation keeps things modular
 *
 * HOW IT CONNECTS:
 * - Route: GET /api/languages
 * - Returns the languages list from config/languages.js
 */

const languages = require('../config/languages');

/**
 * GET /api/languages
 * Returns all supported languages
 */
const getLanguages = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      languages,
      count: languages.length,
    },
  });
};

module.exports = {
  getLanguages,
};
