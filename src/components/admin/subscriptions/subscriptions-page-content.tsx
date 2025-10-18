'use client';

import { SubscriptionsDataTable } from '@/components/admin/subscriptions/subscriptions-data-table';
import {
  columns,
  SubscriptionRow,
} from '@/components/admin/subscriptions/subscriptions-columns';
import { useSubscriptions } from '@/hooks/use-mp-subscriptions';
import { Loader2 } from 'lucide-react';

export function SubscriptionsPageContent() {
  const {
    data: subscriptions,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useSubscriptions();

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

  // MercadoPago subscriptions data is already in the correct format
  const subscriptionsData = subscriptions?.results || [];

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
          <SubscriptionsDataTable
            columns={columns}
            data={subscriptionsData}
            onRefresh={refetch}
            isRefreshing={isRefetching}
          />
        )}
      </div>
    </div>
  );
}
