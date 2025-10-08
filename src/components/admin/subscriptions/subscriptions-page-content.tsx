'use client';

import { SubscriptionsDataTable } from '@/components/admin/subscriptions/subscriptions-data-table';
import {
  columns,
  SubscriptionRow,
} from '@/components/admin/subscriptions/subscriptions-columns';
import { useSubscriptions } from '@/hooks/use-subscriptions';
import { Loader2 } from 'lucide-react';

export function SubscriptionsPageContent() {
  const { data: subscriptions, isLoading, error } = useSubscriptions();

  if (error) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <h1 className="text-3xl font-bold">Active Subscriptions</h1>
        <p className="text-destructive">
          Error loading subscriptions. Please try again.
        </p>
      </div>
    );
  }

  // Transform data for the table
  const subscriptionsData: SubscriptionRow[] = (subscriptions || []).map(
    sub => ({
      id: sub.id,
      user_id: sub.user_id,
      user_email: sub.profiles.email || '',
      user_name: sub.profiles.full_name || 'N/A',
      plan_name: (sub.subscription_plans as any)?.name || 'Unknown Plan',
      plan_price: (sub.subscription_plans as any)?.price || 0,
      plan_currency: (sub.subscription_plans as any)?.currency || 'ARS',
      plan_interval: (sub.subscription_plans as any)?.interval || 'month',
      status: sub.status,
      current_period_start: sub.current_period_start,
      current_period_end: sub.current_period_end,
      trial_start: sub.trial_start,
      trial_end: sub.trial_end,
      cancel_at_period_end: sub.cancel_at_period_end || false,
      cancelled_at: sub.cancelled_at,
      created_at: sub.created_at,
      mercadopago_preapproval_id: sub.mercadopago_preapproval_id,
    })
  );

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Active Subscriptions
        </h1>
        <p className="text-muted-foreground mt-2">
          Monitor and manage all user subscriptions.
        </p>
      </div>
      <div className="px-4 lg:px-6">
        {isLoading ? (
          <div className="flex flex-col min-h-screen items-center justify-center gap-4 py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading subscriptions...</p>
          </div>
        ) : (
          <SubscriptionsDataTable columns={columns} data={subscriptionsData} />
        )}
      </div>
    </div>
  );
}
