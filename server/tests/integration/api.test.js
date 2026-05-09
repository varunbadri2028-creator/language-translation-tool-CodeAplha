/**
 * ===========================================
 * TEST: API Integration Tests
 * ===========================================
 *
 * WHY THIS TEST EXISTS:
 * - Unit tests verify individual pieces work
 * - Integration tests verify the WHOLE CHAIN works together:
 *   HTTP request → middleware → validation → controller → service → response
 *
 * HOW SUPERTEST WORKS:
 * - Supertest creates a temporary server from our Express app
 * - It sends real HTTP requests (GET, POST, etc.)
 * - We assert on the response status, headers, and body
 * - No real server needs to be running
 *
 * WHAT WE TEST:
 * 1. Health check endpoint
 * 2. Languages endpoint
 * 3. Translation endpoint (success)
 * 4. Translation validation (missing text, invalid language)
 * 5. 404 for unknown routes
 * 6. Error response format
 */

const request = require('supertest');
const app = require('../../src/app');

// Mock the translation service to avoid calling external APIs
jest.mock('../../src/services/translationService', () => ({
  translate: jest.fn(),
}));

const translationService = require('../../src/services/translationService');

describe('API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ═══════════════════════════════════════════════════
  // HEALTH CHECK
  // ═══════════════════════════════════════════════════

  describe('GET /api/health', () => {
    it('should return 200 with status "success"', async () => {
      const res = await request(app).get('/api/health');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.message).toContain('running');
      expect(res.body.timestamp).toBeDefined();
    });
  });

  // ═══════════════════════════════════════════════════
  // LANGUAGES
  // ═══════════════════════════════════════════════════

  describe('GET /api/languages', () => {
    it('should return 200 with a list of languages', async () => {
      const res = await request(app).get('/api/languages');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.languages).toBeInstanceOf(Array);
      expect(res.body.data.languages.length).toBeGreaterThan(0);
      expect(res.body.data.count).toBe(res.body.data.languages.length);
    });

    it('each language should have code, name, and nativeName', async () => {
      const res = await request(app).get('/api/languages');
      const firstLang = res.body.data.languages[0];

      expect(firstLang).toHaveProperty('code');
      expect(firstLang).toHaveProperty('name');
      expect(firstLang).toHaveProperty('nativeName');
    });
  });

  // ═══════════════════════════════════════════════════
  // TRANSLATION
  // ═══════════════════════════════════════════════════

  describe('POST /api/translate', () => {
    // ─── Success case ─────────────────────────────────
    it('should return translated text on valid request', async () => {
      translationService.translate.mockResolvedValue({
        translatedText: 'Hola mundo',
        provider: 'mymemory',
        sourceLanguage: 'en',
        targetLanguage: 'es',
        timestamp: new Date().toISOString(),
      });

      const res = await request(app)
        .post('/api/translate')
        .send({
          text: 'Hello world',
          sourceLanguage: 'en',
          targetLanguage: 'es',
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.translatedText).toBe('Hola mundo');
      expect(res.body.data.provider).toBe('mymemory');
    });

    // ─── Validation: missing text ─────────────────────
    it('should return 400 when text is missing', async () => {
      const res = await request(app)
        .post('/api/translate')
        .send({
          sourceLanguage: 'en',
          targetLanguage: 'es',
        });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
      expect(res.body.message).toContain('Text');
    });

    // ─── Validation: empty text ───────────────────────
    it('should return 400 when text is empty', async () => {
      const res = await request(app)
        .post('/api/translate')
        .send({
          text: '   ',
          sourceLanguage: 'en',
          targetLanguage: 'es',
        });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
    });

    // ─── Validation: missing source language ──────────
    it('should return 400 when sourceLanguage is missing', async () => {
      const res = await request(app)
        .post('/api/translate')
        .send({
          text: 'Hello',
          targetLanguage: 'es',
        });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
      expect(res.body.message).toContain('Source language');
    });

    // ─── Validation: missing target language ──────────
    it('should return 400 when targetLanguage is missing', async () => {
      const res = await request(app)
        .post('/api/translate')
        .send({
          text: 'Hello',
          sourceLanguage: 'en',
        });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
      expect(res.body.message).toContain('Target language');
    });

    // ─── Validation: text too long ────────────────────
    it('should return 400 when text exceeds 5000 characters', async () => {
      const longText = 'a'.repeat(5001);

      const res = await request(app)
        .post('/api/translate')
        .send({
          text: longText,
          sourceLanguage: 'en',
          targetLanguage: 'es',
        });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
      expect(res.body.message).toContain('5,000');
    });

    // ─── Content-Type header ──────────────────────────
    it('should accept JSON content type', async () => {
      translationService.translate.mockResolvedValue({
        translatedText: 'Test',
        provider: 'mymemory',
        sourceLanguage: 'en',
        targetLanguage: 'es',
        timestamp: new Date().toISOString(),
      });

      const res = await request(app)
        .post('/api/translate')
        .set('Content-Type', 'application/json')
        .send({
          text: 'Test',
          sourceLanguage: 'en',
          targetLanguage: 'es',
        });

      expect(res.status).toBe(200);
    });
  });

  // ═══════════════════════════════════════════════════
  // 404 HANDLING
  // ═══════════════════════════════════════════════════

  describe('Unknown Routes', () => {
    it('should return 404 for unknown GET routes', async () => {
      const res = await request(app).get('/api/nonexistent');

      expect(res.status).toBe(404);
      expect(res.body.status).toBe('fail');
      expect(res.body.message).toContain('not found');
    });

    it('should return 404 for unknown POST routes', async () => {
      const res = await request(app).post('/api/nonexistent');

      expect(res.status).toBe(404);
    });
  });

  // ═══════════════════════════════════════════════════
  // ERROR HANDLING
  // ═══════════════════════════════════════════════════

  describe('Error Handling', () => {
    it('should return consistent error format when service throws', async () => {
      const AppError = require('../../src/utils/AppError');
      translationService.translate.mockRejectedValue(
        new AppError('Service unavailable', 503)
      );

      const res = await request(app)
        .post('/api/translate')
        .send({
          text: 'Hello',
          sourceLanguage: 'en',
          targetLanguage: 'es',
        });

      expect(res.status).toBe(503);
      expect(res.body).toHaveProperty('status');
      expect(res.body).toHaveProperty('message');
    });
  });

  // ═══════════════════════════════════════════════════
  // SECURITY HEADERS
  // ═══════════════════════════════════════════════════

  describe('Security Headers', () => {
    it('should include security headers from Helmet', async () => {
      const res = await request(app).get('/api/health');

      // Helmet sets these headers
      expect(res.headers).toHaveProperty('x-content-type-options');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
    });
  });
});
