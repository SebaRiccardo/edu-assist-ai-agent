'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function HeroSection() {
  const t = useTranslations('Landing');
  return (
    <section className="flex-1 pt-20 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
            {t('title')}
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground mb-4 leading-relaxed">
            {t('subtitle1')}
          </p>
          <p className="text-lg text-muted-foreground/80 mb-10">
            {t('subtitle2')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth/sign-up">
              <button className="bg-primary text-primary-foreground px-8 py-4 rounded-xl text-lg font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl flex items-center gap-2">
                🎓 {t('startFreeTrial')}
              </button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground/70 mt-6">
            {t('noSetup')}
          </p>
        </div>
      </div>
    </section>
  );
}
