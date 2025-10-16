'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { SubscriptionPlan } from '@/hooks/use-locale-subscription-plans';

export default function PricingSectionContent({
  plans,
  locale,
}: {
  plans: SubscriptionPlan[];
  locale: string;
}) {
  const t = useTranslations('Landing');
  const pricingT = useTranslations('Pricing');
  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 ">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {t('chooseYourPlan')}
          </h2>
          <p className="text-lg text-muted-foreground mb-2">
            {t('everyPlanStartsFree')}
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 w-full ">
          {plans.map(plan => (
            <div
              key={plan.name}
              className={cn(
                'relative border rounded-lg p-6 flex flex-col h-full',
                { 'border-2 border-primary ': plan.highlighted }
              )}
            >
              {plan.highlighted && (
                <Badge className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2">
                  {t('mostPopular')}
                </Badge>
              )}

              <div className="flex flex-row items-center gap-2">
                <h3 className="text-lg font-medium">{plan.name}</h3>
                {plan.freeTrial.count > 0 && (
                  <Badge variant="info">{pricingT('freeTrialLabel')}</Badge>
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
                    <CheckCircle className="h-4 w-4 mt-0.5 text-green-600 " />
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
                  <Link href={`/subscriptions/checkout?plan=${plan.planType}`}>
                    {locale === 'es' ? 'Elegir' : 'Choose'} {plan.name}
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
