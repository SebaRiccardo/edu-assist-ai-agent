'use client';

import { useTranslations } from 'next-intl';

export default function HowItWorksSection() {
  const t = useTranslations('Landing');
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {t('howItWorks')}
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {[1, 2, 3, 4].map(step => (
            <div className="relative" key={step}>
              <div
                className={`bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-8 rounded-2xl border ${step === 4 ? 'border-primary/40' : 'border-border/40'} hover:border-primary/40 transition-all h-full`}
              >
                <div
                  className={`absolute -top-4 -left-4 w-12 h-12 ${step === 4 ? 'bg-gradient-to-br from-primary to-primary/80' : 'bg-primary'} rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg`}
                >
                  {step}
                </div>
                {step === 4 && (
                  <div className="inline-block bg-primary/20 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-3">
                    {t('step4Badge')}
                  </div>
                )}
                <h3 className="text-xl font-semibold text-foreground mb-3 mt-2">
                  {step === 1
                    ? t('step1Title')
                    : step === 2
                      ? t('step2Title')
                      : step === 3
                        ? t('step3Title')
                        : t('step4Title')}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step === 1
                    ? t('step1Text')
                    : step === 2
                      ? t('step2Text')
                      : step === 3
                        ? t('step3Text')
                        : t('step4Text')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
