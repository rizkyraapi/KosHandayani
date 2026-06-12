import enMessages from '@/locales/en.json';
import idMessages from '@/locales/id.json';

export const locales = ['id', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'id';
export const localeStorageKey = 'koshandayani.locale';

const dictionaries: Record<Locale, Record<string, unknown>> = {
  id: idMessages,
  en: enMessages,
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && locales.includes(value as Locale);
}

function readPath(dictionary: Record<string, unknown>, key: string): unknown {
  return key.split('.').reduce<unknown>((current, segment) => {
    if (!current || typeof current !== 'object') {
      return undefined;
    }

    return (current as Record<string, unknown>)[segment];
  }, dictionary);
}

function interpolate(template: string, params?: Record<string, string | number>) {
  if (!params) {
    return template;
  }

  return Object.entries(params).reduce(
    (text, [name, value]) => text.replaceAll(`{{${name}}}`, String(value)),
    template,
  );
}

export function translate(locale: Locale, key: string, params?: Record<string, string | number>): string {
  const selected = readPath(dictionaries[locale], key);
  const fallback = readPath(dictionaries[defaultLocale], key);
  const value = typeof selected === 'string'
    ? selected
    : typeof fallback === 'string'
      ? fallback
      : key;

  return interpolate(value, params);
}

export function getLocaleLabel(locale: Locale) {
  return translate(locale, `language.${locale}`);
}

export function getStatusLabel(locale: Locale, status?: string | null) {
  if (!status) {
    return translate(locale, 'common.none');
  }

  return translate(locale, `status.${status}`, undefined);
}
