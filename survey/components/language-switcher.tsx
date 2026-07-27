'use client';

import { useTranslation } from '../i18n/use-translation';
import { Language } from '../lib/types';
import { cn } from '../lib/utils';

export function LanguageSwitcher({ className }: { className?: string }) {
  const { language, setLanguage } = useTranslation();

  const toggleLang = (lang: Language) => {
    if (language !== lang) {
      setLanguage(lang);
    }
  };

  return (
    <div className={cn('flex items-center space-x-1 font-mono text-xs tracking-wider', className)}>
      <button
        type="button"
        onClick={() => toggleLang('tr')}
        className={cn(
          'px-3 py-2 min-w-[44px] min-h-[44px] inline-flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 rounded-lg font-semibold transition-colors',
          language === 'tr' ? 'bg-foreground text-background' : 'bg-surface text-muted hover:text-foreground border border-border'
        )}
        aria-label="Türkçe diline geç"
      >
        TR
      </button>
      <span className="text-muted font-bold px-0.5">/</span>
      <button
        type="button"
        onClick={() => toggleLang('en')}
        className={cn(
          'px-3 py-2 min-w-[44px] min-h-[44px] inline-flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 rounded-lg font-semibold transition-colors',
          language === 'en' ? 'bg-foreground text-background' : 'bg-surface text-muted hover:text-foreground border border-border'
        )}
        aria-label="Switch to English language"
      >
        EN
      </button>
    </div>
  );
}
