import type { AppLocale } from './config';

export async function getMessages(locale: AppLocale) {
  const messages = await import(`../../../messages/${locale}.json`).then(
    m => m.default
  );
  return messages;
}
