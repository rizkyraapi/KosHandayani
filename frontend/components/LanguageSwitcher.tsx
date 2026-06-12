'use client';

import { Languages } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { locales, type Locale } from '@/lib/i18n';

const localeNames: Record<Locale, string> = {
  id: 'Indonesia',
  en: 'English',
};

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useLanguage();

  return (
    <div
      aria-label={t('language.label')}
      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 text-xs shadow-sm"
    >
      {!compact && <Languages size={15} className="ml-1 text-slate-500" aria-hidden="true" />}
      {locales.map((item) => {
        const active = item === locale;

        return (
          <button
            key={item}
            type="button"
            onClick={() => setLocale(item)}
            aria-pressed={active}
            className={`rounded-lg px-2.5 py-1.5 font-bold transition ${
              active
                ? 'bg-[#006e2f] text-white'
                : 'text-slate-500 hover:bg-slate-100 hover:text-[#006e2f]'
            }`}
          >
            {compact ? item.toUpperCase() : localeNames[item]}
          </button>
        );
      })}
    </div>
  );
}
