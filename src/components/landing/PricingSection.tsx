'use client';
import PricingSectionContent from './PricingSectionClient';
import { useLocaleSubscriptionPlan } from '@/hooks/use-locale-subscription-plans';

export default function PricingSection() {
  const { plans, locale } = useLocaleSubscriptionPlan();

  return <PricingSectionContent plans={plans} locale={locale} />;
}
