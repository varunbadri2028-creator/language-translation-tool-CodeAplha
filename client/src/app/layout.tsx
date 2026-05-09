import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

export const metadata: Metadata = {
  title: 'Translate',
  description: 'AI-Powered Language Translation',
  appleWebApp: {
    title: 'Translate',
    statusBarStyle: 'black-translucent',
    capable: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // We remove explicit fonts to rely on the system font stack 
  // (-apple-system, BlinkMacSystemFont) which renders as SF Pro on Apple devices.
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col font-sans selection:bg-primary/20 selection:text-primary">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          <TooltipProvider delay={300}>
            {children}
          </TooltipProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              className: 'glass-panel border-none shadow-lg rounded-2xl',
              style: {
                background: 'var(--glass-bg)',
                color: 'var(--foreground)',
                backdropFilter: 'blur(20px)',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
