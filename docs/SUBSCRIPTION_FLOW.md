# Subscription Flow Implementation

This document describes the complete subscription flow using MercadoPago for payment processing.

## Overview

The subscription system allows users to:

1. Sign up with a 7-day free trial on the Basic plan
2. Upgrade to paid plans (Pro or Pro+)
3. Manage their subscription
4. Receive webhook notifications for subscription events

## Architecture

### Components

1. **Checkout Page** (`/subscriptions/checkout`)
   - Displays plan details
   - Shows pricing and features
   - Initiates MercadoPago checkout

2. **Subscription Management Page** (`/subscriptions`)
   - Displays current subscription status
   - Shows plan limits
   - Allows cancellation

3. **Webhook Handler** (`/api/webhooks/mercadopago`)
   - Processes MercadoPago events
   - Updates subscription status in database

4. **Auth Callback** (`/auth/callback`)
   - Creates free trial subscription for new users

## Flow Diagrams

### New User Sign-up Flow

```
User Signs Up
    ↓
Auth Callback Route
    ↓
Create user_subscriptions record
    - plan_id: 'basic'
    - status: 'trialing'
    - trial_end: +7 days
    - No mercadopago_preapproval_id yet
    ↓
Redirect to Dashboard
```

### Subscription Purchase Flow

```
User Clicks "Choose Plan" on Pricing Page
    ↓
Redirect to /subscriptions/checkout?plan=pro
    ↓
Checkout Page
    - Loads plan details from MercadoPago
    - Shows pricing, features, trial info
    ↓
User Clicks "Proceed to Payment"
    ↓
createSubscriptionCheckoutAction
    - Creates MercadoPago subscription (preapproval)
    - Creates user_subscriptions record
    - Returns init_point URL
    ↓
Redirect to MercadoPago Hosted Checkout
    ↓
User Completes Payment
    ↓
MercadoPago sends webhook
    ↓
Webhook updates subscription status
    ↓
User redirected to /dashboard
```

### Webhook Processing Flow

```
MercadoPago Event Triggered
    ↓
POST /api/webhooks/mercadopago
    ↓
Validate Signature (optional but recommended)
    ↓
Handle Event Type
    - subscription_preapproval
    - subscription_authorized_payment
    - payment
    ↓
Fetch Details from MercadoPago API
    ↓
Update user_subscriptions Table
    - status
    - current_period_start
    - current_period_end
    ↓
Return 200 OK
```

## Database Schema

### user_subscriptions Table

```sql
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  plan_id TEXT NOT NULL, -- 'basic', 'pro', 'pro_plus'
  status TEXT NOT NULL, -- 'trialing', 'active', 'cancelled', 'paused', 'pending'
  mercadopago_preapproval_id TEXT, -- NULL for free trials
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  trial_start TIMESTAMP,
  trial_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  cancelled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Server Actions

### Subscription Actions (`src/actions/subscriptions/index.ts`)

#### `createSubscriptionCheckoutAction`

Creates a checkout session for plan subscription.

**Parameters:**

```typescript
{
  planType: 'basic' | 'pro' | 'pro_plus';
  mercadoPagoPlanId: string;
  userEmail: string;
  userName: string;
}
```

**Returns:**

```typescript
{
  subscriptionId: string; // DB subscription ID
  mercadopagoId: string; // MP subscription ID
  init_point: string; // Redirect URL
}
```

#### `getUserSubscriptionAction`

Gets the current user's active subscription.

**Returns:** `UserSubscription | null`

#### `updateSubscriptionStatusAction`

Updates subscription status (used by webhook).

**Parameters:**

```typescript
{
  mercadopagoPreapprovalId: string;
  status: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
}
```

#### `createBasicSubscriptionForNewUserAction`

Creates a free trial subscription (used in auth callback).

**Parameters:** `userId: string`

#### `cancelSubscriptionAction`

Cancels a user's subscription.

**Parameters:** `subscriptionId: string`

## React Hooks

### `useUserSubscription`

Fetches the current user's subscription.

```typescript
const { data, isLoading, error } = useUserSubscription();
```

### `useCancelUserSubscription`

Mutation hook to cancel subscription.

```typescript
const { mutate, isPending } = useCancelUserSubscription();
mutate(subscriptionId);
```

## Configuration

### Environment Variables

```env
# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=your_access_token
MERCADOPAGO_PUBLIC_KEY=your_public_key

# Plan IDs (get from MercadoPago dashboard)
MERCADOPAGO_BASIC_PLAN_ID=plan_id_here
MERCADOPAGO_PRO_PLAN_ID=plan_id_here
MERCADOPAGO_PRO_PLUS_PLAN_ID=plan_id_here

# App URL for redirects
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### MercadoPago Webhook Setup

1. Go to MercadoPago Developer Dashboard
2. Navigate to Your Application → Webhooks
3. Add webhook URL: `https://yourdomain.com/api/webhooks/mercadopago`
4. Select events to listen:
   - `subscription_preapproval`
   - `subscription_authorized_payment`
   - `subscription_preapproval_plan`
   - `payment`

## Plan Configuration

Plans are defined in JSON files:

- `src/subscriptions/config/subscription-plans.en.json` - English plan details
- `src/subscriptions/config/subscription-plans.es.json` - Spanish plan details
- `src/subscriptions/config/subscription-limits.json` - Plan limits (single source of truth)

## Testing

### Test Webhook Locally

Use ngrok to expose local server:

```bash
ngrok http 3000
```

Update MercadoPago webhook URL to: `https://your-ngrok-url.ngrok.io/api/webhooks/mercadopago`

### Test Subscription Flow

1. Create test user
2. Navigate to `/pricing`
3. Click "Choose Pro"
4. Complete checkout with MercadoPago test cards
5. Verify webhook processing in logs
6. Check subscription status on `/subscriptions`

### MercadoPago Test Cards

- **Approved:** 5031 7557 3453 0604 (CVV: 123)
- **Rejected:** 5031 4332 1540 6351 (CVV: 123)

## Status Mapping

### MercadoPago → Database

| MercadoPago Status | Database Status | Description            |
| ------------------ | --------------- | ---------------------- |
| `authorized`       | `active`        | Subscription active    |
| `pending`          | `pending`       | Awaiting payment       |
| `paused`           | `paused`        | Subscription paused    |
| `cancelled`        | `cancelled`     | Subscription cancelled |

## Error Handling

### Checkout Errors

- Invalid plan ID → Show error card
- User not authenticated → Redirect to sign in
- MercadoPago API failure → Show error message

### Webhook Errors

- Invalid signature → Return 401
- Missing subscription ID → Log error, return 200
- Database update failure → Log error, return 500

## Security Considerations

1. **Webhook Signature Validation**
   - Validates requests are from MercadoPago
   - Prevents replay attacks

2. **User Authentication**
   - All subscription actions require authenticated user
   - Database queries filter by user_id

3. **Environment Variables**
   - Never expose access tokens to client
   - Use server-only environment variables

## Monitoring

### Key Metrics to Track

1. **Conversion Rate**
   - Free trial → Paid subscription

2. **Churn Rate**
   - Subscription cancellations

3. **Webhook Success Rate**
   - Failed webhook processing

4. **Payment Failures**
   - Declined transactions

### Logging

Webhook events are logged with:

- Event type
- Subscription/Payment ID
- Status
- Timestamp

Check logs at: `/var/log/app/webhooks.log`

## Future Enhancements

1. **Email Notifications**
   - Welcome emails
   - Payment confirmations
   - Trial ending reminders
   - Cancellation confirmations

2. **Usage Tracking**
   - Monitor plan limits usage
   - Send notifications when approaching limits

3. **Proration**
   - Calculate prorated charges for upgrades

4. **Invoice Generation**
   - PDF invoices for payments
   - Downloadable from dashboard

5. **Multiple Payment Methods**
   - Support for credit cards, bank transfers, etc.

## Support

For issues related to:

- MercadoPago integration: Check [MercadoPago Docs](https://www.mercadopago.com/developers/en/docs)
- Subscription flow: Review this document
- Database issues: Check Supabase logs
