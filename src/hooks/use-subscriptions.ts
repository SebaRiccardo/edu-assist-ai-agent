'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  searchSubscriptionsAction,
  getActiveSubscriptionsAction,
  getSubscriptionsByEmailAction,
  getSubscriptionAction,
  createSubscriptionAction,
  updateSubscriptionAction,
  cancelSubscriptionAction,
  pauseSubscriptionAction,
} from '@/lib/mercadopago/actions';
import type {
  CreatePreApprovalParams,
  PreApprovalSearchParams,
} from '@/lib/mercadopago/service';

/**
 * Hook to fetch all subscriptions
 * @param params - Search parameters for filtering subscriptions
 */
export function useSubscriptions(params?: PreApprovalSearchParams) {
  return useQuery({
    queryKey: ['mercadopago', 'subscriptions', params],
    queryFn: async () => {
      const result = await searchSubscriptionsAction(params);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch subscriptions');
      }
      return result.data;
    },
  });
}

/**
 * Hook to fetch active subscriptions only
 */
export function useActiveSubscriptions() {
  return useQuery({
    queryKey: ['mercadopago', 'subscriptions', 'active'],
    queryFn: async () => {
      const result = await getActiveSubscriptionsAction();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch active subscriptions');
      }
      return result.data;
    },
  });
}

/**
 * Hook to fetch subscriptions by user email
 * @param email - User email address
 */
export function useUserSubscriptions(email: string | undefined) {
  return useQuery({
    queryKey: ['mercadopago', 'subscriptions', 'user', email],
    queryFn: async () => {
      if (!email) throw new Error('Email is required');
      const result = await getSubscriptionsByEmailAction(email);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch user subscriptions');
      }
      return result.data;
    },
    enabled: !!email,
  });
}

/**
 * Hook to fetch a single subscription by ID
 * @param subscriptionId - The subscription ID
 */
export function useSubscription(subscriptionId: string | undefined) {
  return useQuery({
    queryKey: ['mercadopago', 'subscriptions', subscriptionId],
    queryFn: async () => {
      if (!subscriptionId) throw new Error('Subscription ID is required');
      const result = await getSubscriptionAction(subscriptionId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch subscription');
      }
      return result.data;
    },
    enabled: !!subscriptionId,
  });
}

/**
 * Hook to fetch subscriptions count
 * @param status - Optional status filter
 */
export function useSubscriptionsCount(status?: string) {
  return useQuery({
    queryKey: ['mercadopago', 'subscriptions', 'count', status],
    queryFn: async () => {
      const params = status ? { filters: { status } } : undefined;
      const result = await searchSubscriptionsAction(params);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch subscriptions count');
      }
      return result.data?.results?.length || 0;
    },
  });
}

/**
 * Hook to create a new subscription
 */
export function useCreateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreatePreApprovalParams) => {
      const result = await createSubscriptionAction(params);
      if (!result.success) {
        throw new Error(result.error || 'Failed to create subscription');
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['mercadopago', 'subscriptions'],
      });
      console.log('Subscription created successfully');
    },
  });
}

/**
 * Hook to update a subscription
 */
export function useUpdateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      subscriptionId,
      params,
    }: {
      subscriptionId: string;
      params: { status?: 'paused' | 'cancelled'; reason?: string };
    }) => {
      const result = await updateSubscriptionAction(subscriptionId, params);
      if (!result.success) {
        throw new Error(result.error || 'Failed to update subscription');
      }
      return result.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['mercadopago', 'subscriptions'],
      });
      queryClient.invalidateQueries({
        queryKey: ['mercadopago', 'subscriptions', variables.subscriptionId],
      });
      console.log('Subscription updated successfully');
    },
  });
}

/**
 * Hook to cancel a subscription
 */
export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subscriptionId: string) => {
      const result = await cancelSubscriptionAction(subscriptionId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to cancel subscription');
      }
      return result.data;
    },
    onSuccess: (_, subscriptionId) => {
      queryClient.invalidateQueries({
        queryKey: ['mercadopago', 'subscriptions'],
      });
      queryClient.invalidateQueries({
        queryKey: ['mercadopago', 'subscriptions', subscriptionId],
      });
      console.log('Subscription cancelled successfully');
    },
  });
}

/**
 * Hook to pause a subscription
 */
export function usePauseSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subscriptionId: string) => {
      const result = await pauseSubscriptionAction(subscriptionId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to pause subscription');
      }
      return result.data;
    },
    onSuccess: (_, subscriptionId) => {
      queryClient.invalidateQueries({
        queryKey: ['mercadopago', 'subscriptions'],
      });
      queryClient.invalidateQueries({
        queryKey: ['mercadopago', 'subscriptions', subscriptionId],
      });
      console.log('Subscription paused successfully');
    },
  });
}
