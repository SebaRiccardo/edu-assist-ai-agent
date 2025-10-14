import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { CircleCheck } from 'lucide-react';
import { SUBSCRIPTION_PLANS_CONFIG } from '@/lib/subscriptions/plans';
import Link from 'next/link';

// Transform SUBSCRIPTION_PLANS_CONFIG into the format needed for the pricing page
const plans = [
  {
    name: SUBSCRIPTION_PLANS_CONFIG.BASIC.name,
    price: SUBSCRIPTION_PLANS_CONFIG.BASIC.price,
    description: SUBSCRIPTION_PLANS_CONFIG.BASIC.description,
    features: SUBSCRIPTION_PLANS_CONFIG.BASIC.features,
    buttonText: 'Comenzar',
    isPopular: SUBSCRIPTION_PLANS_CONFIG.BASIC.highlighted,
    currency: SUBSCRIPTION_PLANS_CONFIG.BASIC.currency,
    period: SUBSCRIPTION_PLANS_CONFIG.BASIC.period,
    planType: 'basic' as const,
  },
  {
    name: SUBSCRIPTION_PLANS_CONFIG.PRO.name,
    price: SUBSCRIPTION_PLANS_CONFIG.PRO.price,
    description: SUBSCRIPTION_PLANS_CONFIG.PRO.description,
    features: SUBSCRIPTION_PLANS_CONFIG.PRO.features,
    buttonText: 'Elegir Pro',
    isPopular: SUBSCRIPTION_PLANS_CONFIG.PRO.highlighted,
    currency: SUBSCRIPTION_PLANS_CONFIG.PRO.currency,
    period: SUBSCRIPTION_PLANS_CONFIG.PRO.period,
    planType: 'pro' as const,
  },
  {
    name: SUBSCRIPTION_PLANS_CONFIG.PRO_PLUS.name,
    price: SUBSCRIPTION_PLANS_CONFIG.PRO_PLUS.price,
    description: SUBSCRIPTION_PLANS_CONFIG.PRO_PLUS.description,
    features: SUBSCRIPTION_PLANS_CONFIG.PRO_PLUS.features,
    buttonText: 'Elegir Pro+',
    isPopular: SUBSCRIPTION_PLANS_CONFIG.PRO_PLUS.highlighted,
    currency: SUBSCRIPTION_PLANS_CONFIG.PRO_PLUS.currency,
    period: SUBSCRIPTION_PLANS_CONFIG.PRO_PLUS.period,
    planType: 'pro_plus' as const,
  },
];

const PricingPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-6">
      <div className="text-center mb-12">
        <h1 className="text-5xl sm:text-6xl font-semibold tracking-tighter">
          Planes y Precios
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Elige el plan perfecto para gestionar tu bandeja de entrada académica
        </p>
      </div>
      <div className=" mt-12 sm:mt-16 max-w-(--breakpoint-2xl) mx-auto grid grid-cols-1 lg:grid-cols-3 items-start gap-8">
        {plans.map(plan => (
          <div
            key={plan.name}
            className={cn(
              'relative border rounded-lg p-6 flex flex-col h-full',
              {
                'border-2 border-primary ': plan.isPopular,
              }
            )}
          >
            {plan.isPopular && (
              <Badge className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2">
                Más Popular
              </Badge>
            )}
            <h3 className="text-lg font-medium">{plan.name}</h3>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-4xl font-bold">
                {new Intl.NumberFormat('es-AR', {
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
                variant={plan.isPopular ? 'default' : 'outline'}
                size="lg"
                className="w-full mt-6"
                asChild
              >
                <Link href={`/subscriptions/checkout?plan=${plan.planType}`}>{plan.buttonText}</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground">
          ¿Tienes preguntas?{' '}
          <Link href="/contact" className="underline hover:text-primary">
            Contáctanos
          </Link>
        </p>
      </div>
    </div>
  );
};

export default PricingPage;
