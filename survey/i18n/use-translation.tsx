'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../lib/types';
import tr from './tr.json';
import en from './en.json';

const dictionaries: Record<Language, Record<string, unknown>> = { tr, en };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({
  children,
  defaultLanguage = 'tr',
}: {
  children?: React.ReactNode;
  defaultLanguage?: Language;
}) {
  const [language, setLanguageState] = useState<Language>(defaultLanguage);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('survey_lang') as Language;
      if (saved && (saved === 'tr' || saved === 'en')) {
        setLanguageState(saved);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('survey_lang', lang);
    } catch {
      // Ignore localStorage errors
    }
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const dict = dictionaries[language] || dictionaries['tr'];
    const keys = key.split('.');
    let current: unknown = dict;

    for (const k of keys) {
      if (current && typeof current === 'object' && k in (current as Record<string, unknown>)) {
        current = (current as Record<string, unknown>)[k];
      } else {
        current = key;
        break;
      }
    }

    let text = typeof current === 'string' ? current : key;

    if (params) {
      Object.entries(params).forEach(([paramKey, val]) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(val));
      });
    }

    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    const fallbackT = (key: string, params?: Record<string, string | number>): string => {
      const dict = dictionaries['tr'];
      const keys = key.split('.');
      let current: unknown = dict;

      for (const k of keys) {
        if (current && typeof current === 'object' && k in (current as Record<string, unknown>)) {
          current = (current as Record<string, unknown>)[k];
        } else {
          current = key;
          break;
        }
      }

      let text = typeof current === 'string' ? current : key;

      if (params) {
        Object.entries(params).forEach(([paramKey, val]) => {
          text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(val));
        });
      }

      return text;
    };

    return {
      language: 'tr' as Language,
      setLanguage: () => {},
      t: fallbackT,
    };
  }
  return context;
}
