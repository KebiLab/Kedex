import { useApp } from '@/store/app';
import { translate, type Dict } from './i18n';
import type { Locale } from '@shared/ipc';

export function useLocale(): Locale {
  return useApp((s) => s.settings.locale);
}

export function useT(): (key: string) => string {
  const locale = useLocale();
  return (key: string) => translate(locale, key);
}

export function getDict(locale: Locale): Dict {
  return require('./i18n').DICTIONARIES[locale] ?? require('./i18n').DICTIONARIES.en;
}
