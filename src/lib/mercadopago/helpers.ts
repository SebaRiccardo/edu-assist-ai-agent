/**
 * InboxProfs AI - MercadoPago Helpers
 * Common subscription and payment helpers for the application
 */

import {
  createSubscriptionPlan,
  createPreApproval,
  getPreApproval,
  cancelPreApproval,
} from './service';
import { INBOX_PROFS_PLANS } from '../subscriptions/plans';

/**
 * Creates all InboxProfs AI subscription plans in MercadoPago
 * Run this once during initial setup
 * @param currencyId - Currency code (e.g., 'USD', 'ARS', 'BRL')
 * @returns Created plan IDs
 */
export async function setupInboxProfPlans(currencyId: string = 'ARS') {
  const results = {
    free: null as string | null,
    basic: null as string | null,
    pro: null as string | null,
  };

  // Free Plan (for tracking purposes, even though it's $0)
  const freePlanResult = await createSubscriptionPlan({
    reason: 'InboxProfs AI - Free Plan',
    autoRecurring: {
      frequency: 1,
      frequencyType: 'months',
      transactionAmount: INBOX_PROFS_PLANS.FREE.price,
      currencyId,
    },
  });

  if (freePlanResult.success) {
    results.free = freePlanResult.data?.id || null;
    console.log('Free plan created:', results.free);
  }

  // Basic Plan
  const basicPlanResult = await createSubscriptionPlan({
    reason: 'InboxProfs AI - Basic Plan',
    autoRecurring: {
      frequency: 1,
      frequencyType: 'months',
      transactionAmount: INBOX_PROFS_PLANS.BASIC.price,
      currencyId,
    },
  });

  if (basicPlanResult.success) {
    results.basic = basicPlanResult.data?.id || null;
    console.log('Basic plan created:', results.basic);
  }

  // Pro Plan
  const proPlanResult = await createSubscriptionPlan({
    reason: 'InboxProfs AI - Pro Plan',
    autoRecurring: {
      frequency: 1,
      frequencyType: 'months',
      transactionAmount: INBOX_PROFS_PLANS.PRO.price,
      currencyId,
    },
  });

  if (proPlanResult.success) {
    results.pro = proPlanResult.data?.id || null;
    console.log('Pro plan created:', results.pro);
  }

  return results;
}

/**
 * Creates InboxProfs AI subscription plans WITH free trial
 * Run this once during initial setup if you want to offer trial periods
 * @param currencyId - Currency code (e.g., 'USD', 'ARS', 'BRL')
 * @param trialDays - Number of trial days (default: 7)
 * @returns Created plan IDs
 */
export async function setupInboxProfPlansWithTrial(
  currencyId: string = 'ARS',
  trialDays: number = 7
) {
  const results = {
    free: null as string | null,
    basic: null as string | null,
    pro: null as string | null,
  };

  // Free Plan (no trial needed, already free)
  const freePlanResult = await createSubscriptionPlan({
    reason: 'InboxProfs AI - Free Plan',
    autoRecurring: {
      frequency: 1,
      frequencyType: 'months',
      transactionAmount: INBOX_PROFS_PLANS.FREE.price,
      currencyId,
    },
  });

  if (freePlanResult.success) {
    results.free = freePlanResult.data?.id || null;
    console.log('Free plan created:', results.free);
  }

  // Basic Plan with trial
  const basicPlanResult = await createSubscriptionPlan({
    reason: 'InboxProfs AI - Basic Plan (with trial)',
    autoRecurring: {
      frequency: 1,
      frequencyType: 'months',
      transactionAmount: INBOX_PROFS_PLANS.BASIC.price,
      currencyId,
      freeTrial: {
        frequency: trialDays,
        frequencyType: 'days',
      },
    },
  });

  if (basicPlanResult.success) {
    results.basic = basicPlanResult.data?.id || null;
    console.log('Basic plan (with trial) created:', results.basic);
  }

  // Pro Plan with trial
  const proPlanResult = await createSubscriptionPlan({
    reason: 'InboxProfs AI - Pro Plan (with trial)',
    autoRecurring: {
      frequency: 1,
      frequencyType: 'months',
      transactionAmount: INBOX_PROFS_PLANS.PRO.price,
      currencyId,
      freeTrial: {
        frequency: trialDays,
        frequencyType: 'days',
      },
    },
  });

  if (proPlanResult.success) {
    results.pro = proPlanResult.data?.id || null;
    console.log('Pro plan (with trial) created:', results.pro);
  }

  return results;
}

/**
 * Subscribes a user to a plan
 * @param planId - MercadoPago plan ID
 * @param userEmail - User's email
 * @param userName - User's full name
 * @returns Subscription details with checkout URL
 */
export async function subscribeUserToPlan(
  planId: string,
  userEmail: string,
  userName: string
) {
  const [firstName, ...lastNameParts] = userName.split(' ');
  const lastName = lastNameParts.join(' ');

  const result = await createPreApproval({
    preApprovalPlanId: planId,
    reason: 'InboxProfs AI Monthly Subscription',
    payer: {
      email: userEmail,
      firstName: firstName,
      lastName: lastName,
    },
    backUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  });

  return result;
}

/**
 * Gets user's subscription status
 * @param subscriptionId - MercadoPago subscription ID
 * @returns Subscription details
 */
export async function getUserSubscriptionStatus(subscriptionId: string) {
  const result = await getPreApproval(subscriptionId);

  if (!result.success || !result.data) {
    return null;
  }

  const subscription = result.data;

  return {
    id: subscription.id,
    status: subscription.status,
    isActive: subscription.status === 'authorized',
    isPaused: subscription.status === 'paused',
    isCancelled: subscription.status === 'cancelled',
    planId: (subscription as any).preapproval_plan_id,
    amount: subscription.auto_recurring?.transaction_amount || 0,
    currency: subscription.auto_recurring?.currency_id || 'USD',
    nextBillingDate: (subscription.auto_recurring as any)?.start_date,
    createdAt: subscription.date_created,
  };
}

/**
 * Cancels user's subscription
 * @param subscriptionId - MercadoPago subscription ID
 * @returns Cancellation result
 */
export async function cancelUserSubscription(subscriptionId: string) {
  return cancelPreApproval(subscriptionId);
}
