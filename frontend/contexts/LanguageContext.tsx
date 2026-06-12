'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  defaultLocale,
  isLocale,
  localeStorageKey,
  translate,
  type Locale,
} from '@/lib/i18n';

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === 'undefined') {
      return defaultLocale;
    }

    const storedLocale = window.localStorage.getItem(localeStorageKey);

    if (isLocale(storedLocale)) {
      return storedLocale;
    }

    return defaultLocale;
  });

  useEffect(() => {
    document.documentElement.lang = locale;
    window.localStorage.setItem(localeStorageKey, locale);
  }, [locale]);

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => translate(locale, key, params),
    [locale],
  );

  const value = useMemo<LanguageContextValue>(() => ({
    locale,
    setLocale,
    t,
  }), [locale, setLocale, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage harus digunakan di dalam LanguageProvider.');
  }

  return context;
}
