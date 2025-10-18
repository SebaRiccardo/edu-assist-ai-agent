'use client';

import {
  useCancelSubscription,
  useUserSubscription,
} from '@/hooks/use-user-subscription';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { PLAN_LIMITS, getPlanDetails } from '@/subscriptions/plans';
// Helper to format dates
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
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
import { useCurrentUser } from '@/hooks/use-current-user';

export default function SubscriptionPage() {
  const { user } = useCurrentUser();
  const { data, isLoading, error } = useUserSubscription(user?.id);
  const cancelMutation = useCancelSubscription();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-4xl mx-auto py-12">
        <Card>
          <CardHeader>
            <CardTitle>Error Loading Subscription</CardTitle>
            <CardDescription>
              Failed to load your subscription details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-destructive"></p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/pricing">View Plans</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!data || data?.length === 0) {
    return (
      <div className="container max-w-4xl mx-auto py-12">
        <Card>
          <CardHeader>
            <CardTitle>No Active Subscription</CardTitle>
            <CardDescription>
              You don't have an active subscription yet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Choose a plan to get started with EduAssist AI
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/pricing">View Plans</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
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
            Active
          </Badge>
        );
      case 'trialing':
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Free Trial
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Cancelled
          </Badge>
        );
      case 'paused':
        return (
          <Badge variant="outline" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Paused
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
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Subscription</h1>
          <p className="text-muted-foreground">
            Manage your subscription and billing details
          </p>
        </div>

        {/* Current Plan */}
        <Card>
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
                <p className="text-sm text-muted-foreground">Plan</p>
                <p className="font-medium">{planDetails?.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="font-medium">
                  {new Intl.NumberFormat('es-AR', {
                    style: 'currency',
                    currency: planDetails?.currency || 'ARS',
                    minimumFractionDigits: 0,
                  }).format(planDetails?.price || 0)}{' '}
                  / month
                </p>
              </div>
              {subscription.current_period_start && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    Current Period Start
                  </p>
                  <p className="font-medium">
                    {formatDate(subscription.current_period_start)}
                  </p>
                </div>
              )}
              {subscription.current_period_end && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    {subscription.status === 'trialing'
                      ? 'Trial Ends'
                      : 'Next Billing'}
                  </p>
                  <p className="font-medium">
                    {formatDate(subscription.current_period_end)}
                  </p>
                </div>
              )}
            </div>

            {subscription.status === 'trialing' && subscription.trial_end && (
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm">
                  <strong>Free Trial:</strong> Your trial ends on{' '}
                  {formatDate(subscription.trial_end)}. You won't be charged
                  until then.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex gap-2">
            {subscription.status === 'active' ||
            subscription.status === 'trialing' ? (
              <>
                <Button asChild variant="default">
                  <Link href="/pricing">Upgrade Plan</Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={cancelMutation.isPending}
                    >
                      {cancelMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Cancelling...
                        </>
                      ) : (
                        'Cancel Subscription'
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will cancel your subscription. You'll continue to
                        have access until the end of your current billing
                        period.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>No, keep it</AlertDialogCancel>
                      <AlertDialogAction onClick={handleCancelSubscription}>
                        Yes, cancel
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            ) : (
              <Button asChild>
                <Link href="/pricing">View Plans</Link>
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Plan Limits */}
        <Card>
          <CardHeader>
            <CardTitle>Plan Limits</CardTitle>
            <CardDescription>Your current plan includes</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>
                  {limits.maxInboxes === Infinity
                    ? 'Unlimited'
                    : limits.maxInboxes}{' '}
                  inbox{limits.maxInboxes !== 1 ? 'es' : ''}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>
                  {limits.maxCourses === Infinity
                    ? 'Unlimited'
                    : limits.maxCourses}{' '}
                  course{limits.maxCourses !== 1 ? 's' : ''}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>
                  {limits.aiEmailDraftPerDay === Infinity
                    ? 'Unlimited'
                    : limits.aiEmailDraftPerDay}{' '}
                  AI email drafts per day
                </span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>
                  {limits.emailsProcessedPerMonth === Infinity
                    ? 'Unlimited'
                    : limits.emailsProcessedPerMonth}{' '}
                  emails processed per month
                </span>
              </li>
              {limits.autoLabels && (
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Auto-labeling</span>
                </li>
              )}
              {limits.autoReplies && (
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Auto-replies</span>
                </li>
              )}
              {limits.realTimeReplies && (
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Real-time replies</span>
                </li>
              )}
              {limits.prioritySupport && (
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Priority support</span>
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
