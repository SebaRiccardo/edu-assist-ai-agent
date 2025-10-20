'use client';

import { LOCALE_COOKIE_NAME } from '@/lib/i18n/config';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useLocale } from 'next-intl';

export default function LanguageSwitcher() {
  const router = useRouter();
  const locale = useLocale() as 'es' | 'en';

  function setLocale(locale: 'es' | 'en') {
    document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=31536000`;
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1 bg-white rounded-3xl">
      <Button variant={locale === 'es' ? 'default' : 'ghost'} size="sm" onClick={() => setLocale('es')} aria-pressed={locale === 'es'}>
        {locale === 'es' ? "Español" : "Spanish"}
      </Button>
      <Button variant={locale === 'en' ? 'default' : 'ghost'} size="sm" onClick={() => setLocale('en')} aria-pressed={locale === 'en'}>
        {locale === 'es' ? "Inglés" : "English"}
      </Button>
    </div>
  );
}
