# Free Trial Implementation Guide 🎁

Complete guide for implementing free trial periods in your InboxProfs AI subscription plans.

## What is a Free Trial?

A free trial allows users to access your paid plan features for a limited period **before the first charge**. After the trial ends, MercadoPago automatically charges the subscription amount.

## Quick Start

### Option 1: Use Helper Functions

```typescript
import { setupInboxProfPlansWithTrial } from '@/lib/mercadopago';

// Create all plans with 7-day free trial
const planIds = await setupInboxProfPlansWithTrial('USD', 7);

// Create all plans with 30-day free trial
const planIds30 = await setupInboxProfPlansWithTrial('USD', 30);

// Create all plans with 1-month free trial
const planIds1Month = await setupInboxProfPlansWithTrial('USD', 1);
```

### Option 2: Create Individual Plans

```typescript
import { createSubscriptionPlan } from '@/lib/mercadopago';

const basicPlanWithTrial = await createSubscriptionPlan({
  reason: 'InboxProfs AI - Basic Plan (7-day trial)',
  autoRecurring: {
    frequency: 1,
    frequencyType: 'months',
    transactionAmount: 29.0,
    currencyId: 'USD',
    freeTrial: {
      frequency: 7,
      frequencyType: 'days',
    },
  },
  backUrl: 'https://yourapp.com/subscription/success',
});
```

## Trial Period Options

### By Days

```typescript
freeTrial: {
  frequency: 7,      // 7 days
  frequencyType: 'days',
}
```

**Common options:**

- 3 days (quick test)
- 7 days (standard trial)
- 14 days (extended trial)
- 30 days (generous trial)

### By Months

```typescript
freeTrial: {
  frequency: 1,      // 1 month
  frequencyType: 'months',
}
```

**Common options:**

- 1 month (annual plans)
- 2 months (premium plans)

## How It Works

### User Flow

1. **User selects plan** → Sees "7-day free trial" badge
2. **User subscribes** → Redirected to MercadoPago checkout
3. **Trial starts** → User gets immediate access to all features
4. **Trial period** → User uses the service for free
5. **Trial ends** → First payment is automatically charged
6. **Subscription continues** → Regular billing cycle begins

### Technical Flow

```typescript
// 1. Create plan with trial
const plan = await createSubscriptionPlan({
  reason: 'Pro Plan with Trial',
  autoRecurring: {
    frequency: 1,
    frequencyType: 'months',
    transactionAmount: 79.0,
    currencyId: 'USD',
    freeTrial: {
      frequency: 7,
      frequencyType: 'days',
    },
  },
});

// 2. User subscribes
const subscription = await subscribeUserToPlan(
  plan.data.id,
  'user@example.com',
  'John Doe'
);

// 3. On day 0: User gets access (trial starts)
// 4. On day 7: MercadoPago charges $79 (trial ends)
// 5. Every month: MercadoPago charges $79
```

## UI Implementation

### Pricing Card Example

```tsx
import { Badge } from '@/components/ui/badge';
import { INBOX_PROFS_PLANS } from '@/lib/mercadopago';

function PricingCard({ plan, hasTrial = false, trialDays = 7 }) {
  return (
    <div className="p-6 border rounded-lg">
      {hasTrial && (
        <Badge className="mb-2">{trialDays} days free trial 🎁</Badge>
      )}

      <h3 className="text-2xl font-bold">{plan.name}</h3>
      <div className="my-4">
        <span className="text-4xl font-bold">${plan.price}</span>
        <span className="text-sm text-muted-foreground">/month</span>
      </div>

      {hasTrial && (
        <p className="text-sm text-muted-foreground mb-4">
          Start your free {trialDays}-day trial. No credit card required. Cancel
          anytime during the trial period.
        </p>
      )}

      <button className="w-full py-2 px-4 bg-primary text-white rounded">
        {hasTrial ? `Start Free Trial` : 'Subscribe'}
      </button>
    </div>
  );
}
```

### Trial Status Display

```tsx
function SubscriptionStatus({ subscription }) {
  const isInTrial =
    subscription.status === 'active' && subscription.inTrialPeriod;
  const trialEndsAt = new Date(subscription.trialEndDate);
  const daysRemaining = Math.ceil(
    (trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  if (isInTrial) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded">
        <h4 className="font-semibold">🎁 Free Trial Active</h4>
        <p className="text-sm">
          {daysRemaining} days remaining. Your first charge will be on{' '}
          {trialEndsAt.toLocaleDateString()}.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded">
      <h4 className="font-semibold">✓ Active Subscription</h4>
      <p className="text-sm">Next billing: {subscription.nextBilling}</p>
    </div>
  );
}
```

## Best Practices

### 1. **Clear Communication**

✅ **DO:**

- Show trial duration prominently
- Explain when first charge occurs
- Display "No credit card required" if applicable
- Show trial end date in user dashboard

❌ **DON'T:**

- Hide trial information in fine print
- Surprise users with charges
- Make cancellation difficult

### 2. **Trial Duration Strategy**

**7 days** - Best for:

- Simple products
- Low-priced plans ($10-$30)
- Quick onboarding

**14 days** - Best for:

- Mid-priced plans ($30-$100)
- Moderate complexity
- B2B products

**30 days** - Best for:

- High-priced plans ($100+)
- Complex products
- Enterprise solutions

### 3. **Conversion Optimization**

```typescript
// Send reminder emails during trial
const trialReminders = [
  { day: 1, message: 'Welcome! Here's how to get started...' },
  { day: 3, message: 'Quick tip: Did you know you can...' },
  { day: 5, message: 'Only 2 days left in your trial!' },
  { day: 7, message: 'Your trial ends today. Continue with...' },
];

// Track trial engagement
const trialMetrics = {
  signups: 100,
  activatedFeatures: 75,  // Used core features
  converted: 60,           // Didn't cancel before trial end
  conversionRate: '60%',
};
```

### 4. **Cancellation Handling**

```typescript
// Allow easy cancellation during trial
async function cancelDuringTrial(subscriptionId: string) {
  const result = await cancelUserSubscription(subscriptionId);

  if (result.success) {
    // User cancels during trial = no charges
    console.log('Trial cancelled. User will not be charged.');

    // Optional: Keep access until trial end
    // or revoke immediately
  }
}
```

## Common Scenarios

### Scenario 1: Different Trials per Plan

```typescript
// Free plan: No trial needed
const freePlan = await createSubscriptionPlan({
  reason: 'Free Plan',
  autoRecurring: {
    frequency: 1,
    frequencyType: 'months',
    transactionAmount: 0,
    currencyId: 'USD',
    // No freeTrial
  },
});

// Basic plan: 7-day trial
const basicPlan = await createSubscriptionPlan({
  reason: 'Basic Plan',
  autoRecurring: {
    frequency: 1,
    frequencyType: 'months',
    transactionAmount: 29,
    currencyId: 'USD',
    freeTrial: {
      frequency: 7,
      frequencyType: 'days',
    },
  },
});

// Pro plan: 14-day trial (longer for premium)
const proPlan = await createSubscriptionPlan({
  reason: 'Pro Plan',
  autoRecurring: {
    frequency: 1,
    frequencyType: 'months',
    transactionAmount: 79,
    currencyId: 'USD',
    freeTrial: {
      frequency: 14,
      frequencyType: 'days',
    },
  },
});
```

### Scenario 2: Promotional Trial

```typescript
// Regular plan: No trial
const regularPlan = await createSubscriptionPlan({
  reason: 'Pro Plan',
  autoRecurring: {
    frequency: 1,
    frequencyType: 'months',
    transactionAmount: 79,
    currencyId: 'USD',
  },
});

// Promotional plan: 30-day trial (for marketing campaign)
const promoPlan = await createSubscriptionPlan({
  reason: 'Pro Plan - Holiday Promo',
  autoRecurring: {
    frequency: 1,
    frequencyType: 'months',
    transactionAmount: 79,
    currencyId: 'USD',
    freeTrial: {
      frequency: 30,
      frequencyType: 'days',
    },
  },
});
```

### Scenario 3: Annual Plan with Monthly Trial

```typescript
// Annual billing with 1-month free trial
const annualPlan = await createSubscriptionPlan({
  reason: 'Annual Pro Plan',
  autoRecurring: {
    frequency: 1,
    frequencyType: 'years',
    transactionAmount: 790, // $79/month * 10 months (2 months free!)
    currencyId: 'USD',
    freeTrial: {
      frequency: 1,
      frequencyType: 'months',
    },
  },
});
```

## Testing

### Test Credentials

Use MercadoPago test environment:

```env
MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxx-xxxxx
```

### Test Flow

1. Create plan with short trial (e.g., 1 day for testing)
2. Subscribe with test user
3. Verify trial status in MercadoPago dashboard
4. Wait for trial to expire (or manually advance time)
5. Check that first charge is created
6. Verify webhook events are received

### Quick Test Setup

```typescript
// Create plan with 1-minute trial for testing
const testPlan = await createSubscriptionPlan({
  reason: 'Test Plan - 1 minute trial',
  autoRecurring: {
    frequency: 1,
    frequencyType: 'months',
    transactionAmount: 1.0,
    currencyId: 'USD',
    // Note: MercadoPago minimum trial is 1 day
    freeTrial: {
      frequency: 1,
      frequencyType: 'days',
    },
  },
});
```

## Troubleshooting

### Issue: Trial not showing in checkout

**Solution:** Verify plan creation response includes `free_trial` field:

```typescript
const result = await createSubscriptionPlan(params);
console.log(result.data.auto_recurring.free_trial);
// Should show: { frequency: 7, frequency_type: 'days' }
```

### Issue: User charged immediately

**Possible causes:**

1. Trial period not included in plan
2. User already used trial for this plan
3. MercadoPago account restrictions

### Issue: Trial ends but no charge

**Check:**

1. Payment method is valid
2. Subscription is still active
3. Webhook handler is processing events

## Resources

- [MercadoPago Subscriptions Docs](https://www.mercadopago.com/developers/en/docs/subscriptions)
- [Pre-Approval Plans API](https://www.mercadopago.com/developers/en/reference/subscriptions/_preapproval_plan/post)
- `examples.tsx` - See Example 3B and 3C for code samples

## Support

If you need help implementing free trials:

1. Check `examples.tsx` for working code samples
2. Review MercadoPago dashboard for plan configuration
3. Test with MercadoPago sandbox environment first
4. Verify webhook events are being received

---

**Ready to implement?** Start with `setupInboxProfPlansWithTrial()` for the fastest setup! 🚀
