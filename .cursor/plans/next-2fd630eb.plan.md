<!-- 2fd630eb-ad50-4d29-9cc2-ab0544c993f3 af0977e8-7adb-410d-bf1b-02047f7c4721 -->

# Implement ES/EN i18n with next-intl (no locale routing)

## Approach

- Use next-intl with cookie-based locale (no `/es` or `/en` routes).
- Provide `NextIntlClientProvider` in `src/app/layout.tsx`, loading messages from `messages/{locale}.json` via server utilities.
- Add a language switcher that sets a locale cookie and refreshes the page.
- Replace user-facing literals with `useTranslations()` calls across `src/app` and `src/components`.

## Key Files to Add

- `messages/en.json`, `messages/es.json`
- `src/lib/i18n/config.ts`: supported locales, cookie name, default locale.
- `src/lib/i18n/get-locale.ts`: read locale from cookie/headers; fallback to default.
- `src/lib/i18n/get-messages.ts`: load the correct messages JSON.
- `src/components/language-switcher.tsx`: toggle ES/EN; sets cookie and refreshes.

## Essential Edits

- Wrap `src/app/layout.tsx` content with `NextIntlClientProvider` using server-loaded messages and locale.
- Inject `LanguageSwitcher` into shared nav/header (e.g., `src/components/navbar/navbar.tsx` and/or `src/components/site-header.tsx`).
- Refactor user-facing text:
  - Landing: `src/components/landing-page.tsx`, `src/components/localized-landing-page.tsx`, `src/app/page.tsx`.
  - Navigation: `src/components/navbar/*`, `src/components/nav-*.tsx`, `src/components/app-sidebar.tsx`.
  - Auth: `src/app/auth/*`, `src/components/auth/*`.
  - Dashboard: `src/app/dashboard/**/*`, `src/components/course-*.tsx`, `src/components/email-*.tsx`.
  - Admin: `src/app/admin/**/*`, `src/components/admin/**/*`.
  - Settings & connections: `src/app/settings/**/*`, `src/components/connections-*.tsx`, `src/components/connect-gmail-dialog.tsx`.
- Convert button labels, headings, helper text, placeholders, empty states, toasts, and error messages.

## Minimal Snippets (illustrative)

- Provider in `layout.tsx`:

```tsx
import { NextIntlClientProvider } from 'next-intl';
import { getLocale } from '@/lib/i18n/get-locale';
import { getMessages } from '@/lib/i18n/get-messages';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages(locale);
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

- Usage in components:

```tsx
import { useTranslations } from 'next-intl';
const t = useTranslations('Nav');
<button>{t('signIn')}</button>;
```

- Language switcher (client):

```tsx
'use client';
import { useRouter } from 'next/navigation';

export function LanguageSwitcher() {
  const router = useRouter();
  const setLocale = (locale: 'en' | 'es') => {
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`;
    router.refresh();
  };
  // ...UI toggles calling setLocale('en'|'es')
}
```

## Messages Structure

- Namespaces per area: `Common`, `Nav`, `Auth`, `Landing`, `Dashboard`, `Admin`, `Settings`, `Subscriptions`, `Email`.
- Keep keys semantic (e.g., `signIn`, `signUp`, `save`, `cancel`, `title`, `subtitle`, `emptyState`).

## QA Checklist

- Verify default locale Spanish when cookie absent.
- Toggle persists and re-renders all pages without navigation.
- Scan for stray literals; replace or annotate intentionally unlocalized debug text.
- Confirm neutral Spanish phrasing across all messages.

### To-dos

- [ ] Add next-intl dependency and setup messages directory
- [ ] Create i18n config, getLocale, getMessages utilities
- [ ] Wrap src/app/layout.tsx with NextIntlClientProvider
- [ ] Create LanguageSwitcher and add to shared navigation
- [ ] Localize landing pages and components
- [ ] Localize navbar, sidebar, and nav items
- [ ] Localize auth pages and components
- [ ] Localize dashboard pages/components (courses, emails, stats)
- [ ] Localize admin pages/components (plans, users, subscriptions)
- [ ] Localize settings and connections screens
- [ ] Sweep repo to replace all user-facing literals
- [ ] QA pass for cookie default, switch behavior, neutral Spanish
