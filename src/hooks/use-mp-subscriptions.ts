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
import type { CreatePreApprovalParams, PreApprovalSearchParams } from '@/lib/mercadopago/service';

/**
 * Hook to fetch all subscriptions
 * @param params - Search parameters for filtering subscriptions
 */
export function useSubscriptions(params?: PreApprovalSearchParams) {
  return useQuery({
    queryKey: ['mercadopago', 'subscriptions', params],
    queryFn: async () => await searchSubscriptionsAction(params),
  });
}

/**
 * Hook to fetch active subscriptions only
 */
export function useActiveSubscriptions() {
  return useQuery({
    queryKey: ['mercadopago', 'subscriptions', 'active'],
    queryFn: async () => await getActiveSubscriptionsAction(),
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
      return await getSubscriptionsByEmailAction(email);
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
      return await getSubscriptionAction(subscriptionId);
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
      return result?.results?.length || 0;
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
      return await createSubscriptionAction(params);
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
    mutationFn: async ({ subscriptionId, params }: { subscriptionId: string; params: { status?: 'paused' | 'cancelled'; reason?: string } }) => {
      return await updateSubscriptionAction(subscriptionId, params);
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
      return await cancelSubscriptionAction(subscriptionId);
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
      return await pauseSubscriptionAction(subscriptionId);
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
