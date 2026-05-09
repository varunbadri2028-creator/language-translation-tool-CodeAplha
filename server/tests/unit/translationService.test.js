/**
 * ===========================================
 * TEST: Translation Service (Unit Tests)
 * ===========================================
 *
 * WHY THIS TEST EXISTS:
 * - The translation service is the CORE business logic
 * - We mock the external API (axios) so tests are:
 *   1. Fast (no network calls)
 *   2. Reliable (don't depend on external service being up)
 *   3. Free (don't consume API quota)
 *
 * MOCKING EXPLAINED:
 * - jest.mock('axios') replaces the real axios with a fake
 * - We control what the fake returns using mockResolvedValue()
 * - This lets us test ALL code paths: success, failure, timeout
 *
 * WHAT WE TEST:
 * 1. Successful translation (MyMemory provider)
 * 2. API error handling (quota exceeded)
 * 3. Network timeout handling
 * 4. Invalid provider handling
 * 5. Response format is correct
 */

const axios = require('axios');
const translationService = require('../../src/services/translationService');
const AppError = require('../../src/utils/AppError');

// ─── Mock axios so we never make real API calls ─────
jest.mock('axios');

// ─── Mock config to use mymemory provider ───────────
jest.mock('../../src/config', () => ({
  translationProvider: 'mymemory',
  libreTranslate: { url: 'https://libretranslate.com', apiKey: '' },
  googleTranslate: { apiKey: '' },
  isDev: true,
}));

describe('Translation Service', () => {
  // Reset mocks before each test (clean slate)
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── Test 1: Successful translation ───────────────
  describe('MyMemory Provider', () => {
    it('should return translated text on success', async () => {
      // Arrange: mock axios to return a successful response
      axios.get.mockResolvedValue({
        data: {
          responseData: { translatedText: 'Hola mundo' },
          responseStatus: 200,
          responseDetails: '',
          quotaFinished: false,
        },
      });

      // Act: call the service
      const result = await translationService.translate('Hello world', 'en', 'es');

      // Assert: check the result
      expect(result.translatedText).toBe('Hola mundo');
      expect(result.provider).toBe('mymemory');
      expect(result.sourceLanguage).toBe('en');
      expect(result.targetLanguage).toBe('es');
      expect(result.timestamp).toBeDefined();

      // Verify axios was called correctly
      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(axios.get).toHaveBeenCalledWith(
        'https://api.mymemory.translated.net/get',
        expect.objectContaining({
          params: { q: 'Hello world', langpair: 'en|es' },
          timeout: 10000,
        })
      );
    });

    // ─── Test 2: Quota exceeded ───────────────────────
    it('should throw 429 when daily quota is reached', async () => {
      axios.get.mockResolvedValue({
        data: {
          responseData: { translatedText: '' },
          responseStatus: 200,
          responseDetails: '',
          quotaFinished: true,
        },
      });

      await expect(
        translationService.translate('Hello', 'en', 'es')
      ).rejects.toThrow(AppError);

      await expect(
        translationService.translate('Hello', 'en', 'es')
      ).rejects.toMatchObject({ statusCode: 429 });
    });

    // ─── Test 3: API returns non-200 status ───────────
    it('should throw 400 when API returns a non-200 status', async () => {
      axios.get.mockResolvedValue({
        data: {
          responseData: null,
          responseStatus: 400,
          responseDetails: 'INVALID LANGUAGE PAIR',
          quotaFinished: false,
        },
      });

      await expect(
        translationService.translate('Hello', 'en', 'xx')
      ).rejects.toThrow('INVALID LANGUAGE PAIR');
    });
  });

  // ─── Test 4: Network errors ─────────────────────────
  describe('Error Handling', () => {
    it('should throw 504 on timeout', async () => {
      const timeoutError = new Error('timeout');
      timeoutError.code = 'ECONNABORTED';
      axios.get.mockRejectedValue(timeoutError);

      await expect(
        translationService.translate('Hello', 'en', 'es')
      ).rejects.toMatchObject({
        statusCode: 504,
        message: 'Translation request timed out. Please try again.',
      });
    });

    it('should throw 502 when external API returns an error response', async () => {
      const apiError = new Error('API Error');
      apiError.response = { status: 500, data: { error: 'Internal error' } };
      axios.get.mockRejectedValue(apiError);

      await expect(
        translationService.translate('Hello', 'en', 'es')
      ).rejects.toMatchObject({ statusCode: 502 });
    });

    it('should throw 503 on network failure (no response)', async () => {
      const networkError = new Error('Network Error');
      networkError.request = {}; // Has request but no response
      axios.get.mockRejectedValue(networkError);

      await expect(
        translationService.translate('Hello', 'en', 'es')
      ).rejects.toMatchObject({ statusCode: 503 });
    });
  });

  // ─── Test 5: Response format ────────────────────────
  describe('Response Format', () => {
    it('should return an object with the correct shape', async () => {
      axios.get.mockResolvedValue({
        data: {
          responseData: { translatedText: 'Bonjour' },
          responseStatus: 200,
          responseDetails: '',
          quotaFinished: false,
        },
      });

      const result = await translationService.translate('Hello', 'en', 'fr');

      // Check response shape
      expect(result).toEqual(
        expect.objectContaining({
          translatedText: expect.any(String),
          provider: expect.any(String),
          sourceLanguage: expect.any(String),
          targetLanguage: expect.any(String),
          timestamp: expect.any(String),
        })
      );

      // Timestamp should be a valid ISO date
      expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
    });
  });
});
