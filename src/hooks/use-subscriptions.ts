'use client';

import { useQuery } from '@supabase-cache-helpers/postgrest-react-query';
import {
  useInsertMutation,
  useUpdateMutation,
  useDeleteMutation,
} from '@supabase-cache-helpers/postgrest-react-query';
import useSupabaseBrowser from '@/lib/supabase/client';
import {
  getAllSubscriptionsQuery,
  getActiveSubscriptionsQuery,
  getSubscriptionsByUserIdQuery,
  getSubscriptionsCountQuery,
} from './queries/user-subscriptions';

/**
 * Hook to fetch all user subscriptions with profile and plan data
 */
export function useSubscriptions() {
  const client = useSupabaseBrowser();

  return useQuery(getAllSubscriptionsQuery(client));
}

/**
 * Hook to fetch active subscriptions only
 */
export function useActiveSubscriptions() {
  const client = useSupabaseBrowser();

  return useQuery(getActiveSubscriptionsQuery(client));
}

/**
 * Hook to fetch subscriptions by user ID
 */
export function useUserSubscriptions(userId: string | undefined) {
  const client = useSupabaseBrowser();

  return useQuery(
    userId ? getSubscriptionsByUserIdQuery(client, userId) : (null as any),
    {
      enabled: !!userId,
    }
  );
}

/**
 * Hook to fetch subscriptions count
 */
export function useSubscriptionsCount(status?: string) {
  const client = useSupabaseBrowser();

  return useQuery(getSubscriptionsCountQuery(client, status), {
    select: (data: any) => data.count,
  });
}

/**
 * Hook to create a new subscription
 */
export function useCreateSubscription() {
  const client = useSupabaseBrowser();

  return useInsertMutation(client.from('user_subscriptions'), ['id'], null, {
    onSuccess: () => {
      console.log('Subscription created successfully');
    },
  });
}

/**
 * Hook to update a subscription
 */
export function useUpdateSubscription() {
  const client = useSupabaseBrowser();

  return useUpdateMutation(client.from('user_subscriptions'), ['id'], null, {
    onSuccess: () => {
      console.log('Subscription updated successfully');
    },
  });
}

/**
 * Hook to cancel a subscription
 */
export function useCancelSubscription() {
  const client = useSupabaseBrowser();

  return useUpdateMutation(client.from('user_subscriptions'), ['id'], null, {
    onSuccess: () => {
      console.log('Subscription cancelled successfully');
    },
  });
}
