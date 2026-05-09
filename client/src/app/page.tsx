'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { TranslationPanel } from '@/components/translation/TranslationPanel';
import { HistoryPanel } from '@/components/translation/HistoryPanel';
import { useTranslation } from '@/hooks/useTranslation';
import { useHistory } from '@/hooks/useHistory';
import { useSpeech } from '@/hooks/useSpeech';
import { getLanguages } from '@/services/translationService';
import { Language, TranslationHistoryItem } from '@/types';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

// Fallback languages in case the API is not available
const FALLBACK_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
];

export default function HomePage() {
  const [languages, setLanguages] = useState<Language[]>(FALLBACK_LANGUAGES);
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const { result, isLoading, error, translate } = useTranslation();
  const { history, addToHistory, removeFromHistory, clearHistory } = useHistory();
  const { speak, stop, isSpeaking, isSupported: isSpeechSupported } = useSpeech();

  useEffect(() => {
    async function fetchLanguages() {
      try {
        const langs = await getLanguages();
        setLanguages(langs);
      } catch {
        // Silently fall back to hardcoded languages
      }
    }
    fetchLanguages();
  }, []);

  const handleTranslate = useCallback(
    async (text: string) => {
      const translationResult = await translate(text, sourceLanguage, targetLanguage);

      if (translationResult) {
        const sourceLang = languages.find((l) => l.code === sourceLanguage);
        const targetLang = languages.find((l) => l.code === targetLanguage);

        addToHistory({
          sourceText: text,
          translatedText: translationResult.translatedText,
          sourceLanguage: sourceLang || { code: sourceLanguage, name: sourceLanguage, nativeName: sourceLanguage },
          targetLanguage: targetLang || { code: targetLanguage, name: targetLanguage, nativeName: targetLanguage },
          timestamp: translationResult.timestamp,
          provider: translationResult.provider,
        });

        // Use a more subtle toast for iOS feel
        toast('Translated successfully');
      }
    },
    [translate, sourceLanguage, targetLanguage, languages, addToHistory]
  );

  const handleSwapLanguages = useCallback(() => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
  }, [sourceLanguage, targetLanguage]);

  const handleHistorySelect = useCallback(
    (item: TranslationHistoryItem) => {
      setSourceLanguage(item.sourceLanguage.code);
      setTargetLanguage(item.targetLanguage.code);
      handleTranslate(item.sourceText);
    },
    [handleTranslate]
  );

  return (
    <div className="relative min-h-screen flex flex-col bg-background selection:bg-primary/20 selection:text-primary">
      {/* iOS styled subtle background glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <Header
        onHistoryClick={() => setIsHistoryOpen(true)}
        historyCount={history.length}
      />

      <main className="flex-1 flex flex-col items-center px-4 sm:px-6 pt-6 pb-12 z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="w-full max-w-5xl space-y-8 flex flex-col items-center"
        >
          {/* Minimalist Header */}
          <div className="text-center space-y-2 mt-4 mb-2">
            <h2 className="text-4xl font-semibold tracking-tight text-foreground">
              Translate
            </h2>
            <p className="text-[15px] font-medium text-muted-foreground">
              Select languages and enter text.
            </p>
          </div>

          <TranslationPanel
            languages={languages}
            sourceLanguage={sourceLanguage}
            targetLanguage={targetLanguage}
            onSourceLanguageChange={setSourceLanguage}
            onTargetLanguageChange={setTargetLanguage}
            onTranslate={handleTranslate}
            onSwapLanguages={handleSwapLanguages}
            result={result}
            isLoading={isLoading}
            error={error}
            onSpeak={speak}
            onStopSpeech={stop}
            isSpeaking={isSpeaking}
            isSpeechSupported={isSpeechSupported}
          />
        </motion.div>
      </main>

      <HistoryPanel
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelect={handleHistorySelect}
        onDelete={removeFromHistory}
        onClear={clearHistory}
      />
    </div>
  );
}
