'use server';

/**
 * MercadoPago Server Actions
 * These server-side functions wrap the MercadoPago SDK methods
 * to be used safely from client components via TanStack Query
 */

import { mercadoPagoService } from './service';
import type {
  CreatePlanParams,
  PlanSearchParams,
  CreatePreApprovalParams,
  PreApprovalSearchParams,
  CreatePaymentParams,
  PaymentSearchParams,
} from './service';
import type { ServiceResponse } from './types';

// ============================================
// SUBSCRIPTION PLANS ACTIONS
// ============================================

export async function createPlanAction(params: CreatePlanParams) {
  const res = await mercadoPagoService.createPlan(params);
  if (!res.success) {
    throw new Error(res.error || 'Failed to create plan');
  }
  return res.data;
}

export async function getPlanAction(planId: string) {
  const res = await mercadoPagoService.getPlan(planId);
  if (!res.success) {
    throw new Error(res.error || 'Failed to get plan');
  }
  return res.data;
}

export async function updatePlanAction(planId: string, params: Partial<CreatePlanParams>) {
  const res = await mercadoPagoService.updatePlan(planId, params);
  if (!res.success) {
    throw new Error(res.error || 'Failed to update plan');
  }
  return res.data;
}

export async function searchPlansAction(params?: PlanSearchParams) {
  const res = await mercadoPagoService.searchPlans(params);
  if (!res.success) {
    throw new Error(res.error || 'Failed to search plans');
  }
  return res.data;
}

export async function getActivePlansAction() {
  const res = await mercadoPagoService.getActivePlans();
  if (!res.success) {
    throw new Error(res.error || 'Failed to get active plans');
  }
  return res.data;
}

// ============================================
// SUBSCRIPTIONS ACTIONS
// ============================================

export async function createSubscriptionAction(params: CreatePreApprovalParams) {
  const res = await mercadoPagoService.createSubscription(params);
  if (!res.success) {
    throw new Error(res.error || 'Failed to create subscription');
  }
  return res.data;
}

export async function getSubscriptionAction(subscriptionId: string) {
  const res = await mercadoPagoService.getSubscription(subscriptionId);
  if (!res.success) {
    throw new Error(res.error || 'Failed to get subscription');
  }
  return res.data;
}

export async function updateSubscriptionAction(subscriptionId: string, params: { status?: 'paused' | 'cancelled'; reason?: string }) {
  const res = await mercadoPagoService.updateSubscription(subscriptionId, params);
  if (!res.success) {
    throw new Error(res.error || 'Failed to update subscription');
  }
  return res.data;
}

export async function cancelSubscriptionAction(subscriptionId: string) {
  const res = await mercadoPagoService.cancelSubscription(subscriptionId);
  if (!res.success) {
    throw new Error(res.error || 'Failed to cancel subscription');
  }
  return res.data;
}

export async function pauseSubscriptionAction(subscriptionId: string) {
  const res = await mercadoPagoService.pauseSubscription(subscriptionId);
  if (!res.success) {
    throw new Error(res.error || 'Failed to pause subscription');
  }
  return res.data;
}

export async function searchSubscriptionsAction(params?: PreApprovalSearchParams) {
  const res = await mercadoPagoService.searchSubscriptions(params);
  if (!res.success) {
    throw new Error(res.error || 'Failed to search subscriptions');
  }
  return res.data;
}

export async function getActiveSubscriptionsAction() {
  const res = await mercadoPagoService.getActiveSubscriptions();
  if (!res.success) {
    throw new Error(res.error || 'Failed to get active subscriptions');
  }
  return res.data;
}

export async function getSubscriptionsByEmailAction(email: string) {
  const res = await mercadoPagoService.getSubscriptionsByEmail(email);
  if (!res.success) {
    throw new Error(res.error || 'Failed to get subscriptions by email');
  }
  return res.data;
}

// ============================================
// PAYMENTS ACTIONS
// ============================================

export async function createPaymentAction(params: CreatePaymentParams) {
  const res = await mercadoPagoService.createPayment(params);
  if (!res.success) {
    throw new Error(res.error || 'Failed to create payment');
  }
  return res.data;
}

export async function getPaymentAction(paymentId: string) {
  const res = await mercadoPagoService.getPayment(paymentId);
  if (!res.success) {
    throw new Error(res.error || 'Failed to get payment');
  }
  return res.data;
}

export async function searchPaymentsAction(params?: PaymentSearchParams) {
  const res = await mercadoPagoService.searchPayments(params);
  if (!res.success) {
    throw new Error(res.error || 'Failed to search payments');
  }
  return res.data;
}

export async function getPaymentsByEmailAction(email: string) {
  const res = await mercadoPagoService.getPaymentsByEmail(email);
  if (!res.success) {
    throw new Error(res.error || 'Failed to get payments by email');
  }
  return res.data;
}

export async function capturePaymentAction(paymentId: string) {
  const res = await mercadoPagoService.capturePayment(paymentId);
  if (!res.success) {
    throw new Error(res.error || 'Failed to capture payment');
  }
  return res.data;
}

export async function cancelPaymentAction(paymentId: string) {
  const res = await mercadoPagoService.cancelPayment(paymentId);
  if (!res.success) {
    throw new Error(res.error || 'Failed to cancel payment');
  }
  return res.data;
}
