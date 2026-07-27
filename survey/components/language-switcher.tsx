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
          'px-1.5 py-0.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-xs font-semibold',
          language === 'tr' ? 'bg-foreground text-background' : 'bg-surface text-muted hover:text-foreground border border-border'
        )}
        aria-label="Türkçe diline geç"
      >
        TR
      </button>
      <span className="text-muted font-bold">/</span>
      <button
        type="button"
        onClick={() => toggleLang('en')}
        className={cn(
          'px-1.5 py-0.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-xs font-semibold',
          language === 'en' ? 'bg-foreground text-background' : 'bg-surface text-muted hover:text-foreground border border-border'
        )}
        aria-label="Switch to English language"
      >
        EN
      </button>
    </div>
  );
}
