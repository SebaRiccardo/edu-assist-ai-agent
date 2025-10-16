import MercadoPagoConfig, {
  PreApprovalPlan,
  PreApproval,
  Payment,
} from 'mercadopago';
import { mercadoPagoClient } from '@/lib/mercadopago/mercadopago-client';
import type { ServiceResponse } from './types';
import { PreApprovalPlanSearchPaging } from 'mercadopago/dist/clients/preApprovalPlan/search/types';
import { PreApprovalPlanResponse } from 'mercadopago/dist/clients/preApprovalPlan/commonTypes';
import { PreApprovalResponse } from 'mercadopago/dist/clients/preApproval/commonTypes';
import { PreApprovalSearchResponse } from 'mercadopago/dist/clients/preApproval/search/types';

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
  status?: string;
  q?: string;
  sort?: string;
  criteria?: string;
}

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

export interface PreApprovalSearchParams {
  limit?: number;
  offset?: number;
  filters?: {
    status?: string;
    email?: string;
  };
}

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

export interface PaymentSearchParams {
  limit?: number;
  offset?: number;
  filters?: {
    status?: string;
    email?: string;
  };
}

export class MercadoPagoService {
  private preApprovalPlanClient: PreApprovalPlan;
  private preApprovalClient: PreApproval;
  private paymentClient: Payment;

  constructor() {
    const mercadoPagoClient = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
      options: {
        timeout: 5000,
      },
    });

    this.preApprovalPlanClient = new PreApprovalPlan(mercadoPagoClient);
    this.preApprovalClient = new PreApproval(mercadoPagoClient);
    this.paymentClient = new Payment(mercadoPagoClient);
  }

  async createPlan(params: CreatePlanParams): Promise<ServiceResponse> {
    try {
      const requestBody = {
        reason: params.reason,
        auto_recurring: {
          frequency: params.autoRecurring.frequency,
          frequency_type: params.autoRecurring.frequencyType,
          transaction_amount: params.autoRecurring.transactionAmount,
          currency_id: params.autoRecurring.currencyId,
          ...(params.autoRecurring.freeTrial && {
            free_trial: {
              frequency: params.autoRecurring.freeTrial.frequency,
              frequency_type: params.autoRecurring.freeTrial.frequencyType,
            },
          }),
        },
        back_url: params.backUrl,
      };
      const response = await this.preApprovalPlanClient.create({
        body: requestBody,
      });
      const { api_response, ...res } = response;
      return { success: true, data: res };
    } catch (error: any) {
      console.error('Error creating subscription plan:', error);
      return {
        success: false,
        error: error.message || 'Failed to create subscription plan',
      };
    }
  }

  async getPlan(planId: string): Promise<ServiceResponse> {
    try {
      const response = await this.preApprovalPlanClient.get({
        preApprovalPlanId: planId,
      });
      const { api_response, ...res } = response;
      return { success: true, data: res };
    } catch (error: any) {
      console.error('Error getting subscription plan:', error);
      return {
        success: false,
        error: error.message || 'Failed to get subscription plan',
      };
    }
  }

  async updatePlan(
    planId: string,
    params: Partial<CreatePlanParams>
  ): Promise<ServiceResponse> {
    try {
      const updateBody: any = { preApprovalPlanId: planId };
      if (params.reason) updateBody.reason = params.reason;
      if (params.autoRecurring) {
        updateBody.auto_recurring = {
          frequency: params.autoRecurring.frequency,
          frequency_type: params.autoRecurring.frequencyType,
          transaction_amount: params.autoRecurring.transactionAmount,
          currency_id: params.autoRecurring.currencyId,
        };
      }
      if (params.backUrl) updateBody.back_url = params.backUrl;
      const response = await this.preApprovalPlanClient.update(updateBody);
      const { api_response, ...res } = response;
      return { success: true, data: res };
    } catch (error: any) {
      console.error('Error updating subscription plan:', error);
      return {
        success: false,
        error: error.message || 'Failed to update subscription plan',
      };
    }
  }

  async searchPlans(params?: PlanSearchParams): Promise<
    ServiceResponse<{
      paging?: PreApprovalPlanSearchPaging;
      results?: Array<Omit<PreApprovalPlanResponse, 'api_response'>>;
    }>
  > {
    try {
      const response = await this.preApprovalPlanClient.search({
        options: {
          limit: params?.limit || 10,
          offset: params?.offset || 0,
          ...params,
        },
      });
      const cleanResults = response.results?.map(
        ({ api_response, ...res }) => res
      );
      return {
        success: true,
        data: { paging: response.paging, results: cleanResults },
      };
    } catch (error: any) {
      console.error('Error searching subscription plans:', error);
      return {
        success: false,
        error: error.message || 'Failed to search subscription plans',
      };
    }
  }

  async getActivePlans(): Promise<ServiceResponse> {
    return await this.searchPlans({ status: 'active' });
  }

  async createSubscription(
    params: CreatePreApprovalParams
  ): Promise<ServiceResponse> {
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
      const response = await this.preApprovalClient.create({ body });
      const { api_response, ...res } = response;
      return { success: true, data: res };
    } catch (error: any) {
      console.error('Error creating subscription:', error);
      return {
        success: false,
        error: error.message || 'Failed to create subscription',
      };
    }
  }

  async getSubscription(
    subscriptionId: string
  ): Promise<ServiceResponse<Omit<PreApprovalResponse, 'api_response'>>> {
    try {
      const response = await this.preApprovalClient.get({ id: subscriptionId });
      const { api_response, ...res } = response;
      return { success: true, data: res };
    } catch (error: any) {
      console.error('Error getting subscription:', error);
      return {
        success: false,
        error: error.message || 'Failed to get subscription',
      };
    }
  }

  async updateSubscription(
    subscriptionId: string,
    params: { status?: 'paused' | 'cancelled'; reason?: string }
  ): Promise<ServiceResponse> {
    try {
      const response = await this.preApprovalClient.update({
        id: subscriptionId,
        body: params,
      });
      const { api_response, ...res } = response as any;
      return { success: true, data: res };
    } catch (error: any) {
      console.error('Error updating subscription:', error);
      return {
        success: false,
        error: error.message || 'Failed to update subscription',
      };
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<ServiceResponse> {
    try {
      const response = await this.preApprovalClient.update({
        id: subscriptionId,
        body: { status: 'cancelled' },
      });
      const { api_response, ...res } = response as any;
      return { success: true, data: res };
    } catch (error: any) {
      console.error('Error canceling subscription:', error);
      return {
        success: false,
        error: error.message || 'Failed to cancel subscription',
      };
    }
  }

  async pauseSubscription(subscriptionId: string): Promise<ServiceResponse> {
    try {
      const response = await this.preApprovalClient.update({
        id: subscriptionId,
        body: { status: 'paused' },
      });
      const { api_response, ...res } = response as any;
      return { success: true, data: res };
    } catch (error: any) {
      console.error('Error pausing subscription:', error);
      return {
        success: false,
        error: error.message || 'Failed to pause subscription',
      };
    }
  }

  async searchSubscriptions(
    params?: PreApprovalSearchParams
  ): Promise<ServiceResponse<PreApprovalSearchResponse>> {
    try {
      //PreApprovalSearchResponse do not have the api_response field because the SDK
      //does not return it but it is there and will cause the server action to throw an error
      const response: PreApprovalSearchResponse =
        await this.preApprovalClient.search({
          options: {
            limit: params?.limit || 10,
            offset: params?.offset || 0,
            ...params?.filters,
          },
        });
      const { api_response, ...res } = response as any;
      return { success: true, data: res };
    } catch (error: any) {
      console.error('Error searching subscriptions:', error);
      return {
        success: false,
        error: error.message || 'Failed to search subscriptions',
      };
    }
  }

  async getActiveSubscriptions(): Promise<ServiceResponse> {
    return this.searchSubscriptions({ filters: { status: 'active' } });
  }

  async getSubscriptionsByEmail(email: string): Promise<ServiceResponse> {
    return this.searchSubscriptions({ filters: { email } });
  }

  async createPayment(params: CreatePaymentParams): Promise<ServiceResponse> {
    try {
      const body: any = {
        transaction_amount: params.transactionAmount,
        description: params.description,
        payment_method_id: params.paymentMethodId,
        payer: { email: params.payer.email },
      };
      if (params.payer.firstName)
        body.payer.first_name = params.payer.firstName;
      if (params.payer.lastName) body.payer.last_name = params.payer.lastName;
      if (params.payer.identification)
        body.payer.identification = params.payer.identification;
      if (params.token) body.token = params.token;
      if (params.installments) body.installments = params.installments;
      if (params.metadata) body.metadata = params.metadata;

      const response = await this.paymentClient.create({ body });

      const { api_response, ...res } = response as any;
      return { success: true, data: res };
    } catch (error: any) {
      console.error('Error creating payment:', error);
      return {
        success: false,
        error: error.message || 'Failed to create payment',
      };
    }
  }

  async getPayment(paymentId: string): Promise<ServiceResponse> {
    try {
      const response = await this.paymentClient.get({ id: paymentId });
      const { api_response, ...res } = response as any;
      return { success: true, data: res };
    } catch (error: any) {
      console.error('Error getting payment:', error);
      return {
        success: false,
        error: error.message || 'Failed to get payment',
      };
    }
  }

  async searchPayments(params?: PaymentSearchParams): Promise<ServiceResponse> {
    try {
      const response = await this.paymentClient.search({
        options: {
          limit: params?.limit || 10,
          offset: params?.offset || 0,
          ...params?.filters,
        },
      });
      const cleanResults = (response.results as any[])?.map(
        ({ api_response, ...res }) => res
      );
      return { success: true, data: { ...response, results: cleanResults } };
    } catch (error: any) {
      console.error('Error searching payments:', error);
      return {
        success: false,
        error: error.message || 'Failed to search payments',
      };
    }
  }

  async getPaymentsByEmail(email: string): Promise<ServiceResponse> {
    return this.searchPayments({ filters: { email } });
  }

  async capturePayment(paymentId: string): Promise<ServiceResponse> {
    try {
      const response = await this.paymentClient.capture({ id: paymentId });
      const { api_response, ...res } = response as any;
      return { success: true, data: res };
    } catch (error: any) {
      console.error('Error capturing payment:', error);
      return {
        success: false,
        error: error.message || 'Failed to capture payment',
      };
    }
  }

  async cancelPayment(paymentId: string): Promise<ServiceResponse> {
    try {
      const response = await this.paymentClient.cancel({ id: paymentId });
      const { api_response, ...res } = response as any;
      return { success: true, data: res };
    } catch (error: any) {
      console.error('Error canceling payment:', error);
      return {
        success: false,
        error: error.message || 'Failed to cancel payment',
      };
    }
  }

  validateWebhookSignature(
    xSignature: string,
    xRequestId: string,
    dataId: string
  ): boolean {
    try {
      const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
      if (!secret) {
        console.warn('MERCADOPAGO_WEBHOOK_SECRET not configured');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error validating webhook signature:', error);
      return false;
    }
  }

  formatCurrency(amount: number, currencyId: string): string {
    const formatter = new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currencyId,
    });
    return formatter.format(amount);
  }

  getSubscriptionStatusLabel(status: string): string {
    const statusLabels: Record<string, string> = {
      authorized: 'Active',
      paused: 'Paused',
      cancelled: 'Cancelled',
      pending: 'Pending',
      ended: 'Ended',
    };
    return statusLabels[status] || status;
  }

  getPaymentStatusLabel(status: string): string {
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
}

export const mercadoPagoService = new MercadoPagoService();

export const createSubscriptionPlan = (params: CreatePlanParams) =>
  mercadoPagoService.createPlan(params);
export const getSubscriptionPlan = (planId: string) =>
  mercadoPagoService.getPlan(planId);
export const updateSubscriptionPlan = (
  planId: string,
  params: Partial<CreatePlanParams>
) => mercadoPagoService.updatePlan(planId, params);
export const searchSubscriptionPlans = (params?: PlanSearchParams) =>
  mercadoPagoService.searchPlans(params);
export const createPreApproval = (params: CreatePreApprovalParams) =>
  mercadoPagoService.createSubscription(params);
export const getPreApproval = (subscriptionId: string) =>
  mercadoPagoService.getSubscription(subscriptionId);
export const updatePreApproval = (
  subscriptionId: string,
  params: { status?: 'paused' | 'cancelled'; reason?: string }
) => mercadoPagoService.updateSubscription(subscriptionId, params);
export const cancelPreApproval = (subscriptionId: string) =>
  mercadoPagoService.cancelSubscription(subscriptionId);
export const pausePreApproval = (subscriptionId: string) =>
  mercadoPagoService.pauseSubscription(subscriptionId);
export const searchPreApprovals = (params?: PreApprovalSearchParams) =>
  mercadoPagoService.searchSubscriptions(params);
export const createPayment = (params: CreatePaymentParams) =>
  mercadoPagoService.createPayment(params);
export const getPayment = (paymentId: string) =>
  mercadoPagoService.getPayment(paymentId);
export const searchPayments = (params?: PaymentSearchParams) =>
  mercadoPagoService.searchPayments(params);
export const capturePayment = (paymentId: string) =>
  mercadoPagoService.capturePayment(paymentId);
export const cancelPayment = (paymentId: string) =>
  mercadoPagoService.cancelPayment(paymentId);
export const validateWebhookSignature = (
  xSignature: string,
  xRequestId: string,
  dataId: string
) =>
  mercadoPagoService.validateWebhookSignature(xSignature, xRequestId, dataId);
export const formatCurrency = (amount: number, currencyId: string) =>
  mercadoPagoService.formatCurrency(amount, currencyId);
export const getSubscriptionStatusLabel = (status: string) =>
  mercadoPagoService.getSubscriptionStatusLabel(status);
export const getPaymentStatusLabel = (status: string) =>
  mercadoPagoService.getPaymentStatusLabel(status);
export const refundPayment = async (paymentId: string, amount?: number) => {
  console.warn('refundPayment is not yet implemented in MercadoPago SDK');
  return { success: false, error: 'Refund functionality not yet implemented' };
};
