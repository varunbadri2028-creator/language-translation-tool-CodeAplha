'use client';

import { History, ExternalLink } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { motion } from 'framer-motion';

interface HeaderProps {
  onHistoryClick: () => void;
  historyCount: number;
}

export function Header({ onHistoryClick, historyCount }: HeaderProps) {
  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      className="sticky top-0 z-50 w-full glass-panel border-b border-border/40"
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* iOS style centered-like but left-aligned title */}
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Translate
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onHistoryClick}
            className="relative flex items-center justify-center h-9 w-9 rounded-full text-primary hover:bg-primary/10 transition-colors"
            aria-label="History"
          >
            <History className="h-5 w-5" />
            {historyCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                {historyCount > 99 ? '99+' : historyCount}
              </span>
            )}
          </button>

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center h-9 w-9 rounded-full text-primary hover:bg-primary/10 transition-colors"
            aria-label="GitHub Repository"
          >
            <ExternalLink className="h-5 w-5" />
          </a>

          <ThemeToggle />
        </div>
      </div>
    </motion.header>
  );
}
