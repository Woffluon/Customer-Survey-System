'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/survey/i18n/use-translation';
import { ArrowUpRight, CheckCircle2, FileText } from 'lucide-react';

export function HomeView() {
  const { t } = useTranslation();

  const surveys = [
    {
      slug: 'client-onboarding',
      title: t('home.onboardingTitle'),
      description: t('home.onboardingDesc'),
      badge: 'Onboarding & Discovery',
    },
    {
      slug: 'project-completion',
      title: t('home.completionTitle'),
      description: t('home.completionDesc'),
      badge: 'Feedback & Delivery',
    },
  ];

  return (
    <div className="space-y-10 py-6">
      {/* Header Section */}
      <header className="text-center space-y-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          {t('home.title')}
        </h1>

        <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          {t('home.description')}
        </p>
      </header>

      {/* Surveys List Section */}
      <section aria-label={t('home.activeForms')} className="space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            {t('home.activeForms')}
          </h2>
          <span className="text-xs font-mono text-muted-foreground">
            {t('home.availableCount', { count: surveys.length })}
          </span>
        </div>

        <div className="grid gap-6 sm:grid-cols-1">
          {surveys.map((survey) => (
            <article
              key={survey.slug}
              className="group relative flex flex-col justify-between p-6 rounded-2xl bg-card/95 backdrop-blur-xl border border-border/80 hover:border-primary/50 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-block text-[11px] font-mono font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground">
                    {survey.badge}
                  </span>
                  <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>

                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  <Link href={`/${survey.slug}`} className="focus:outline-none hover:underline">
                    <span className="absolute inset-0" aria-hidden="true" />
                    {survey.title}
                  </Link>
                </h3>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {survey.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5 text-emerald-500 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  {t('home.activeStatus')}
                </span>
                <span className="font-mono text-primary font-medium group-hover:underline">
                  {t('home.startSurvey')} &rarr;
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center pt-6 border-t border-border/40 text-xs text-muted-foreground space-y-1">
        <p>
          © {new Date().getFullYear()} <strong className="text-foreground">Efe Arabacı</strong>. {t('home.rights')}
        </p>
        <p className="text-[11px]">
          {t('home.tagline')}
        </p>
      </footer>
    </div>
  );
}
