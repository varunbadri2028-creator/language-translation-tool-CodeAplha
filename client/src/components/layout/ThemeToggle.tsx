/**
 * ===========================================
 * COMPONENT: Theme Toggle
 * ===========================================
 *
 * WHY THIS FILE EXISTS:
 * - Provides the dark/light mode toggle button in the header
 * - Uses next-themes to read and set the current theme
 * - Animated icon transition between sun and moon
 */

'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch — theme is only known on the client
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button className="flex items-center justify-center h-9 w-9 rounded-full text-primary hover:bg-primary/10 transition-colors">
        <Sun className="h-5 w-5" />
      </button>
    );
  }

  return (
    <button
      id="theme-toggle"
      className="flex items-center justify-center h-9 w-9 rounded-full text-primary hover:bg-primary/10 transition-colors cursor-pointer"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 transition-transform duration-300" />
      ) : (
        <Moon className="h-5 w-5 transition-transform duration-300" />
      )}
    </button>
  );
}
