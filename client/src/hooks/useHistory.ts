/**
 * ===========================================
 * HOOK: useHistory
 * ===========================================
 *
 * WHY THIS FILE EXISTS:
 * - Manages translation history in localStorage
 * - Persists across page refreshes (data survives browser close)
 * - Keeps a maximum of 50 items to avoid filling up storage
 * - Provides add, remove, and clear operations
 *
 * HOW IT CONNECTS:
 * - Used by the main page to save translations after they complete
 * - Used by the HistoryPanel component to display past translations
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { TranslationHistoryItem } from '@/types';

const HISTORY_KEY = 'linguatranslate_history';
const MAX_HISTORY_ITEMS = 50;

interface UseHistoryReturn {
  history: TranslationHistoryItem[];
  addToHistory: (item: Omit<TranslationHistoryItem, 'id'>) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
}

export function useHistory(): UseHistoryReturn {
  const [history, setHistory] = useState<TranslationHistoryItem[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch {
      // If localStorage is corrupted, start fresh
      localStorage.removeItem(HISTORY_KEY);
    }
  }, []);

  // Save to localStorage whenever history changes
  const saveHistory = useCallback((items: TranslationHistoryItem[]) => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
    } catch {
      // localStorage might be full — silently fail
    }
  }, []);

  const addToHistory = useCallback(
    (item: Omit<TranslationHistoryItem, 'id'>) => {
      const newItem: TranslationHistoryItem = {
        ...item,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };

      setHistory((prev) => {
        const updated = [newItem, ...prev].slice(0, MAX_HISTORY_ITEMS);
        saveHistory(updated);
        return updated;
      });
    },
    [saveHistory]
  );

  const removeFromHistory = useCallback(
    (id: string) => {
      setHistory((prev) => {
        const updated = prev.filter((item) => item.id !== id);
        saveHistory(updated);
        return updated;
      });
    },
    [saveHistory]
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  }, []);

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
  };
}
