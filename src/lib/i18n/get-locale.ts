import { cookies, headers } from 'next/headers';
import {
  AppLocale,
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  LOCALE_COOKIE_NAME,
} from './config';

export async function getLocale(): Promise<AppLocale> {
  const cookieStore = await cookies();
  const preferred = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  if (preferred && isSupported(preferred)) return preferred as AppLocale;

  const acceptLanguage = (await headers()).get('accept-language');
  if (acceptLanguage) {
    const first = acceptLanguage.split(',')[0]?.trim().toLowerCase();
    const lang = first?.split('-')[0];
    if (lang && isSupported(lang)) return lang as AppLocale;
  }
  return DEFAULT_LOCALE;
}

function isSupported(locale: string): boolean {
  return SUPPORTED_LOCALES.includes(locale as AppLocale);
}
