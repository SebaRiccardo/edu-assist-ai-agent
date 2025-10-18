'use client';

import {
  useQuery,
  useUpdateMutation,
} from '@supabase-cache-helpers/postgrest-react-query';
import useSupabaseBrowser from '@/lib/supabase/client';
import { getUserSubscriptionById } from './queries/user-subscriptions';
import { cancelSubscriptionAction } from '@/actions';
import { useMutation } from '@tanstack/react-query';

export function useUserSubscription(userId?: string) {
  const client = useSupabaseBrowser();

  return useQuery(getUserSubscriptionById(client, userId ?? ''), {
    enabled: !!userId,
  });
}

export function useCancelSubscription() {
  return useMutation({
    mutationFn: cancelSubscriptionAction,
  });
}
