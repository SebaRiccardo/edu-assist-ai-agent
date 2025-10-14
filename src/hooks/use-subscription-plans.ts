'use client';

import { useQuery } from '@supabase-cache-helpers/postgrest-react-query';
import {
  useInsertMutation,
  useUpdateMutation,
  useDeleteMutation,
} from '@supabase-cache-helpers/postgrest-react-query';
import useSupabaseBrowser from '@/lib/supabase/client';
import {
  getAllPlansQuery,
  getActivePlansQuery,
  getPlanByIdQuery,
  getPlansCountQuery,
} from './queries/subscription-plans';

/**
 * Hook to fetch all subscription plans
 */
export function usePlans() {
  const client = useSupabaseBrowser();

  return useQuery(getAllPlansQuery(client), { refetchOnMount: true });
}

/**
 * Hook to fetch active plans only
 */
export function useActivePlans() {
  const client = useSupabaseBrowser();

  return useQuery(getActivePlansQuery(client));
}

/**
 * Hook to fetch a single plan by ID
 */
export function usePlan(planId: string | undefined) {
  const client = useSupabaseBrowser();

  return useQuery(planId ? getPlanByIdQuery(client, planId) : (null as any), {
    enabled: !!planId,
  });
}

/**
 * Hook to fetch plans count
 */
export function usePlansCount() {
  const client = useSupabaseBrowser();

  return useQuery(getPlansCountQuery(client), {
    select: (data: any) => data.count,
  });
}

/**
 * Hook to create a new subscription plan
 */
export function useCreatePlan() {
  const client = useSupabaseBrowser();

  return useInsertMutation(client.from('subscription_plans'), ['id'], null, {
    onSuccess: () => {
      console.log('Plan created successfully');
    },
  });
}

/**
 * Hook to update a subscription plan
 */
export function useUpdatePlan() {
  const client = useSupabaseBrowser();

  return useUpdateMutation(client.from('subscription_plans'), ['id'], null, {
    onSuccess: () => {
      console.log('Plan updated successfully');
    },
  });
}

/**
 * Hook to delete a subscription plan
 */
export function useDeletePlan() {
  const client = useSupabaseBrowser();

  return useDeleteMutation(client.from('subscription_plans'), ['id'], null, {
    onSuccess: () => {
      console.log('Plan deleted successfully');
    },
  });
}
