'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLocaleSubscriptionPlan } from '@/hooks/use-locale-subscription-plans';
import { usePlan } from '@/hooks/use-subscription-plans';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { createSubscriptionCheckoutAction } from '@/actions/subscriptions';
import { useCurrentUser } from '@/hooks/use-current-user';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations('Checkout');
  const { user, loading: userLoading } = useCurrentUser();
  const { plans } = useLocaleSubscriptionPlan();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const planType = searchParams.get('plan') as 'basic' | 'pro' | 'pro_plus';
  const selectedPlan = plans.find(p => p.planType === planType);

  // Get MercadoPago plan details
  const { data: mpPlan, isLoading: mpPlanLoading } = usePlan(selectedPlan?.mercadopago_plan_id || '');

  useEffect(() => {
    if (!userLoading && !user) {
      router.push(`/auth/signin?redirect=/subscriptions/checkout?plan=${planType}`);
    }
  }, [user, userLoading, router, planType]);

  const handleSubscribe = async () => {
    if (!selectedPlan || !mpPlan || !user) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await createSubscriptionCheckoutAction({
        planType: selectedPlan.planType,
        mercadoPagoPlanId: selectedPlan.mercadopago_plan_id,
        userEmail: user.email!,
        userName: user.user_metadata?.full_name || user.email!,
      });

      // Redirect to MercadoPago hosted checkout page
      if (result.init_point) {
        window.location.href = result.init_point;
      } else {
        setError('Failed to generate checkout URL');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create subscription');
    } finally {
      setIsLoading(false);
    }
  };

  if (userLoading || mpPlanLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!selectedPlan) {
    return (
      <div className="container max-w-2xl mx-auto py-12">
        <Card>
          <CardHeader>
            <CardTitle>{t('planNotFound')}</CardTitle>
            <CardDescription>{t('planNotFoundDescription')}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link href="/pricing">{t('viewPlans')}</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <Button variant="ghost" size="sm" className="mb-6" asChild>
        <Link href="/pricing">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('backToPlans')}
        </Link>
      </Button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Plan Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{selectedPlan.name}</CardTitle>
              {selectedPlan.freeTrial.count > 0 && (
                <Badge variant="info">
                  {selectedPlan.freeTrial.count} {t('dayFreeTrial')}
                </Badge>
              )}
            </div>
            <CardDescription>{selectedPlan.subtitle}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">
                  {new Intl.NumberFormat('es-AR', {
                    style: 'currency',
                    currency: selectedPlan.currency,
                    minimumFractionDigits: 0,
                  }).format(selectedPlan.price)}
                </span>
                <span className="text-muted-foreground">/ {selectedPlan.period.replace('por ', '')}</span>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-3">{t('featuresIncluded')}</h4>
              <ul className="space-y-2">
                {selectedPlan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {selectedPlan.freeTrial.count > 0 && (
              <>
                <Separator />
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>{t('freeTrialNote')}</strong>{' '}
                    {t('freeTrialDescription', {
                      days: selectedPlan.freeTrial.count,
                    })}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Checkout Summary */}
        <Card>
          <CardHeader>
            <CardTitle>{t('checkoutSummary')}</CardTitle>
            <CardDescription>{t('reviewDetails')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('plan')}</span>
                <span className="font-medium">{selectedPlan.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('billingCycle')}</span>
                <span className="font-medium">{selectedPlan.period}</span>
              </div>
              {selectedPlan.freeTrial.count > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('freeTrial')}</span>
                  <span className="font-medium text-green-600">
                    {selectedPlan.freeTrial.count} {t('days')}
                  </span>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between text-lg font-semibold">
                <span>{t('totalDueToday')}</span>
                <span>
                  {selectedPlan.freeTrial.count > 0
                    ? new Intl.NumberFormat('es-AR', {
                        style: 'currency',
                        currency: selectedPlan.currency,
                        minimumFractionDigits: 0,
                      }).format(0)
                    : new Intl.NumberFormat('es-AR', {
                        style: 'currency',
                        currency: selectedPlan.currency,
                        minimumFractionDigits: 0,
                      }).format(selectedPlan.price)}
                </span>
              </div>
              {selectedPlan.freeTrial.count > 0 && (
                <p className="text-xs text-muted-foreground">
                  {t('afterTrial')}{' '}
                  {new Intl.NumberFormat('es-AR', {
                    style: 'currency',
                    currency: selectedPlan.currency,
                    minimumFractionDigits: 0,
                  }).format(selectedPlan.price)}{' '}
                  / {selectedPlan.period.replace('por ', '')}
                </p>
              )}
            </div>

            {error && <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">{error}</div>}
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button onClick={handleSubscribe} disabled={isLoading || !mpPlan} className="w-full" size="lg">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('processing')}
                </>
              ) : (
                t('proceedToPayment')
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground">{t('redirectNote')}</p>
          </CardFooter>
        </Card>
      </div>

      {/* Terms and Conditions */}
      <Card className="mt-8">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            {t('termsNote')}{' '}
            <Link href="/terms" className="underline">
              {t('termsOfService')}
            </Link>{' '}
            {t('and')}{' '}
            <Link href="/privacy" className="underline">
              {t('privacyPolicy')}
            </Link>
            . {t('autoRenewNote')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
