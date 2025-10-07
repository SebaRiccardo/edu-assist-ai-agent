# MercadoPago Integration

Comprehensive MercadoPago service for handling subscriptions, payments, and webhooks.

## Installation

```bash
npm install mercadopago --legacy-peer-deps
```

## Environment Variables

Add these to your `.env.local` file:

```env
MERCADOPAGO_ACCESS_TOKEN=your_access_token_here
MERCADOPAGO_WEBHOOK_SECRET=your_webhook_secret_here
```

## 📁 Module Structure

```
src/lib/mercadopago/
├── client.ts       # MercadoPago SDK initialization
├── service.ts      # Core API methods
├── webhook.ts      # Webhook event handler
├── helpers.ts      # App-specific utilities
├── plans.ts        # Plan configurations & utilities
├── types.ts        # TypeScript definitions
├── examples.tsx    # 📚 10 usage examples & code snippets
└── index.ts        # Main exports
```

> 💡 **See `examples.tsx` for 10 comprehensive usage examples** including React components, hooks, and complete flows.

## Quick Start

### 1. Initialize Client

```typescript
import { mercadoPagoClient } from '@/lib/mercadopago';
```

### 2. Create a Subscription Plan

```typescript
import { createSubscriptionPlan } from '@/lib/mercadopago';

// Basic plan without trial
const result = await createSubscriptionPlan({
  reason: 'InboxProfs AI - Basic Plan',
  autoRecurring: {
    frequency: 1,
    frequencyType: 'months',
    transactionAmount: 29.0,
    currencyId: 'ARS', // or 'USD', 'BRL', etc.
  },
  backUrl: 'https://yourapp.com/subscription/success',
});

if (result.success) {
  console.log('Plan created:', result.data.id);
}
```

### 2B. Create a Subscription Plan WITH Free Trial 🎁

```typescript
import { createSubscriptionPlan } from '@/lib/mercadopago';

// Plan with 7-day free trial
const result = await createSubscriptionPlan({
  reason: 'InboxProfs AI - Pro Plan (7-day trial)',
  autoRecurring: {
    frequency: 1,
    frequencyType: 'months',
    transactionAmount: 79.0,
    currencyId: 'USD',
    freeTrial: {
      frequency: 7, // 7 days free
      frequencyType: 'days',
    },
  },
  backUrl: 'https://yourapp.com/subscription/success',
});

// Plan with 1-month free trial
const monthlyTrialResult = await createSubscriptionPlan({
  reason: 'InboxProfs AI - Annual Plan (1-month trial)',
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
```

### 3. Create a Subscription

```typescript
import { createPreApproval } from '@/lib/mercadopago';

const result = await createPreApproval({
  preApprovalPlanId: 'your_plan_id',
  reason: 'Monthly subscription to InboxProfs AI',
  payer: {
    email: 'user@example.com',
    firstName: 'John',
    lastName: 'Doe',
  },
  backUrl: 'https://yourapp.com/dashboard',
});

if (result.success) {
  // Redirect user to this URL to complete subscription
  const checkoutUrl = result.initPoint;
  console.log('Checkout URL:', checkoutUrl);
}
```

### 4. Handle One-Time Payments

```typescript
import { createPayment } from '@/lib/mercadopago';

const result = await createPayment({
  transactionAmount: 100.0,
  description: 'Course enrollment fee',
  paymentMethodId: 'visa',
  payer: {
    email: 'user@example.com',
    firstName: 'John',
    lastName: 'Doe',
  },
  token: 'card_token_from_frontend', // Get from MercadoPago.js
  installments: 1,
  metadata: {
    userId: '123',
    courseId: 'cs101',
  },
});

if (result.success) {
  console.log('Payment status:', result.data.status);
}
```

## Available Services

### Subscription Plans

- `createSubscriptionPlan(params)` - Create a new subscription plan (supports free trial!)
- `getSubscriptionPlan(planId)` - Get plan details
- `updateSubscriptionPlan(planId, params)` - Update a plan
- `searchSubscriptionPlans(params)` - Search plans

### Subscriptions (Pre-Approvals)

- `createPreApproval(params)` - Create a subscription
- `getPreApproval(id)` - Get subscription details
- `updatePreApproval(id, params)` - Update subscription
- `cancelPreApproval(id)` - Cancel subscription
- `pausePreApproval(id)` - Pause subscription
- `searchPreApprovals(params)` - Search subscriptions

### Payments

- `createPayment(params)` - Create a one-time payment
- `getPayment(id)` - Get payment details
- `searchPayments(params)` - Search payments
- `capturePayment(id)` - Capture reserved payment
- `cancelPayment(id)` - Cancel payment
- `refundPayment(id, amount?)` - Refund payment

### Utilities

- `formatCurrency(amount, currencyId)` - Format currency display
- `getSubscriptionStatusLabel(status)` - Get human-readable status
- `getPaymentStatusLabel(status)` - Get human-readable status

## Webhooks

### Setup

1. Configure webhook URL in MercadoPago dashboard:

   ```
   https://yourapp.com/api/webhooks/mercadopago
   ```

2. The webhook handler is already implemented in:
   ```
   src/app/api/webhooks/mercadopago/route.ts
   ```

### Webhook Events

The service handles these events automatically:

- `payment.created` - New payment created
- `payment.updated` - Payment status changed
- `subscription.created` - New subscription created
- `subscription.updated` - Subscription status changed
- `subscription.preapproval_plan.updated` - Plan updated
- `subscription.authorized_payment` - Recurring payment processed

### Custom Webhook Processing

Modify `src/lib/mercadopago/webhook.ts` to add your custom logic:

```typescript
async function handlePaymentEvent(event: MercadoPagoWebhookEvent) {
  // Add your database updates here
  await updatePaymentInDatabase({
    mercadopagoId: payment.id,
    status: payment.status,
    amount: payment.transaction_amount,
  });

  // Send emails
  if (payment.status === 'approved') {
    await sendConfirmationEmail(payment.payer.email);
  }
}
```

## Subscription Flow Example

### For InboxProfs AI Plans

```typescript
import {
  setupInboxProfPlans,
  setupInboxProfPlansWithTrial,
} from '@/lib/mercadopago';

// Option 1: Create plans WITHOUT free trial (do this once in setup)
const planIds = await setupInboxProfPlans('USD');
console.log(planIds); // { free: 'xxx', basic: 'yyy', pro: 'zzz' }

// Option 2: Create plans WITH 7-day free trial
const trialPlanIds = await setupInboxProfPlansWithTrial('USD', 7);
console.log(trialPlanIds); // Plans with trial period

// Or manually create individual plans:
const freePlan = await createSubscriptionPlan({
  reason: 'InboxProfs AI - Free Plan',
  autoRecurring: {
    frequency: 1,
    frequencyType: 'months',
    transactionAmount: 0,
    currencyId: 'USD',
  },
});

const basicPlan = await createSubscriptionPlan({
  reason: 'InboxProfs AI - Basic Plan',
  autoRecurring: {
    frequency: 1,
    frequencyType: 'months',
    transactionAmount: 29,
    currencyId: 'USD',
    freeTrial: {
      frequency: 7, // 7 days free!
      frequencyType: 'days',
    },
  },
});

const proPlan = await createSubscriptionPlan({
  reason: 'InboxProfs AI - Pro Plan',
  autoRecurring: {
    frequency: 1,
    frequencyType: 'months',
    transactionAmount: 79,
    currencyId: 'USD',
    freeTrial: {
      frequency: 14, // 14 days free!
      frequencyType: 'days',
    },
  },
});

// 2. When user subscribes
const subscription = await createPreApproval({
  preApprovalPlanId: basicPlan.data.id,
  reason: 'Monthly subscription to InboxProfs AI Basic',
  payer: {
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  },
  backUrl: 'https://yourapp.com/dashboard',
});

// 3. Redirect user to checkout
router.push(subscription.initPoint);

// 4. Handle webhook when payment is processed
// (automatic in webhook.ts)

// 5. Check subscription status
const status = await getPreApproval(subscriptionId);
console.log('Subscription status:', status.data.status);

// 6. Cancel when user wants to unsubscribe
await cancelPreApproval(subscriptionId);
```

## TypeScript Types

All functions return a `ServiceResponse<T>`:

```typescript
interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
```

Full type definitions available in `src/lib/mercadopago/types.ts`

## Error Handling

All service functions handle errors gracefully:

```typescript
const result = await createPayment(params);

if (!result.success) {
  console.error('Payment failed:', result.error);
  // Handle error (show message to user, retry, etc.)
  return;
}

// Success - use result.data
console.log('Payment ID:', result.data.id);
```

## Testing

### Test Credentials

Use MercadoPago test credentials from:
https://www.mercadopago.com/developers/panel/app/test-accounts

### Test Cards

```
Approved: 5031 7557 3453 0604 (Mastercard)
Rejected: 5031 4332 1540 6351 (Mastercard)
Pending: 3753 651535 56885 (American Express)
```

## Production Checklist

- [ ] Replace test credentials with production credentials
- [ ] Configure webhook URL in production dashboard
- [ ] Set up `MERCADOPAGO_WEBHOOK_SECRET` for signature validation
- [ ] Implement actual webhook signature validation
- [ ] Add database integration for storing transactions
- [ ] Set up email notifications
- [ ] Add logging and monitoring
- [ ] Test all subscription flows
- [ ] Handle payment failures and retries
- [ ] Implement subscription renewal reminders

## Resources

- [MercadoPago Developer Docs](https://www.mercadopago.com/developers)
- [SDK Reference](https://github.com/mercadopago/sdk-nodejs)
- [Webhook Documentation](https://www.mercadopago.com/developers/en/docs/your-integrations/notifications/webhooks)
- [Testing Guide](https://www.mercadopago.com/developers/en/docs/checkout-pro/additional-content/test-cards)

## Support

For issues with the integration, check:

1. Environment variables are set correctly
2. Access token has required permissions
3. Webhook URL is publicly accessible
4. Test mode vs. production mode configuration
