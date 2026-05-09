/**
 * ===========================================
 * HOOK: useSpeechRecognition
 * ===========================================
 *
 * WHY THIS FILE EXISTS:
 * - Wraps the Web Speech API (SpeechRecognition)
 * - Allows users to use their microphone to input text (Speech-to-Text)
 * - Handles browser compatibility (webkit prefix for Chrome/Safari)
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  isSupported: boolean;
  startListening: (language: string) => void;
  stopListening: () => void;
}

export function useSpeechRecognition(
  onResult: (transcript: string) => void
): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check for browser support
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        setIsSupported(true);
        recognitionRef.current = new SpeechRecognition();
        // Configure continuous listening and interim results if desired
        recognitionRef.current.continuous = false; // Stop after they pause
        recognitionRef.current.interimResults = false; // Only final results
        
        recognitionRef.current.onstart = () => {
          setIsListening(true);
        };
        
        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          onResult(transcript);
        };
        
        recognitionRef.current.onerror = (event: any) => {
          setIsListening(false);
          
          if (event.error === 'not-allowed') {
            toast.error('Microphone access denied. Please allow browser permissions.');
          } else if (event.error === 'audio-capture') {
            toast.error('No microphone found, or macOS System Settings is blocking access.', {
              description: 'Check System Settings > Privacy & Security > Microphone'
            });
          } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
            toast.error(`Microphone error: ${event.error}`);
          }
        };
        
        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, [onResult]);

  const startListening = useCallback(
    (language: string) => {
      if (!isSupported || !recognitionRef.current) {
        toast.error('Speech recognition is not supported in your browser.');
        return;
      }
      
      try {
        // Set language for better accuracy based on selected source language
        recognitionRef.current.lang = language;
        recognitionRef.current.start();
      } catch (e) {
        // Handle case where it's already started
        console.error('Failed to start recognition', e);
      }
    },
    [isSupported]
  );

  const stopListening = useCallback(() => {
    if (isSupported && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isSupported]);

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
  };
}
