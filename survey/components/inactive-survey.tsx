'use client';

import { CircleOff } from 'lucide-react';
import { useTranslation } from '../i18n/use-translation';

interface InactiveSurveyProps {
  messageKey?: 'survey.inactive' | 'survey.expired';
}

export function InactiveSurvey({ messageKey = 'survey.inactive' }: InactiveSurveyProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-surface border border-border rounded-xl shadow-sm my-12">
      <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-4">
        <CircleOff className="w-7 h-7" />
      </div>
      <h2 className="text-xl sm:text-2xl font-bold mb-2">
        {t(messageKey)}
      </h2>
      <p className="text-muted text-sm sm:text-base max-w-md">
        {messageKey === 'survey.expired'
          ? 'Bu anketin yanıtlanma süresi dolmuştur.'
          : 'Bu anket bağlantısı kapatılmış veya artık geçerli değildir.'}
      </p>
    </div>
  );
}
