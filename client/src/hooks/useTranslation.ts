/**
 * ===========================================
 * HOOK: useTranslation
 * ===========================================
 *
 * WHY THIS FILE EXISTS:
 * - Extracts ALL translation logic from the UI component
 * - Manages loading states, errors, and results
 * - Components just call translate() and render the state
 * - This is the "Custom Hook" pattern — React's way of sharing stateful logic
 *
 * HOW IT CONNECTS:
 * - The main page component uses this hook
 * - It calls translationService for API communication
 * - It calls useHistory to save translations
 */

'use client';

import { useState, useCallback } from 'react';
import { translateText } from '@/services/translationService';
import { TranslationResult } from '@/types';

interface UseTranslationReturn {
  result: TranslationResult | null;
  isLoading: boolean;
  error: string | null;
  translate: (
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ) => Promise<TranslationResult | null>;
  clearResult: () => void;
  clearError: () => void;
}

export function useTranslation(): UseTranslationReturn {
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translate = useCallback(
    async (
      text: string,
      sourceLanguage: string,
      targetLanguage: string
    ): Promise<TranslationResult | null> => {
      // Reset state
      setError(null);
      setIsLoading(true);

      try {
        const translationResult = await translateText({
          text,
          sourceLanguage,
          targetLanguage,
        });

        setResult(translationResult);
        return translationResult;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'An unexpected error occurred.';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clearResult = useCallback(() => setResult(null), []);
  const clearError = useCallback(() => setError(null), []);

  return {
    result,
    isLoading,
    error,
    translate,
    clearResult,
    clearError,
  };
}
