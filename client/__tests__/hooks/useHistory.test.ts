/**
 * ===========================================
 * TEST: useHistory Hook
 * ===========================================
 */
import { renderHook, act } from '@testing-library/react';
import { useHistory } from '../../src/hooks/useHistory';
import { TranslationHistoryItem } from '../../src/types';

// Mock localStorage
const mockStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockStorage,
});

const mockItem: TranslationHistoryItem = {
  id: '123',
  sourceText: 'Hello',
  translatedText: 'Hola',
  sourceLanguage: { code: 'en', name: 'English', nativeName: 'English' },
  targetLanguage: { code: 'es', name: 'Spanish', nativeName: 'Español' },
  timestamp: new Date().toISOString(),
  provider: 'mymemory',
};

describe('useHistory Hook', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('should initialize with empty history', () => {
    const { result } = renderHook(() => useHistory());
    expect(result.current.history).toEqual([]);
  });

  it('should add an item to history', () => {
    const { result } = renderHook(() => useHistory());

    act(() => {
      // Omit 'id' as the hook will generate it
      const { id, ...itemWithoutId } = mockItem;
      result.current.addToHistory(itemWithoutId as any);
    });

    expect(result.current.history.length).toBe(1);
    expect(result.current.history[0].sourceText).toBe('Hello');
    expect(result.current.history[0].id).toBeDefined();

    // Verify it was saved to localStorage
    const saved = JSON.parse(window.localStorage.getItem('linguatranslate_history') || '[]');
    expect(saved.length).toBe(1);
    expect(saved[0].sourceText).toBe('Hello');
  });

  it('should limit history to 50 items', () => {
    const { result } = renderHook(() => useHistory());

    act(() => {
      for (let i = 0; i < 55; i++) {
        result.current.addToHistory({
          ...mockItem,
          sourceText: `Hello ${i}`,
          translatedText: `Hola ${i}`,
        } as any);
      }
    });

    expect(result.current.history.length).toBe(50);
    // The most recent one (Hello 54) should be first
    expect(result.current.history[0].sourceText).toBe('Hello 54');
  });

  it('should clear history', () => {
    const { result } = renderHook(() => useHistory());

    act(() => {
      const { id, ...itemWithoutId } = mockItem;
      result.current.addToHistory(itemWithoutId as any);
    });

    expect(result.current.history.length).toBe(1);

    act(() => {
      result.current.clearHistory();
    });

    expect(result.current.history.length).toBe(0);
    expect(window.localStorage.getItem('linguatranslate_history')).toBeNull();
  });
});
