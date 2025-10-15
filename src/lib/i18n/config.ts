export const SUPPORTED_LOCALES = ['es', 'en'] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = 'es';
export const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';
