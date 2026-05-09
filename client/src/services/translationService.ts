/**
 * ===========================================
 * SERVICE: Translation API Service
 * ===========================================
 *
 * WHY THIS FILE EXISTS:
 * - Centralizes ALL HTTP calls to the backend in one place
 * - Components never call fetch() directly
 * - Easy to mock for testing
 * - If the API URL changes, only this file needs updating
 *
 * HOW IT CONNECTS:
 * - useTranslation hook calls these functions
 * - Returns typed responses using our TypeScript interfaces
 * - Handles API errors and transforms them into user-friendly messages
 */

import {
  ApiResponse,
  Language,
  TranslateRequest,
  TranslationResult,
} from '@/types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Fetches the list of supported languages from the backend
 */
export async function getLanguages(): Promise<Language[]> {
  const response = await fetch(`${API_BASE_URL}/languages`);

  if (!response.ok) {
    throw new Error('Failed to fetch languages');
  }

  const data: ApiResponse<{ languages: Language[]; count: number }> =
    await response.json();

  if (data.status !== 'success' || !data.data) {
    throw new Error('Invalid response from languages API');
  }

  return data.data.languages;
}

/**
 * Sends a translation request to the backend
 */
export async function translateText(
  request: TranslateRequest
): Promise<TranslationResult> {
  const response = await fetch(`${API_BASE_URL}/translate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  const data: ApiResponse<TranslationResult> = await response.json();

  if (!response.ok || data.status !== 'success' || !data.data) {
    throw new Error(data.message || 'Translation failed. Please try again.');
  }

  return data.data;
}
