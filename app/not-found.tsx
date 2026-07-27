'use client';

import { SurveyShell } from '@/survey/components/survey-shell';
import { useTranslation } from '@/survey/i18n/use-translation';


function NotFoundContent() {
  const { t } = useTranslation();

  return (
    <div className="w-full flex flex-col items-center justify-center text-center py-8">
      {/* Large 404 number */}
      <p className="font-mono text-[8rem] sm:text-[10rem] font-bold leading-none text-foreground/10 select-none mb-2">
        404
      </p>

      <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mb-3">
        {t('notFound.title')}
      </h1>
      <p className="text-muted text-sm sm:text-base leading-relaxed max-w-sm">
        {t('notFound.message')}
      </p>
    </div>
  );
}


export default function NotFound() {
  return (
    <SurveyShell>
      <NotFoundContent />
    </SurveyShell>
  );
}