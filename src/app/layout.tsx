import type { Metadata } from 'next';
import { Geist_Mono, Montserrat, Poppins } from 'next/font/google';
import './globals.css';
import Providers from '@/components/providers';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale } from '@/lib/i18n/get-locale';
import { getMessages } from '@/lib/i18n/get-messages';
import { Analytics } from '@vercel/analytics/next';
const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'AuxilIAr',
  description: 'Tu asistente impulsado por IA para el análisis de correos electrónicos educativos.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages(locale);
  return (
    <html lang={locale}>
      <body
        className={`${montserrat.variable} ${geistMono.variable} ${poppins.variable} antialiased`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
