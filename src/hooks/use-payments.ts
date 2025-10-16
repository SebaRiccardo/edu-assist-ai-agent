'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  searchPaymentsAction,
  getPaymentsByEmailAction,
  getPaymentAction,
  createPaymentAction,
  capturePaymentAction,
  cancelPaymentAction,
} from '@/lib/mercadopago/actions';
import type {
  PaymentSearchParams,
  CreatePaymentParams,
} from '@/lib/mercadopago/service';

/**
 * Hook to fetch all payments
 * @param params - Search parameters for filtering payments
 */
export function usePayments(params?: PaymentSearchParams) {
  return useQuery({
    queryKey: ['mercadopago', 'payments', params],
    queryFn: async () => await searchPaymentsAction(params),
  });
}

/**
 * Hook to fetch payments by user email
 * @param email - User's email address
 */
export function useUserPayments(email: string | undefined) {
  return useQuery({
    queryKey: ['mercadopago', 'payments', 'user', email],
    queryFn: async () => {
      if (!email) throw new Error('Email is required');
      return await getPaymentsByEmailAction(email);
    },
    enabled: !!email,
  });
}

/**
 * Hook to fetch a single payment by ID
 * @param paymentId - The payment ID
 */
export function usePayment(paymentId: string | undefined) {
  return useQuery({
    queryKey: ['mercadopago', 'payments', paymentId],
    queryFn: async () => {
      if (!paymentId) throw new Error('Payment ID is required');
      return await getPaymentAction(paymentId);
    },
    enabled: !!paymentId,
  });
}

/**
 * Hook to create a payment
 */
export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreatePaymentParams) => {
      return await createPaymentAction(params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mercadopago', 'payments'] });
    },
  });
}

/**
 * Hook to capture a payment
 */
export function useCapturePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentId: string) => {
      return await capturePaymentAction(paymentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mercadopago', 'payments'] });
    },
  });
}

/**
 * Hook to cancel a payment
 */
export function useCancelPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentId: string) => {
      return await cancelPaymentAction(paymentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mercadopago', 'payments'] });
    },
  });
}
