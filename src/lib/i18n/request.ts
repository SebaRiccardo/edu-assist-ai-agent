import { getRequestConfig } from 'next-intl/server';
import { getMessages } from './get-messages';
import { getLocale } from './get-locale';

export default getRequestConfig(async () => {
  // Static for now, we'll change this later
  const locale = await getLocale();

  return {
    locale,
    messages: await getMessages(locale),
  };
});
