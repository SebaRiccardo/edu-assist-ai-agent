'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { CornerAccentButton } from '../corner-accent-button';
import TypingText from '../ui/shadcn-io/typing-text';

export default function HeroSection() {
  const t = useTranslations('Landing');
  return (
    <section className="flex-1 pt-20 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
            {t('title')}
            <span className="text-primary">{t('title-2')}</span>
          </h1>
          <TypingText
            text={[
              t('subtitlesList.0'),
              t('subtitlesList.1'),
              t('subtitlesList.2'),
            ]}
            typingSpeed={75}
            pauseDuration={1500}
            showCursor={true}
            cursorCharacter="|"
            className="text-4xl font-bold mt-10"
            textColors={['#3981f6', '#8b5cf6', '#06b6d2']}
            variableSpeed={{ min: 50, max: 120 }}
          />
          <p className="text-lg text-muted-foreground/80 mb-10 mt-2">
            {t('subtitle2')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth/sign-up">
              <CornerAccentButton>🎓 {t('startFreeTrial')}</CornerAccentButton>
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
