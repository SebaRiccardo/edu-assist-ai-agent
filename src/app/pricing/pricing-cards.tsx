'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useLocaleSubscriptionPlan } from '@/hooks/use-locale-subscription-plans';
import { cn } from '@/lib/utils';
import { CircleCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export const PricingPageCards = () => {
  const t = useTranslations('Pricing');
  const { plans, locale } = useLocaleSubscriptionPlan();
  return (
    <div className=" mt-12 sm:mt-16 max-w-(--breakpoint-2xl) mx-auto grid grid-cols-1 lg:grid-cols-3 items-start gap-8">
      {plans.map(plan => (
        <div
          key={plan.name}
          className={cn('relative border rounded-lg p-6 flex flex-col h-full', {
            'border-2 border-primary ': plan.highlighted,
          })}
        >
          {plan.highlighted && (
            <Badge className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2">
              {t('mostPopular')}
            </Badge>
          )}
          <div className="flex flex-row items-center gap-2">
            <h3 className="text-lg font-medium">{plan.name}</h3>
            {plan.freeTrial.count > 0 && (
              <Badge variant="info">{t('freeTrialLabel')}</Badge>
            )}
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-4xl font-bold">
              {new Intl.NumberFormat(locale === 'es' ? 'es-AR' : 'en-US', {
                style: 'currency',
                currency: plan.currency,
                minimumFractionDigits: 0,
              }).format(plan.price)}
            </span>
            <span className="text-sm text-muted-foreground">
              /{plan.period.replace('por ', '')}
            </span>
          </div>
          <p className="mt-4 font-medium text-muted-foreground text-sm">
            {plan.description}
          </p>
          <Separator className="my-4" />
          <ul className="space-y-2 flex-shrink-0 ">
            {plan.features.map(feature => (
              <li key={feature} className="flex items-start gap-2">
                <CircleCheck className="h-4 w-4 mt-0.5 text-green-600 " />
                {feature}
              </li>
            ))}
          </ul>
          <div className="flex flex-1 items-end">
            <Button
              variant={plan.highlighted ? 'default' : 'outline'}
              size="lg"
              className="w-full mt-6"
              asChild
            >
              <Button
                variant={plan.highlighted ? 'default' : 'outline'}
                size="lg"
                className="w-full mt-6"
                asChild
              >
                <Link href={`/subscriptions/checkout?plan=${plan.planType}`}>
                  {locale === 'es' ? 'Elegir' : 'Choose'} {plan.name}
                </Link>
              </Button>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
