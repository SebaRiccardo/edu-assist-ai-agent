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

export async function createPlanAction(
  params: CreatePlanParams
): Promise<ServiceResponse> {
  return mercadoPagoService.createPlan(params);
}

export async function getPlanAction(planId: string): Promise<ServiceResponse> {
  return mercadoPagoService.getPlan(planId);
}

export async function updatePlanAction(
  planId: string,
  params: Partial<CreatePlanParams>
): Promise<ServiceResponse> {
  return mercadoPagoService.updatePlan(planId, params);
}

export async function searchPlansAction(
  params?: PlanSearchParams
): Promise<ServiceResponse> {
  return mercadoPagoService.searchPlans(params);
}

export async function getActivePlansAction(): Promise<ServiceResponse> {
  return mercadoPagoService.getActivePlans();
}

// ============================================
// SUBSCRIPTIONS ACTIONS
// ============================================

export async function createSubscriptionAction(
  params: CreatePreApprovalParams
): Promise<ServiceResponse> {
  return mercadoPagoService.createSubscription(params);
}

export async function getSubscriptionAction(
  subscriptionId: string
): Promise<ServiceResponse> {
  return mercadoPagoService.getSubscription(subscriptionId);
}

export async function updateSubscriptionAction(
  subscriptionId: string,
  params: { status?: 'paused' | 'cancelled'; reason?: string }
): Promise<ServiceResponse> {
  return mercadoPagoService.updateSubscription(subscriptionId, params);
}

export async function cancelSubscriptionAction(
  subscriptionId: string
): Promise<ServiceResponse> {
  return mercadoPagoService.cancelSubscription(subscriptionId);
}

export async function pauseSubscriptionAction(
  subscriptionId: string
): Promise<ServiceResponse> {
  return mercadoPagoService.pauseSubscription(subscriptionId);
}

export async function searchSubscriptionsAction(
  params?: PreApprovalSearchParams
): Promise<ServiceResponse> {
  return mercadoPagoService.searchSubscriptions(params);
}

export async function getActiveSubscriptionsAction(): Promise<ServiceResponse> {
  return mercadoPagoService.getActiveSubscriptions();
}

export async function getSubscriptionsByEmailAction(
  email: string
): Promise<ServiceResponse> {
  return mercadoPagoService.getSubscriptionsByEmail(email);
}

// ============================================
// PAYMENTS ACTIONS
// ============================================

export async function createPaymentAction(
  params: CreatePaymentParams
): Promise<ServiceResponse> {
  return mercadoPagoService.createPayment(params);
}

export async function getPaymentAction(
  paymentId: string
): Promise<ServiceResponse> {
  return mercadoPagoService.getPayment(paymentId);
}

export async function searchPaymentsAction(
  params?: PaymentSearchParams
): Promise<ServiceResponse> {
  return mercadoPagoService.searchPayments(params);
}

export async function getPaymentsByEmailAction(
  email: string
): Promise<ServiceResponse> {
  return mercadoPagoService.getPaymentsByEmail(email);
}

export async function capturePaymentAction(
  paymentId: string
): Promise<ServiceResponse> {
  return mercadoPagoService.capturePayment(paymentId);
}

export async function cancelPaymentAction(
  paymentId: string
): Promise<ServiceResponse> {
  return mercadoPagoService.cancelPayment(paymentId);
}
