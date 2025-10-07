/**
 * MercadoPago Type Definitions
 * Custom types for better TypeScript support
 */

export interface MercadoPagoWebhookEvent {
  id: number;
  live_mode: boolean;
  type:
    | 'payment'
    | 'plan'
    | 'subscription'
    | 'invoice'
    | 'point_integration_wh';
  date_created: string;
  application_id: number;
  user_id: number;
  version: number;
  api_version: string;
  action:
    | 'payment.created'
    | 'payment.updated'
    | 'subscription.created'
    | 'subscription.updated'
    | 'subscription.preapproval_plan.updated'
    | 'subscription.authorized_payment';
  data: {
    id: string;
  };
}

export interface SubscriptionPlan {
  id: string;
  reason: string;
  status: 'active' | 'inactive';
  auto_recurring: {
    frequency: number;
    frequency_type: 'months' | 'days' | 'years';
    transaction_amount: number;
    currency_id: string;
    free_trial?: {
      frequency: number;
      frequency_type: 'months' | 'days' | 'years';
    };
  };
  back_url?: string;
  date_created: string;
  last_modified: string;
}

export interface Subscription {
  id: string;
  preapproval_plan_id: string;
  payer_id: number;
  payer_email: string;
  status: 'authorized' | 'paused' | 'cancelled' | 'pending' | 'ended';
  reason: string;
  init_point: string;
  auto_recurring: {
    frequency: number;
    frequency_type: 'months' | 'days' | 'years';
    transaction_amount: number;
    currency_id: string;
    start_date?: string;
    end_date?: string;
  };
  summarized: {
    quotas: number;
    charged_quantity: number;
    charged_amount: number;
    pending_charge_quantity: number;
    pending_charge_amount: number;
    semaphore: string;
    last_charged_date: string;
    last_charged_amount: number;
  };
  date_created: string;
  last_modified: string;
}

export interface PaymentData {
  id: number;
  status:
    | 'approved'
    | 'pending'
    | 'in_process'
    | 'rejected'
    | 'cancelled'
    | 'refunded';
  status_detail: string;
  payment_type_id: string;
  payment_method_id: string;
  transaction_amount: number;
  currency_id: string;
  description: string;
  payer: {
    email: string;
    first_name?: string;
    last_name?: string;
    identification?: {
      type: string;
      number: string;
    };
  };
  metadata?: Record<string, any>;
  date_created: string;
  date_approved?: string;
  date_last_updated: string;
}

export type PlanStatus = 'active' | 'inactive';
export type SubscriptionStatus =
  | 'authorized'
  | 'paused'
  | 'cancelled'
  | 'pending'
  | 'ended';
export type PaymentStatus =
  | 'approved'
  | 'pending'
  | 'in_process'
  | 'rejected'
  | 'cancelled'
  | 'refunded';

export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
