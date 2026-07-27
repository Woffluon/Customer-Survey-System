'use client';

import { useTranslation } from '../i18n/use-translation';

interface ProgressBarProps {
  currentStep: number; // 0-indexed
  totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const { t } = useTranslation();
  const percentage = Math.min(
    Math.max(Math.round(((currentStep + 1) / totalSteps) * 100), 0),
    100
  );

  return (
    <div className="w-full space-y-2 mb-6">
      <div className="flex justify-between items-center text-xs font-mono text-muted">
        <span>{t('form.step', { current: currentStep + 1, total: totalSteps })}</span>
        <span>%{percentage}</span>
      </div>
      <div className="w-full h-1.5 bg-surface border border-border/50 rounded-full overflow-hidden">
        <div
          className="h-full bg-accent transition-all duration-300 ease-out rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
