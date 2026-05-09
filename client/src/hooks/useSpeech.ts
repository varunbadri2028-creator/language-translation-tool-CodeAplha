/**
 * ===========================================
 * HOOK: useSpeech
 * ===========================================
 *
 * WHY THIS FILE EXISTS:
 * - Wraps the Web Speech API (SpeechSynthesis)
 * - Handles browser compatibility (not all browsers support it)
 * - Provides simple speak/stop functions
 * - Manages speaking state
 *
 * HOW IT CONNECTS:
 * - Used by the translation output panel
 * - User clicks the speaker icon to hear text spoken aloud
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

interface UseSpeechReturn {
  speak: (text: string, lang?: string) => void;
  stop: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
}

export function useSpeech(): UseSpeechReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setIsSupported(
      typeof window !== 'undefined' && 'speechSynthesis' in window
    );
  }, []);

  const speak = useCallback(
    (text: string, lang: string = 'en') => {
      if (!isSupported) return;

      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }

      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Use standard format (e.g., 'es-ES' or 'en-US' if possible, otherwise 'en')
        utterance.lang = lang;
        utterance.rate = 0.95;
        utterance.pitch = 1;

        utterance.onstart = () => setIsSpeaking(true);
        
        utterance.onend = () => {
          setIsSpeaking(false);
          // Clean up the global reference after speaking
          (window as any)._utterances = (window as any)._utterances?.filter((u: any) => u !== utterance);
        };
        
        utterance.onerror = (e) => {
          console.error("Speech Synthesis Error:", e.error || 'Unknown error');
          setIsSpeaking(false);
          (window as any)._utterances = (window as any)._utterances?.filter((u: any) => u !== utterance);
        };

        // MAJOR FIX FOR MACOS/SAFARI/CHROME: 
        // The utterance object gets garbage collected before the speech finishes, throwing a silent error.
        // We must push it to a global array to keep the reference alive in memory.
        if (!(window as any)._utterances) {
          (window as any)._utterances = [];
        }
        (window as any)._utterances.push(utterance);
        utteranceRef.current = utterance;

        window.speechSynthesis.speak(utterance);
      }, 50);
    },
    [isSupported]
  );

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
  };
}
