/**
 * ===========================================
 * TEST: Languages Configuration
 * ===========================================
 *
 * WHY THIS TEST EXISTS:
 * - The languages list is the source of truth for the entire app
 * - If a language is malformed (missing code, name, or nativeName),
 *   the frontend dropdowns will break
 * - This test acts as a "contract test" — ensuring the data shape is correct
 *
 * WHAT WE TEST:
 * 1. Languages array is not empty
 * 2. Each language has required properties
 * 3. Language codes are unique (no duplicates)
 * 4. Common languages are present (sanity check)
 */

const languages = require('../../src/config/languages');

describe('Languages Configuration', () => {
  // ─── Test 1: Not empty ────────────────────────────
  it('should contain at least 10 languages', () => {
    expect(languages.length).toBeGreaterThanOrEqual(10);
  });

  // ─── Test 2: Data shape ───────────────────────────
  it('every language should have code, name, and nativeName', () => {
    languages.forEach((lang) => {
      expect(lang).toHaveProperty('code');
      expect(lang).toHaveProperty('name');
      expect(lang).toHaveProperty('nativeName');

      // All must be non-empty strings
      expect(typeof lang.code).toBe('string');
      expect(lang.code.length).toBeGreaterThanOrEqual(2);
      expect(typeof lang.name).toBe('string');
      expect(lang.name.length).toBeGreaterThan(0);
      expect(typeof lang.nativeName).toBe('string');
      expect(lang.nativeName.length).toBeGreaterThan(0);
    });
  });

  // ─── Test 3: No duplicate codes ───────────────────
  it('should not have duplicate language codes', () => {
    const codes = languages.map((l) => l.code);
    const uniqueCodes = new Set(codes);
    expect(uniqueCodes.size).toBe(codes.length);
  });

  // ─── Test 4: Common languages present ─────────────
  it('should include common languages', () => {
    const codes = languages.map((l) => l.code);
    const requiredLanguages = ['en', 'es', 'fr', 'de', 'ja', 'zh', 'hi', 'ar'];

    requiredLanguages.forEach((code) => {
      expect(codes).toContain(code);
    });
  });

  // ─── Test 5: Language codes are lowercase ─────────
  it('should have lowercase language codes', () => {
    languages.forEach((lang) => {
      expect(lang.code).toBe(lang.code.toLowerCase());
    });
  });
});
