import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Navbar } from '@/components/landing/navbar/navbar';
import { PricingPageCards } from './pricing-cards';

const PricingPage = () => {
  const t = useTranslations('Pricing');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-6">
      <Navbar />
      <div className="text-center mb-5 mt-25">
        <h1 className="text-5xl sm:text-6xl font-semibold tracking-tighter">
          {t('title')}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('subtitle')}
        </p>
      </div>
      <PricingPageCards />
      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground">
          {t('haveQuestions')}{' '}
          <Link href="/contact" className="underline hover:text-primary">
            {t('contactUs')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default PricingPage;
