'use client';

import { getPlansConfig } from '@/subscriptions/plans';
import { useLocale } from 'next-intl';

export type Plan = {
  name: string;
  subtitle: string;
  price: number;
  period: string;
  description: string;
  features: readonly string[];
  highlighted: boolean;
  currency: string;
  planType: 'basic' | 'pro' | 'pro_plus';
  freeTrial: {
    count: number;
    interval: string;
  };
};

export const useLocaleSubscriptionPlan = () => {
  const activeLocale = useLocale();
  const plansConfig = getPlansConfig(activeLocale as 'en' | 'es');

  const plans: Plan[] = [
    {
      name: plansConfig.basic.name,
      subtitle: plansConfig.basic.subtitle,
      price: plansConfig.basic.price,
      period: plansConfig.basic.period,
      description: plansConfig.basic.description,
      features: plansConfig.basic.features as readonly string[],
      highlighted: plansConfig.basic.highlighted,
      currency: plansConfig.basic.currency,
      planType: 'basic' as const,
      freeTrial: {
        count: plansConfig.basic.free_trial_count,
        interval: plansConfig.basic.free_trial_interval,
      },
    },
    {
      name: plansConfig.pro.name,
      subtitle: plansConfig.pro.subtitle,
      price: plansConfig.pro.price,
      period: plansConfig.pro.period,
      description: plansConfig.pro.description,
      features: plansConfig.pro.features as readonly string[],
      highlighted: plansConfig.pro.highlighted,
      currency: plansConfig.pro.currency,
      planType: 'pro' as const,
      freeTrial: {
        count: plansConfig.pro.free_trial_count,
        interval: plansConfig.pro.free_trial_interval,
      },
    },
    {
      name: plansConfig.pro_plus.name,
      subtitle: plansConfig.pro_plus.subtitle,
      price: plansConfig.pro_plus.price,
      period: plansConfig.pro_plus.period,
      description: plansConfig.pro_plus.description,
      features: plansConfig.pro_plus.features as readonly string[],
      highlighted: plansConfig.pro_plus.highlighted,
      currency: plansConfig.pro_plus.currency,
      planType: 'pro_plus' as const,
      freeTrial: {
        count: plansConfig.pro_plus.free_trial_count,
        interval: plansConfig.pro_plus.free_trial_interval,
      },
    },
  ];

  return { plans, locale: activeLocale };
};
