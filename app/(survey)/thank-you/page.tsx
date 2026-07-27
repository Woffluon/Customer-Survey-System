'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from '@/survey/i18n/use-translation';

function ThankYouContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const title = searchParams.get('title');

  return (
    <div className="w-full text-center py-8">
      {/* Check mark */}
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-border bg-surface/80 backdrop-blur-sm mb-6">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-3">
        {t('thankYou.title')}
      </h1>

      <p className="text-muted text-sm sm:text-base leading-relaxed max-w-sm mx-auto">
        {title ? t('thankYou.message', { title }) : t('thankYou.generic')}
      </p>
    </div>
  );
}


export default function ThankYouPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <div className="w-6 h-6 rounded-full border border-border border-t-foreground animate-spin" />
        </div>
      }
    >
      <ThankYouContent />
    </Suspense>
  );
}