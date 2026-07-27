'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { LanguageProvider } from '@/survey/i18n/use-translation';
import { LanguageSwitcher } from './language-switcher';
import { ThemeToggle } from './theme-toggle';

const Silk = dynamic(() => import('./silk'), { ssr: false });

export function SurveyShell({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDark = () => document.documentElement.classList.contains('dark');
    setIsDark(checkDark());

    const observer = new MutationObserver(() => {
      setIsDark(checkDark());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

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





