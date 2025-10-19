'use client';

import { useCancelSubscription, useUserSubscription } from '@/hooks/use-user-subscription';
import { useUserPayments } from '@/hooks/use-payments';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { PLAN_LIMITS, getPlanDetails } from '@/subscriptions/plans';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTranslations } from 'next-intl';
import { User } from '@supabase/supabase-js';

// Helper to format dates
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

interface SubscriptionPageContentProps {
  user: User;
}

export function SubscriptionSettings({ user }: SubscriptionPageContentProps) {
  const t = useTranslations('Settings.Subscription');
  const { data, isLoading, error } = useUserSubscription(user?.id);
  const { data: payments, isLoading: paymentsLoading } = useUserPayments(user?.email);
  const cancelMutation = useCancelSubscription();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('errorLoading')}</CardTitle>
          <CardDescription>{t('errorDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{t('tryAgainLater')}</p>
        </CardContent>
        <CardFooter>
          <Button asChild>
            <Link href="/pricing">{t('viewPlans')}</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (!data || data?.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('noSubscription')}</CardTitle>
          <CardDescription>{t('noSubscriptionDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t('chooseAPlan')}</p>
        </CardContent>
        <CardFooter>
          <Button asChild>
            <Link href="/pricing">{t('viewPlans')}</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const subscription = data[0];
  const planDetails = getPlanDetails(subscription?.type as any);
  const limits = PLAN_LIMITS[subscription?.type as keyof typeof PLAN_LIMITS];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="default" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            {t('active')}
          </Badge>
        );
      case 'trialing':
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            {t('trialing')}
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            {t('cancelled')}
          </Badge>
        );
      case 'paused':
        return (
          <Badge variant="outline" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            {t('paused')}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleCancelSubscription = async () => {
    try {
      await cancelMutation.mutateAsync(subscription.id);
    } catch (err) {
      console.error('Failed to cancel subscription:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{planDetails?.name}</CardTitle>
              <CardDescription>{planDetails?.subtitle}</CardDescription>
            </div>
            {getStatusBadge(subscription.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{t('plan')}</p>
              <p className="font-medium">{planDetails?.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('price')}</p>
              <p className="font-medium">
                {new Intl.NumberFormat('es-AR', {
                  style: 'currency',
                  currency: planDetails?.currency || 'ARS',
                  minimumFractionDigits: 0,
                }).format(planDetails?.price || 0)}{' '}
                {t('perMonth')}
              </p>
            </div>
            {subscription.current_period_start && (
              <div>
                <p className="text-sm text-muted-foreground">{t('currentPeriodStart')}</p>
                <p className="font-medium">{formatDate(subscription.current_period_start)}</p>
              </div>
            )}
            {subscription.current_period_end && (
              <div>
                <p className="text-sm text-muted-foreground">{subscription.status === 'cancelled' ? t('accessUntil') : t('currentPeriodEnd')}</p>
                <p className="font-medium">{formatDate(subscription.current_period_end)}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Plan Features/Limits */}
          <div>
            <p className="text-sm font-medium mb-2">{t('planLimits')}</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('aiDraftsPerDay')}</span>
                <span className="font-medium">{limits?.aiEmailDraftPerDay === Infinity ? t('unlimited') : limits?.aiEmailDraftPerDay}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('connectedInboxes')}</span>
                <span className="font-medium">{limits?.maxInboxes === Infinity ? t('unlimited') : limits?.maxInboxes}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('autoReplies')}</span>
                <span className="font-medium">{limits?.autoReplies ? '✓' : '✗'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('prioritySupport')}</span>
                <span className="font-medium">{limits?.prioritySupport ? '✓' : '✗'}</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          {subscription.status !== 'cancelled' && (
            <>
              <Button asChild variant="outline">
                <Link href="/pricing">{t('upgradePlan')}</Link>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={cancelMutation.isPending}>
                    {cancelMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('cancelling')}
                      </>
                    ) : (
                      t('cancelSubscription')
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('cancelConfirmTitle')}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('cancelConfirmDescription', {
                        date: formatDate(subscription.current_period_end || ''),
                      })}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('keepSubscription')}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancelSubscription}>{t('cancelSubscription')}</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
          {subscription.status === 'cancelled' && (
            <Button asChild>
              <Link href="/pricing">{t('reactivateSubscription')}</Link>
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Payment History */}
      <Card className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <CardHeader>
          <CardTitle>{t('paymentHistory')}</CardTitle>
          <CardDescription>{t('paymentHistoryDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          {paymentsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : payments && payments.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('date')}</TableHead>
                    <TableHead>{t('amount')}</TableHead>
                    <TableHead>{t('paymentStatus')}</TableHead>
                    <TableHead>{t('paymentMethod')}</TableHead>
                    <TableHead>{t('description')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment: any) => {
                    const statusMap: Record<
                      string,
                      {
                        label: string;
                        variant: 'default' | 'secondary' | 'destructive' | 'outline';
                      }
                    > = {
                      approved: { label: t('approved'), variant: 'default' },
                      pending: { label: t('pending'), variant: 'secondary' },
                      rejected: {
                        label: t('rejected'),
                        variant: 'destructive',
                      },
                      cancelled: { label: t('cancelled'), variant: 'outline' },
                    };
                    const statusConfig = statusMap[payment.status] || {
                      label: payment.status,
                      variant: 'outline',
                    };

                    return (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {new Date(payment.date_created).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('es-AR', {
                            style: 'currency',
                            currency: payment.currency_id || 'ARS',
                            minimumFractionDigits: 0,
                          }).format(payment.transaction_amount)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                        </TableCell>
                        <TableCell className="capitalize">{payment.payment_method_id?.replace('_', ' ') || 'N/A'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{payment.description || 'N/A'}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">{t('noPayments')}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
