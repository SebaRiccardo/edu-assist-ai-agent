'use client';

import { useQuery } from '@supabase-cache-helpers/postgrest-react-query';
import useSupabaseBrowser from '@/lib/supabase/client';
import {
  getAllPaymentsQuery,
  getPaymentsByUserIdQuery,
  getPaymentsBySubscriptionIdQuery,
} from './queries/subscription-payments';

/**
 * Hook to fetch all subscription payments
 */
export function usePayments() {
  const client = useSupabaseBrowser();

  return useQuery(getAllPaymentsQuery(client));
}

/**
 * Hook to fetch payments by user ID
 */
export function useUserPayments(userId: string | undefined) {
  const client = useSupabaseBrowser();

  return useQuery(
    userId ? getPaymentsByUserIdQuery(client, userId) : (null as any),
    {
      enabled: !!userId,
    }
  );
}

/**
 * Hook to fetch payments by subscription ID
 */
export function useSubscriptionPayments(subscriptionId: string | undefined) {
  const client = useSupabaseBrowser();

  return useQuery(
    subscriptionId
      ? getPaymentsBySubscriptionIdQuery(client, subscriptionId)
      : (null as any),
    {
      enabled: !!subscriptionId,
    }
  );
}
