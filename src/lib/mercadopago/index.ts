/**
 * MercadoPago Integration
 * Export all services, types, and utilities
 */

// Services
export {
  // Subscription Plans
  createSubscriptionPlan,
  getSubscriptionPlan,
  updateSubscriptionPlan,
  searchSubscriptionPlans,
  // Pre-Approvals (Subscriptions)
  createPreApproval,
  getPreApproval,
  updatePreApproval,
  cancelPreApproval,
  pausePreApproval,
  searchPreApprovals,
  // Payments
  createPayment,
  getPayment,
  searchPayments,
  refundPayment,
  capturePayment,
  cancelPayment,
  // Utilities
  validateWebhookSignature,
  formatCurrency,
  getSubscriptionStatusLabel,
  getPaymentStatusLabel,
} from './service';

// Types
export type {
  CreatePlanParams,
  PlanSearchParams,
  CreatePreApprovalParams,
  CreatePaymentParams,
} from './service';

export type {
  MercadoPagoWebhookEvent,
  MpSubscriptionPlan as SubscriptionPlan,
  MpSubscription as Subscription,
  PaymentData,
  PlanStatus,
  SubscriptionStatus,
  PaymentStatus,
  ServiceResponse,
} from './types';

// Webhook
export { handleMercadoPagoWebhook } from './webhook';

// Helpers
export {
  setupInboxProfPlans,
  setupInboxProfPlansWithTrial,
  subscribeUserToPlan,
  getUserSubscriptionStatus,
  cancelUserSubscription,
} from './helpers';
