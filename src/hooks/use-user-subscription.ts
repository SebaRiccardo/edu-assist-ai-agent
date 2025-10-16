'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUserSubscriptionAction,
  cancelSubscriptionAction as cancelSubscriptionServerAction,
} from '@/actions/subscriptions';

/**
 * Hook to get the current user's subscription
 */
export function useUserSubscription() {
  return useQuery({
    queryKey: ['user-subscription'],
    queryFn: async () => {
      return await getUserSubscriptionAction();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to cancel the current user's subscription
 */
export function useCancelUserSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subscriptionId: string) => {
      return await cancelSubscriptionServerAction(subscriptionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-subscription'] });
      console.log('Subscription cancelled successfully');
    },
  });
}
