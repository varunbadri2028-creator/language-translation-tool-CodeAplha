/**
 * ===========================================
 * TYPES: Application TypeScript Definitions
 * ===========================================
 *
 * WHY THIS FILE EXISTS:
 * - Defines the shape of data flowing through the app
 * - TypeScript catches data mismatches at compile time
 * - Serves as documentation for what each object looks like
 * - Shared between components, hooks, and services
 */

/** A supported language from the API */
export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

/** Result from a translation request */
export interface TranslationResult {
  translatedText: string;
  provider: string;
  sourceLanguage: string;
  targetLanguage: string;
  timestamp: string;
}

/** A saved translation in history */
export interface TranslationHistoryItem {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLanguage: Language;
  targetLanguage: Language;
  timestamp: string;
  provider: string;
}

/** API response wrapper */
export interface ApiResponse<T> {
  status: 'success' | 'fail' | 'error';
  data?: T;
  message?: string;
}

/** Translation request body */
export interface TranslateRequest {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
}
