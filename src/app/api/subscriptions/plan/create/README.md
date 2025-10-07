# Create Subscription Plan API

## Endpoint

`POST /api/subscriptions/plan/create`

## Description

Creates a new subscription plan in MercadoPago and saves it to the Supabase database.

## Authentication

Requires authenticated user (JWT token in cookies).

## Request Body

```typescript
{
  name: string;              // Plan name (required)
  description?: string;      // Plan description (optional)
  price: number;            // Price in currency units (required)
  currency?: string;        // Currency code (default: 'ARS')
  interval: 'months' | 'days' | 'years';  // Billing interval (required)
  intervalCount?: number;   // Interval multiplier (default: 1)
  trialPeriodDays?: number; // Free trial period in days (optional)
  features?: string[];      // List of plan features (optional)
  isActive?: boolean;       // Plan active status (default: true)
}
```

## Example Request

```typescript
// Example 1: Basic monthly plan
const response = await fetch('/api/subscriptions/plan/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Premium Plan',
    description: 'Full access to all features',
    price: 9999, // $99.99 ARS
    currency: 'ARS',
    interval: 'months',
    intervalCount: 1,
    features: [
      'Unlimited email analysis',
      'Priority support',
      'Advanced AI features',
      'Custom course templates',
    ],
    isActive: true,
  }),
});

// Example 2: Annual plan with free trial
const response = await fetch('/api/subscriptions/plan/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Annual Pro',
    description: 'Best value - 12 months for the price of 10',
    price: 99990, // $999.90 ARS
    currency: 'ARS',
    interval: 'months',
    intervalCount: 12,
    trialPeriodDays: 14, // 14-day free trial
    features: ['All Premium features', '2 months free', 'Priority onboarding'],
  }),
});

// Example 3: Weekly plan
const response = await fetch('/api/subscriptions/plan/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Weekly Basic',
    price: 500, // $5.00 ARS
    currency: 'ARS',
    interval: 'days',
    intervalCount: 7,
  }),
});
```

## Success Response (201)

```typescript
{
  success: true,
  message: 'Subscription plan created successfully',
  data: {
    plan: {
      id: 'uuid',
      name: 'Premium Plan',
      description: 'Full access to all features',
      price: 9999,
      currency: 'ARS',
      interval: 'months',
      interval_count: 1,
      trial_period_days: null,
      features: ['...'],
      is_active: true,
      mercadopago_plan_id: 'mp_plan_id',
      created_at: '2025-10-06T...',
      updated_at: '2025-10-06T...',
    },
    mercadoPago: {
      planId: 'mp_plan_id',
      initPoint: 'https://www.mercadopago.com/...',
    },
  },
}
```

## Error Responses

### 401 Unauthorized

```json
{
  "error": "Unauthorized. Please log in."
}
```

### 400 Bad Request

```json
{
  "error": "Invalid request data",
  "details": {
    "name": ["Plan name is required"],
    "price": ["Price must be positive"]
  }
}
```

### 500 Internal Server Error

```json
{
  "error": "Failed to create subscription plan in MercadoPago",
  "details": "Error message from MercadoPago"
}
```

## Usage in React Component

```typescript
'use client';

import { useState } from 'react';
import { toast } from 'sonner';

export function CreatePlanForm() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch('/api/subscriptions/plan/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.get('name'),
          description: formData.get('description'),
          price: Number(formData.get('price')),
          currency: formData.get('currency') || 'ARS',
          interval: formData.get('interval'),
          intervalCount: Number(formData.get('intervalCount')) || 1,
          trialPeriodDays: formData.get('trialPeriodDays')
            ? Number(formData.get('trialPeriodDays'))
            : undefined,
          features: formData.get('features')?.toString().split(',').map(f => f.trim()),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create plan');
      }

      toast.success('Plan created successfully!');
      console.log('Created plan:', result.data.plan);

      // Redirect or refresh
      window.location.href = '/dashboard/subscriptions/plans';
    } catch (error: any) {
      toast.error(error.message);
      console.error('Error creating plan:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

## Notes

- The route creates the plan in MercadoPago first, then saves it to Supabase
- If the database save fails, the MercadoPago plan will still exist (consider implementing rollback)
- The `maxDuration` is set to 30 seconds to handle potential API delays
- All monetary amounts should be in the smallest currency unit (cents for most currencies)
- The `initPoint` URL can be used to redirect users to the MercadoPago subscription page

## Related Endpoints

- `GET /api/subscriptions/plan/list` - List all plans
- `GET /api/subscriptions/plan/[id]` - Get plan details
- `PUT /api/subscriptions/plan/[id]` - Update plan
- `DELETE /api/subscriptions/plan/[id]` - Deactivate plan

## Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your_supabase_anon_key
MERCADOPAGO_ACCESS_TOKEN=your_mercadopago_access_token
NEXT_PUBLIC_APP_URL=your_app_url
```
