'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function FinalCTASection() {
  const t = useTranslations('Landing');
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">
          {t('finalCtaTitle1')}
          <br />
          <span className="text-primary">{t('finalCtaTitle2')}</span>
        </h2>
        <p className="text-xl text-muted-foreground mb-10">
          {t('finalCtaSubtitle')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href='/auth/sign-up'>
          <button
            className="rounded-full bg-primary text-primary-foreground px-8 py-4 cursor-pointer text-lg font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            🎓 {t('startFreeTrial')}
          </button>
          </Link>

        </div>
        <p className="text-sm text-muted-foreground/70 mt-8">{t('lovedBy')}</p>
      </div>
    </section>
  );
}
