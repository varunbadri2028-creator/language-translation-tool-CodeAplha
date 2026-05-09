/**
 * ===========================================
 * COMPONENT: Theme Provider
 * ===========================================
 *
 * WHY THIS FILE EXISTS:
 * - Wraps the app with next-themes ThemeProvider
 * - Enables dark/light mode toggle
 * - Must be a client component (uses React context)
 * - Separate from layout.tsx because layout is a server component
 */

'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
