/**
 * InboxProfs AI - MercadoPago Usage Examples
 * Practical examples for implementing subscription features
 */

import { setupInboxProfPlansWithTrial, subscribeUserToPlan, getUserSubscriptionStatus, cancelUserSubscription } from '@/lib/mercadopago';

// ============================================================================
// EXAMPLE 1: Check Feature Access
// ============================================================================

function checkUserAccess(userPlan: 'basic' | 'pro' | 'pro_plus') {
  // Check if user can use auto-replies
  const canUseAutoReplies = hasFeatureAccess(userPlan, 'auto-replies');
  console.log(`Can use auto-replies: ${canUseAutoReplies}`);

  // Check if user has unlimited courses
  const hasUnlimitedCourses = hasFeatureAccess(userPlan, 'unlimited-courses');
  console.log(`Has unlimited courses: ${hasUnlimitedCourses}`);

  // Get all plan limits
  const limits = getPlanLimits(userPlan);
  console.log('Plan limits:', limits);
}

// ============================================================================
// EXAMPLE 2: Check Usage Limits
// ============================================================================

async function checkUsageLimits(userPlan: 'basic' | 'pro' | 'pro_plus', currentCourseCount: number) {
  const limits = getPlanLimits(userPlan);

  // Check if user exceeded course limit
  const exceededCourses = isLimitExceeded(userPlan, 'maxCourses', currentCourseCount);

  if (exceededCourses) {
    console.log('Course limit exceeded!');

    // Get required plan for unlimited courses
    const requiredPlan = getRequiredPlanForFeature(userPlan, 'unlimited-courses');

    if (requiredPlan) {
      const upgradeMsg = getUpgradeMessage('unlimited courses', requiredPlan);
      console.log(upgradeMsg);
      // Show upgrade modal to user
    }
  }
}

// ============================================================================
// EXAMPLE 3: Initial Setup - Create Plans
// ============================================================================

async function setupPlans() {
  // Option 1: Create plans WITHOUT free trial
  const planIds = await setupInboxProfPlans('ARS'); // or 'USD', 'BRL', etc.

  console.log('Created plans:', planIds);
  // Save these IDs to your database or environment variables
  // {
  //   free: 'plan_id_1',
  //   basic: 'plan_id_2',
  //   pro: 'plan_id_3'
  // }
}

// ============================================================================
// EXAMPLE 3B: Initial Setup - Create Plans WITH Free Trial
// ============================================================================

async function setupPlansWithTrial() {
  // Option 2: Create plans WITH free trial (7-day trial by default)
  const planIds = await setupInboxProfPlansWithTrial('ARS', 7);

  console.log('Created plans with 7-day trial:', planIds);

  // Or use a different trial period:
  // const planIds30Days = await setupInboxProfPlansWithTrial('ARS', 30);
  // const planIds14Days = await setupInboxProfPlansWithTrial('USD', 14);

  // Save these IDs to your database or environment variables
}

// ============================================================================
// EXAMPLE 3C: Create Custom Plan with Free Trial
// ============================================================================

import { createSubscriptionPlan } from '@/lib/mercadopago';

async function createCustomPlanWithTrial() {
  // Create a custom plan with a 14-day free trial
  const result = await createSubscriptionPlan({
    reason: 'InboxProfs AI - Premium Plan',
    autoRecurring: {
      frequency: 1,
      frequencyType: 'months',
      transactionAmount: 99.0,
      currencyId: 'USD',
      freeTrial: {
        frequency: 14, // 14 days free
        frequencyType: 'days',
      },
    },
    backUrl: 'https://yourapp.com/subscription/success',
  });

  if (result.success) {
    console.log('Plan created with 14-day trial:', result.data?.id);
    // Users will have 14 days of free access before first charge
  }

  // Example: Create plan with 1-month free trial
  const monthTrialResult = await createSubscriptionPlan({
    reason: 'InboxProfs AI - Annual Plan',
    autoRecurring: {
      frequency: 1,
      frequencyType: 'years',
      transactionAmount: 999.0,
      currencyId: 'USD',
      freeTrial: {
        frequency: 1, // 1 month free
        frequencyType: 'months',
      },
    },
  });
}

// ============================================================================
// EXAMPLE 4: Subscribe User to Plan
// ============================================================================

async function handleSubscription(planId: string, userEmail: string, userName: string) {
  const result = await subscribeUserToPlan(planId, userEmail, userName);

  if (result.success && result.data?.init_point) {
    // Redirect user to MercadoPago checkout
    window.location.href = result.data?.init_point;
  } else {
    console.error('Subscription failed:', result.error);
  }
}

// ============================================================================
// EXAMPLE 5: Check Subscription Status
// ============================================================================

async function checkSubscription(subscriptionId: string) {
  const status = await getUserSubscriptionStatus(subscriptionId);

  if (!status) {
    console.log('No subscription found');
    return;
  }

  console.log('Subscription status:', {
    id: status.id,
    isActive: status.isActive,
    isPaused: status.isPaused,
    isCancelled: status.isCancelled,
    amount: status.amount,
    currency: status.currency,
    nextBilling: status.nextBillingDate,
  });

  // Grant or revoke access based on status
  if (status.isActive) {
    // Grant user access to premium features
    console.log('User has active subscription');
  } else if (status.isCancelled) {
    // Revoke access
    console.log('Subscription cancelled');
  }
}

// ============================================================================
// EXAMPLE 6: Cancel Subscription
// ============================================================================

async function handleCancellation(subscriptionId: string) {
  const result = await cancelUserSubscription(subscriptionId);

  if (result.success) {
    console.log('Subscription cancelled successfully');
    // Update user's plan in your database to 'free'
    // Send cancellation confirmation email
  } else {
    console.error('Cancellation failed:', result.error);
  }
}

// ============================================================================
// EXAMPLE 7: Display Plans in UI (React Component)
// ============================================================================

function PricingComponent() {
  const plans = Object.entries(INBOX_PROFS_PLANS).map(([key, plan]) => ({
    id: key.toLowerCase(),
    ...plan,
  }));

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {plans.map(plan => (
        <div key={plan.id} className={`p-6 rounded-lg border ${plan.highlighted ? 'ring-2 ring-primary' : ''}`}>
          <h3 className="text-2xl font-bold">{plan.name}</h3>
          <p className="text-sm text-muted-foreground">{plan.subtitle}</p>
          <div className="my-4">
            <span className="text-4xl font-bold">${plan.price}</span>
            <span className="text-sm text-muted-foreground"> {plan.period}</span>
          </div>
          <p className="text-sm mb-4">{plan.description}</p>
          <ul className="space-y-2 mb-6">
            {plan.features.map(feature => (
              <li key={feature} className="flex items-start">
                <span className="mr-2">✓</span>
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={() => {
              /* Handle subscription */
            }}
            className="w-full py-2 px-4 rounded bg-primary text-white"
          >
            {/*@ts-ignore*/}
            {plan.price === 0 ? 'Get Started' : 'Subscribe'}
          </button>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// EXAMPLE 9: Usage Tracking
// ============================================================================

import {
  getLimitUsagePercentage,
  getPlanLimits,
  getRequiredPlanForFeature,
  getUpgradeMessage,
  hasFeatureAccess,
  INBOX_PROFS_PLANS,
  isApproachingLimit,
  isLimitExceeded,
  setupInboxProfPlans,
} from './helpers';

function trackUsage(userPlan: 'basic' | 'pro' | 'pro_plus', currentCourses: number) {
  const percentage = getLimitUsagePercentage(userPlan, 'maxCourses', currentCourses);

  const approaching = isApproachingLimit(userPlan, 'maxCourses', currentCourses);

  if (approaching && percentage) {
    console.log(`Warning: ${percentage}% of course limit used`);
    // Show warning banner to user
  }
}

// ============================================================================
// EXAMPLE 10: Complete Subscription Flow
// ============================================================================

async function completeSubscriptionFlow() {
  // Step 1: User selects Basic plan
  const selectedPlan = 'basic';
  const planConfig = INBOX_PROFS_PLANS.BASIC;

  console.log(`User selected: ${planConfig.name} - $${planConfig.price}/month`);

  // Step 2: Create subscription
  const BASIC_PLAN_ID = process.env.NEXT_PUBLIC_MERCADOPAGO_BASIC_PLAN_ID!;
  const subscription = await subscribeUserToPlan(BASIC_PLAN_ID, 'user@example.com', 'John Doe');

  if (!subscription.success) {
    console.error('Failed to create subscription');
    return;
  }

  // Step 3: Store subscription ID in your database
  // await db.users.update({
  //   where: { email: 'user@example.com' },
  //   data: {
  //     mercadopagoSubscriptionId: subscription.data.id,
  //     subscriptionStatus: 'pending'
  //   }
  // });

  // Step 4: Redirect to checkout
  if (subscription.data?.init_point) {
    window.location.href = subscription.data?.init_point;
  }

  // Step 5: Webhook will handle payment confirmation
  // See webhook.ts for automatic processing

  // Step 6: After webhook updates, check status
  setTimeout(async () => {
    const status = await getUserSubscriptionStatus(subscription.data!.id!);
    if (status?.isActive) {
      console.log('Subscription active! Grant access.');
    }
  }, 5000);
}

export {
  checkUserAccess,
  checkUsageLimits,
  setupPlans,
  handleSubscription,
  checkSubscription,
  handleCancellation,
  PricingComponent,
  trackUsage,
  completeSubscriptionFlow,
};
