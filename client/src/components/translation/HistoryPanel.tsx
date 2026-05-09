'use client';

import { Trash2, Clock, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { TranslationHistoryItem } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: TranslationHistoryItem[];
  onSelect: (item: TranslationHistoryItem) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}

export function HistoryPanel({
  isOpen,
  onClose,
  history,
  onSelect,
  onDelete,
  onClear,
}: HistoryPanelProps) {
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return then.toLocaleDateString();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col bg-secondary/30 backdrop-blur-3xl border-l border-glass-border">
        <SheetHeader className="px-6 py-5 border-b border-border/20 bg-background/50 backdrop-blur-lg">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-xl font-semibold tracking-tight text-foreground">
              History
            </SheetTitle>
            {history.length > 0 && (
              <button
                className="text-[13px] font-medium text-primary hover:opacity-70 transition-opacity cursor-pointer"
                onClick={onClear}
              >
                Clear All
              </button>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 px-4 py-4">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-4 shadow-sm">
                <Clock className="h-7 w-7 text-muted-foreground/50" />
              </div>
              <p className="text-[15px] font-medium text-foreground">
                No Recent Translations
              </p>
              <p className="text-[13px] text-muted-foreground mt-1">
                Translations will appear here.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 pb-8">
              <AnimatePresence>
                {history.map((item) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="relative group bg-card rounded-2xl p-4 apple-shadow cursor-pointer border border-glass-border hover:bg-muted/50 transition-colors"
                         onClick={() => {
                           onSelect(item);
                           onClose();
                         }}>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                          <span>{item.sourceLanguage.code}</span>
                          <span className="text-border">→</span>
                          <span className="text-primary">{item.targetLanguage.code}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] font-medium text-muted-foreground/60">
                            {formatTimeAgo(item.timestamp)}
                          </span>
                          <button
                            className="h-6 w-6 flex items-center justify-center rounded-full bg-secondary/50 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive/10 hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(item.id);
                            }}
                            aria-label="Delete"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-[15px] font-medium text-foreground line-clamp-2 leading-snug">
                          {item.sourceText}
                        </p>
                        <p className="text-[15px] text-muted-foreground line-clamp-3 leading-snug">
                          {item.translatedText}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
