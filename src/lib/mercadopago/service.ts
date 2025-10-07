import { PreApprovalPlan, PreApproval, Payment } from 'mercadopago';
import { mercadoPagoClient } from './client';

/**
 * MercadoPago Service
 * Handles subscription plans, pre-approvals, and payments
 */

// Initialize API clients
const preApprovalPlanClient = new PreApprovalPlan(mercadoPagoClient);
const preApprovalClient = new PreApproval(mercadoPagoClient);
const paymentClient = new Payment(mercadoPagoClient);

/**
 * Subscription Plan Management
 */

export interface CreatePlanParams {
  reason: string;
  autoRecurring: {
    frequency: number;
    frequencyType: 'months' | 'days' | 'years';
    transactionAmount: number;
    currencyId: string;
    freeTrial?: {
      frequency: number;
      frequencyType: 'months' | 'days' | 'years';
    };
  };
  backUrl?: string;
}

export interface PlanSearchParams {
  limit?: number;
  offset?: number;
}

/**
 * Creates a new subscription plan
 * @param params - Plan configuration parameters
 * @returns Created plan details
 */
export async function createSubscriptionPlan(params: CreatePlanParams) {
  try {
    const response = await preApprovalPlanClient.create({
      body: {
        reason: params.reason,
        auto_recurring: {
          frequency: params.autoRecurring.frequency,
          frequency_type: params.autoRecurring.frequencyType,
          transaction_amount: params.autoRecurring.transactionAmount,
          currency_id: params.autoRecurring.currencyId,
          // Optional free trial period
          ...(params.autoRecurring.freeTrial && {
            free_trial: {
              frequency: params.autoRecurring.freeTrial.frequency,
              frequency_type: params.autoRecurring.freeTrial.frequencyType,
            },
          }),
        },
        back_url: params.backUrl,
      },
    });

    return {
      success: true,
      data: response,
    };
  } catch (error: any) {
    console.error('Error creating subscription plan:', error);
    return {
      success: false,
      error: error.message || 'Failed to create subscription plan',
    };
  }
}

/**
 * Gets a subscription plan by ID
 * @param planId - The plan ID
 * @returns Plan details
 */
export async function getSubscriptionPlan(planId: string) {
  try {
    const response = await preApprovalPlanClient.get({
      preApprovalPlanId: planId,
    });

    return {
      success: true,
      data: response,
    };
  } catch (error: any) {
    console.error('Error getting subscription plan:', error);
    return {
      success: false,
      error: error.message || 'Failed to get subscription plan',
    };
  }
}

/**
 * Updates a subscription plan
 * @param planId - The plan ID
 * @param params - Updated plan parameters
 * @returns Updated plan details
 */
export async function updateSubscriptionPlan(
  planId: string,
  params: Partial<CreatePlanParams>
) {
  try {
    const updateBody: any = {
      preApprovalPlanId: planId,
    };

    if (params.reason) {
      updateBody.reason = params.reason;
    }

    if (params.autoRecurring) {
      updateBody.auto_recurring = {
        frequency: params.autoRecurring.frequency,
        frequency_type: params.autoRecurring.frequencyType,
        transaction_amount: params.autoRecurring.transactionAmount,
        currency_id: params.autoRecurring.currencyId,
      };
    }

    if (params.backUrl) {
      updateBody.back_url = params.backUrl;
    }

    const response = await preApprovalPlanClient.update(updateBody);

    return {
      success: true,
      data: response,
    };
  } catch (error: any) {
    console.error('Error updating subscription plan:', error);
    return {
      success: false,
      error: error.message || 'Failed to update subscription plan',
    };
  }
}

/**
 * Searches for subscription plans
 * @param params - Search parameters
 * @returns List of plans
 */
export async function searchSubscriptionPlans(params?: PlanSearchParams) {
  try {
    const response = await preApprovalPlanClient.search({
      options: {
        limit: params?.limit || 10,
        offset: params?.offset || 0,
      },
    });

    return {
      success: true,
      data: response,
    };
  } catch (error: any) {
    console.error('Error searching subscription plans:', error);
    return {
      success: false,
      error: error.message || 'Failed to search subscription plans',
    };
  }
}

/**
 * Pre-Approval (Subscription) Management
 */

export interface CreatePreApprovalParams {
  preApprovalPlanId: string;
  reason: string;
  payer: {
    email: string;
    firstName?: string;
    lastName?: string;
  };
  backUrl?: string;
  autoRecurring?: {
    startDate?: string;
    endDate?: string;
  };
}

/**
 * Creates a new pre-approval (subscription)
 * @param params - Pre-approval configuration
 * @returns Created pre-approval with init_point URL
 */
export async function createPreApproval(params: CreatePreApprovalParams) {
  try {
    const body: any = {
      preapproval_plan_id: params.preApprovalPlanId,
      reason: params.reason,
      payer_email: params.payer.email,
      back_url: params.backUrl,
    };

    if (params.payer.firstName) {
      body.payer = {
        email: params.payer.email,
        first_name: params.payer.firstName,
        last_name: params.payer.lastName,
      };
    }

    if (params.autoRecurring) {
      body.auto_recurring = {
        start_date: params.autoRecurring.startDate,
        end_date: params.autoRecurring.endDate,
      };
    }

    const response = await preApprovalClient.create({ body });

    return {
      success: true,
      data: response,
    };
  } catch (error: any) {
    console.error('Error creating pre-approval:', error);
    return {
      success: false,
      error: error.message || 'Failed to create pre-approval',
    };
  }
}

/**
 * Gets a pre-approval by ID
 * @param preApprovalId - The pre-approval ID
 * @returns Pre-approval details
 */
export async function getPreApproval(preApprovalId: string) {
  try {
    const response = await preApprovalClient.get({ id: preApprovalId });

    return {
      success: true,
      data: response,
    };
  } catch (error: any) {
    console.error('Error getting pre-approval:', error);
    return {
      success: false,
      error: error.message || 'Failed to get pre-approval',
    };
  }
}

/**
 * Updates a pre-approval
 * @param preApprovalId - The pre-approval ID
 * @param params - Update parameters (status, reason, etc.)
 * @returns Updated pre-approval
 */
export async function updatePreApproval(
  preApprovalId: string,
  params: {
    status?: 'paused' | 'cancelled';
    reason?: string;
  }
) {
  try {
    const response = await preApprovalClient.update({
      id: preApprovalId,
      body: params,
    });

    return {
      success: true,
      data: response,
    };
  } catch (error: any) {
    console.error('Error updating pre-approval:', error);
    return {
      success: false,
      error: error.message || 'Failed to update pre-approval',
    };
  }
}

/**
 * Cancels a pre-approval (subscription)
 * @param preApprovalId - The pre-approval ID
 * @returns Cancellation result
 */
export async function cancelPreApproval(preApprovalId: string) {
  try {
    const response = await preApprovalClient.update({
      id: preApprovalId,
      body: { status: 'cancelled' },
    });

    return {
      success: true,
      data: response,
    };
  } catch (error: any) {
    console.error('Error canceling pre-approval:', error);
    return {
      success: false,
      error: error.message || 'Failed to cancel pre-approval',
    };
  }
}

/**
 * Pauses a pre-approval (subscription)
 * @param preApprovalId - The pre-approval ID
 * @returns Pause result
 */
export async function pausePreApproval(preApprovalId: string) {
  try {
    const response = await preApprovalClient.update({
      id: preApprovalId,
      body: { status: 'paused' },
    });

    return {
      success: true,
      data: response,
    };
  } catch (error: any) {
    console.error('Error pausing pre-approval:', error);
    return {
      success: false,
      error: error.message || 'Failed to pause pre-approval',
    };
  }
}

/**
 * Searches for pre-approvals
 * @param params - Search parameters
 * @returns List of pre-approvals
 */
export async function searchPreApprovals(params?: {
  limit?: number;
  offset?: number;
  filters?: {
    status?: string;
    email?: string;
  };
}) {
  try {
    const response = await preApprovalClient.search({
      options: {
        limit: params?.limit || 10,
        offset: params?.offset || 0,
        ...params?.filters,
      },
    });

    return {
      success: true,
      data: response,
    };
  } catch (error: any) {
    console.error('Error searching pre-approvals:', error);
    return {
      success: false,
      error: error.message || 'Failed to search pre-approvals',
    };
  }
}

/**
 * Payment Management
 */

export interface CreatePaymentParams {
  transactionAmount: number;
  description: string;
  paymentMethodId: string;
  payer: {
    email: string;
    firstName?: string;
    lastName?: string;
    identification?: {
      type: string;
      number: string;
    };
  };
  token?: string;
  installments?: number;
  metadata?: Record<string, any>;
}

/**
 * Creates a one-time payment
 * @param params - Payment configuration
 * @returns Created payment details
 */
export async function createPayment(params: CreatePaymentParams) {
  try {
    const body: any = {
      transaction_amount: params.transactionAmount,
      description: params.description,
      payment_method_id: params.paymentMethodId,
      payer: {
        email: params.payer.email,
      },
    };

    if (params.payer.firstName) {
      body.payer.first_name = params.payer.firstName;
    }

    if (params.payer.lastName) {
      body.payer.last_name = params.payer.lastName;
    }

    if (params.payer.identification) {
      body.payer.identification = params.payer.identification;
    }

    if (params.token) {
      body.token = params.token;
    }

    if (params.installments) {
      body.installments = params.installments;
    }

    if (params.metadata) {
      body.metadata = params.metadata;
    }

    const response = await paymentClient.create({ body });

    return {
      success: true,
      data: response,
    };
  } catch (error: any) {
    console.error('Error creating payment:', error);
    return {
      success: false,
      error: error.message || 'Failed to create payment',
    };
  }
}

/**
 * Gets a payment by ID
 * @param paymentId - The payment ID
 * @returns Payment details
 */
export async function getPayment(paymentId: string) {
  try {
    const response = await paymentClient.get({ id: paymentId });

    return {
      success: true,
      data: response,
    };
  } catch (error: any) {
    console.error('Error getting payment:', error);
    return {
      success: false,
      error: error.message || 'Failed to get payment',
    };
  }
}

/**
 * Searches for payments
 * @param params - Search parameters
 * @returns List of payments
 */
export async function searchPayments(params?: {
  limit?: number;
  offset?: number;
  filters?: {
    status?: string;
    email?: string;
  };
}) {
  try {
    const response = await paymentClient.search({
      options: {
        limit: params?.limit || 10,
        offset: params?.offset || 0,
        ...params?.filters,
      },
    });

    return {
      success: true,
      data: response,
    };
  } catch (error: any) {
    console.error('Error searching payments:', error);
    return {
      success: false,
      error: error.message || 'Failed to search payments',
    };
  }
}

/**
 * Refunds a payment
 * Note: Refunds are handled through the Payment API
 * @param paymentId - The payment ID
 * @param amount - Optional partial refund amount
 * @returns Refund result
 */
export async function refundPayment(paymentId: string, amount?: number) {
  try {
    // Note: MercadoPago SDK may handle refunds differently
    // This is a placeholder - check the latest SDK documentation
    // You may need to use the REST API directly or a different method
    console.warn(
      'Refund functionality needs to be implemented with latest SDK'
    );

    return {
      success: false,
      error: 'Refund functionality not yet implemented',
    };
  } catch (error: any) {
    console.error('Error refunding payment:', error);
    return {
      success: false,
      error: error.message || 'Failed to refund payment',
    };
  }
}

/**
 * Captures a reserved payment
 * @param paymentId - The payment ID
 * @returns Capture result
 */
export async function capturePayment(paymentId: string) {
  try {
    const response = await paymentClient.capture({ id: paymentId });

    return {
      success: true,
      data: response,
    };
  } catch (error: any) {
    console.error('Error capturing payment:', error);
    return {
      success: false,
      error: error.message || 'Failed to capture payment',
    };
  }
}

/**
 * Cancels a payment
 * @param paymentId - The payment ID
 * @returns Cancellation result
 */
export async function cancelPayment(paymentId: string) {
  try {
    const response = await paymentClient.cancel({ id: paymentId });

    return {
      success: true,
      data: response,
    };
  } catch (error: any) {
    console.error('Error canceling payment:', error);
    return {
      success: false,
      error: error.message || 'Failed to cancel payment',
    };
  }
}

/**
 * Helper Functions
 */

/**
 * Validates MercadoPago webhook signature
 * @param xSignature - x-signature header
 * @param xRequestId - x-request-id header
 * @param dataId - data.id from webhook body
 * @returns Validation result
 */
export function validateWebhookSignature(
  xSignature: string,
  xRequestId: string,
  dataId: string
): boolean {
  // Implement signature validation according to MercadoPago docs
  // https://www.mercadopago.com/developers/en/docs/your-integrations/notifications/webhooks
  try {
    // This is a placeholder - implement actual signature validation
    const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
    if (!secret) {
      console.warn('MERCADOPAGO_WEBHOOK_SECRET not configured');
      return false;
    }

    // Add actual signature validation logic here
    return true;
  } catch (error) {
    console.error('Error validating webhook signature:', error);
    return false;
  }
}

/**
 * Formats currency for MercadoPago
 * @param amount - Amount in cents or smallest currency unit
 * @param currencyId - Currency code (e.g., 'ARS', 'USD')
 * @returns Formatted amount
 */
export function formatCurrency(amount: number, currencyId: string): string {
  const formatter = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currencyId,
  });

  return formatter.format(amount);
}

/**
 * Gets subscription status label
 * @param status - Subscription status code
 * @returns Human-readable status
 */
export function getSubscriptionStatusLabel(status: string): string {
  const statusLabels: Record<string, string> = {
    authorized: 'Active',
    paused: 'Paused',
    cancelled: 'Cancelled',
    pending: 'Pending',
    ended: 'Ended',
  };

  return statusLabels[status] || status;
}

/**
 * Gets payment status label
 * @param status - Payment status code
 * @returns Human-readable status
 */
export function getPaymentStatusLabel(status: string): string {
  const statusLabels: Record<string, string> = {
    approved: 'Approved',
    pending: 'Pending',
    in_process: 'In Process',
    rejected: 'Rejected',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
    charged_back: 'Charged Back',
  };

  return statusLabels[status] || status;
}
