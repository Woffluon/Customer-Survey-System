'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { LanguageProvider } from '@/survey/i18n/use-translation';
import { ThemeProvider, useTheme } from '@/survey/lib/theme-context';
import { LanguageSwitcher } from './language-switcher';
import { ThemeToggle } from './theme-toggle';

const Silk = dynamic(() => import('./silk'), { ssr: false });

function ShellInner({ children }: { children?: React.ReactNode }) {
  const { isDark } = useTheme();

  return (
    <LanguageProvider defaultLanguage="tr">
      {/* Full-viewport Silk background — fixed, behind everything */}
      <div
        aria-hidden="true"
        className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
      >
        <Silk
          speed={1}
          scale={1}
          color={isDark ? '#36323B' : '#ECEAE4'}
          noiseIntensity={1.5}
          rotation={0}
        />
        {/* Readability overlay mask */}
        <div className="absolute inset-0 bg-background/20 pointer-events-none" />
      </div>

      {/* Minimal floating controls — top-right */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      {/* Page content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-16 sm:px-6">
        <main className="w-full max-w-2xl">
          {children}
        </main>
      </div>
    </LanguageProvider>
  );
}

export function SurveyShell({ children }: { children?: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ShellInner>{children}</ShellInner>
    </ThemeProvider>
  );
}
