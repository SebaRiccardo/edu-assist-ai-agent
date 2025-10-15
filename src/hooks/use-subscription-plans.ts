'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  searchPlansAction,
  getActivePlansAction,
  getPlanAction,
  createPlanAction,
  updatePlanAction,
} from '@/lib/mercadopago/actions';
import type {
  CreatePlanParams,
  PlanSearchParams,
} from '@/lib/mercadopago/service';

/**
 * Hook to fetch all subscription plans
 * @param params - Search parameters for filtering plans
 */
export function usePlans(params?: PlanSearchParams) {
  return useQuery({
    queryKey: ['mercadopago', 'plans', params],
    queryFn: async () => {
      const result = await searchPlansAction(params);
      console.log(result);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch plans');
      }
      return result.data;
    },
    refetchOnMount: true,
  });
}

/**
 * Hook to fetch active plans only
 */
export function useActivePlans() {
  return useQuery({
    queryKey: ['mercadopago', 'plans', 'active'],
    queryFn: async () => {
      const result = await getActivePlansAction();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch active plans');
      }
      return result.data;
    },
  });
}

/**
 * Hook to fetch a single plan by ID
 * @param planId - The plan ID
 */
export function usePlan(planId: string | undefined) {
  return useQuery({
    queryKey: ['mercadopago', 'plans', planId],
    queryFn: async () => {
      if (!planId) throw new Error('Plan ID is required');
      const result = await getPlanAction(planId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch plan');
      }
      return result.data;
    },
    enabled: !!planId,
  });
}

/**
 * Hook to fetch plans count
 * @param status - Optional status filter
 */
export function usePlansCount(status?: string) {
  return useQuery({
    queryKey: ['mercadopago', 'plans', 'count', status],
    queryFn: async () => {
      const params = status ? { status } : undefined;
      const result = await searchPlansAction(params);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch plans count');
      }
      return result.data?.results?.length || 0;
    },
  });
}

/**
 * Hook to create a new subscription plan
 */
export function useCreatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreatePlanParams) => {
      const result = await createPlanAction(params);
      if (!result.success) {
        throw new Error(result.error || 'Failed to create plan');
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mercadopago', 'plans'] });
      console.log('Plan created successfully');
    },
  });
}

/**
 * Hook to update a subscription plan
 */
export function useUpdatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      planId,
      params,
    }: {
      planId: string;
      params: Partial<CreatePlanParams>;
    }) => {
      const result = await updatePlanAction(planId, params);
      if (!result.success) {
        throw new Error(result.error || 'Failed to update plan');
      }
      return result.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['mercadopago', 'plans'] });
      queryClient.invalidateQueries({
        queryKey: ['mercadopago', 'plans', variables.planId],
      });
      console.log('Plan updated successfully');
    },
  });
}
