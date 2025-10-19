'use client';

import { useTranslations } from 'next-intl';

export default function ValuePropositionSection() {
  const t = useTranslations('Landing');
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">
          {t('teachResearchThink')}
          <br />
          <span className="text-primary">{t('handleInbox')}</span>
        </h2>
        <p className="text-lg sm:text-xl text-muted-foreground mb-6 leading-relaxed max-w-3xl mx-auto">{t('learnsFromYou')}</p>
        <p className="text-xl font-semibold text-foreground">{t('inboxCalm')}</p>
      </div>
    </section>
  );
}
