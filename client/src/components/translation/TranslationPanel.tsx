'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowRightLeft, Copy, Volume2, VolumeX, Loader2, Sparkles, RotateCcw, Languages, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { LanguageSelector } from './LanguageSelector';
import { Language, TranslationResult } from '@/types';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

interface TranslationPanelProps {
  languages: Language[];
  sourceLanguage: string;
  targetLanguage: string;
  onSourceLanguageChange: (lang: string) => void;
  onTargetLanguageChange: (lang: string) => void;
  onTranslate: (text: string) => void;
  onSwapLanguages: () => void;
  result: TranslationResult | null;
  isLoading: boolean;
  error: string | null;
  onSpeak: (text: string, lang: string) => void;
  onStopSpeech: () => void;
  isSpeaking: boolean;
  isSpeechSupported: boolean;
}

const MAX_CHARS = 5000;

export function TranslationPanel({
  languages,
  sourceLanguage,
  targetLanguage,
  onSourceLanguageChange,
  onTargetLanguageChange,
  onTranslate,
  onSwapLanguages,
  result,
  isLoading,
  error,
  onSpeak,
  onStopSpeech,
  isSpeaking,
  isSpeechSupported,
}: TranslationPanelProps) {
  const [sourceText, setSourceText] = useState('');
  const [charCount, setCharCount] = useState(0);

  const handleVoiceInput = useCallback((transcript: string) => {
    setSourceText((prev) => {
      const newText = prev ? `${prev} ${transcript}` : transcript;
      return newText.slice(0, MAX_CHARS);
    });
  }, []);

  const {
    isListening,
    isSupported: isSpeechRecSupported,
    startListening,
    stopListening
  } = useSpeechRecognition(handleVoiceInput);

  useEffect(() => {
    setCharCount(sourceText.length);
  }, [sourceText]);

  const handleTranslate = () => {
    if (!sourceText.trim()) {
      toast.error('Please enter text to translate');
      return;
    }
    if (sourceLanguage === targetLanguage) {
      toast.error('Source and target languages must be different');
      return;
    }
    onTranslate(sourceText.trim());
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Failed to copy text');
    }
  };

  const handleClear = () => {
    setSourceText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleTranslate();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="w-full flex flex-col gap-6"
    >
      {/* Language Selection Bar (iOS Dynamic Island Vibe) */}
      <div className="mx-auto flex w-full max-w-3xl flex-col sm:flex-row items-center gap-3 p-3 glass-panel rounded-2xl apple-shadow">
        <div className="w-full flex-1">
          <LanguageSelector
            id="source-language-select"
            languages={languages}
            value={sourceLanguage}
            onChange={onSourceLanguageChange}
            label="Translate from"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95, rotate: 180 }}
          transition={{ duration: 0.2 }}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary/80 text-foreground hover:bg-secondary cursor-pointer transition-colors"
          onClick={onSwapLanguages}
          aria-label="Swap languages"
        >
          <ArrowRightLeft className="h-5 w-5" />
        </motion.button>

        <div className="w-full flex-1">
          <LanguageSelector
            id="target-language-select"
            languages={languages}
            value={targetLanguage}
            onChange={onTargetLanguageChange}
            label="Translate to"
          />
        </div>
      </div>

      {/* Translation Area (Stacked cards like Apple UI) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-6xl mx-auto w-full">
        
        {/* Source Card */}
        <div className="flex flex-col glass-panel rounded-2xl overflow-hidden apple-shadow transition-all duration-300 focus-within:ring-2 focus-within:ring-primary/20">
          <div className="p-6 pb-2 flex-1 relative">
            <textarea
              id="source-text-input"
              placeholder="Enter text..."
              value={sourceText}
              onChange={(e) => {
                if (e.target.value.length <= MAX_CHARS) setSourceText(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              className="min-h-[200px] w-full resize-none border-0 bg-transparent p-0 text-[1.2rem] leading-relaxed tracking-tight focus:outline-none focus:ring-0 placeholder:text-muted-foreground/40 font-medium"
              aria-label="Text to translate"
            />
          </div>
          
          {/* Action Bar (Source) */}
          <div className="flex items-center justify-between p-4 bg-secondary/30">
            <div className="flex items-center gap-1">
              {isSpeechRecSupported && (
                <button
                  className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                    isListening 
                      ? 'bg-destructive/20 text-destructive animate-pulse' 
                      : 'text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
                  }`}
                  onClick={() => isListening ? stopListening() : startListening(sourceLanguage)}
                  aria-label={isListening ? 'Stop recording' : 'Start recording'}
                >
                  {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </button>
              )}
              {isSpeechSupported && (
                <button
                  className="h-10 w-10 rounded-full flex items-center justify-center text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  onClick={() => isSpeaking ? onStopSpeech() : onSpeak(sourceText, sourceLanguage)}
                  disabled={!sourceText.trim()}
                  aria-label={isSpeaking ? 'Stop' : 'Listen'}
                >
                  {isSpeaking ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </button>
              )}
              {sourceText && (
                <button
                  className="h-10 w-10 rounded-full flex items-center justify-center text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-colors"
                  onClick={handleClear}
                  aria-label="Clear text"
                >
                  <RotateCcw className="h-5 w-5" />
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <span className={`text-[11px] font-medium ${charCount > MAX_CHARS * 0.9 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
              </span>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleTranslate}
                disabled={isLoading || !sourceText.trim()}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-semibold shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-opacity cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                <span>Translate</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Target Card */}
        <div className="flex flex-col glass-panel rounded-2xl overflow-hidden apple-shadow bg-secondary/10 dark:bg-card">
          <div className="p-6 pb-2 flex-1 min-h-[200px]">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full gap-4 text-primary"
                >
                  <Loader2 className="h-8 w-8 animate-spin" />
                </motion.div>
              ) : error ? (
                <motion.div 
                  key="error"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full text-center"
                >
                  <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-2">
                    !
                  </div>
                  <p className="text-sm font-medium text-destructive">{error}</p>
                </motion.div>
              ) : result ? (
                <motion.div 
                  key="result"
                  initial={{ opacity: 0, filter: 'blur(4px)' }} 
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-[1.2rem] leading-relaxed tracking-tight font-medium text-foreground whitespace-pre-wrap">
                    {result.translatedText}
                  </p>
                </motion.div>
              ) : (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground/40"
                >
                  <Languages className="h-10 w-10 opacity-50" />
                  <p className="text-sm font-medium">Translation will appear here</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Bar (Target) */}
          <div className="flex items-center justify-between p-4 bg-secondary/30">
            <div className="flex items-center gap-1">
              {isSpeechSupported && (
                <button
                  className="h-10 w-10 rounded-full flex items-center justify-center text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  onClick={() => result && (isSpeaking ? onStopSpeech() : onSpeak(result.translatedText, targetLanguage))}
                  disabled={!result}
                  aria-label="Listen"
                >
                  {isSpeaking ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </button>
              )}
              <button
                className="h-10 w-10 rounded-full flex items-center justify-center text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                onClick={() => result && handleCopy(result.translatedText)}
                disabled={!result}
                aria-label="Copy"
              >
                <Copy className="h-5 w-5" />
              </button>
            </div>
            
            {result && (
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest bg-secondary px-3 py-1 rounded-full">
                {result.provider}
              </span>
            )}
          </div>
        </div>

      </div>
    </motion.div>
  );
}
