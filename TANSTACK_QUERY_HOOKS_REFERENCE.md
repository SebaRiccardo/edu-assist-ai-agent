# TanStack Query Hooks - Quick Reference Guide

## 📚 Available Hooks

### Profiles

```typescript
import {
  useProfiles,
  useProfile,
  useProfilesCount,
} from '@/hooks/use-profiles';

// Get all profiles with subscriptions
const { data: profiles, isLoading, error } = useProfiles();
// Returns: Array of profiles with user_subscriptions joined

// Get single profile by ID
const { data: profile } = useProfile(profileId);
// Automatically disabled if profileId is undefined

// Get profiles count
const { data: count } = useProfilesCount();
// Returns: number (transformed from metadata)
```

---

### Subscription Plans

```typescript
import {
  usePlans,
  useActivePlans,
  usePlan,
  usePlansCount,
  useCreatePlan,
  useUpdatePlan,
  useDeletePlan,
} from '@/hooks/use-subscription-plans';

// Get all plans
const { data: plans, isLoading } = usePlans();

// Get active plans only
const { data: activePlans } = useActivePlans();

// Get single plan by ID
const { data: plan } = usePlan(planId);

// Get plans count
const { data: count } = usePlansCount();

// CREATE - Insert new plan
const createPlan = useCreatePlan();
await createPlan.mutateAsync([
  {
    name: 'Premium',
    price: 9999,
    currency: 'ARS',
    interval: 'month',
    // ... other fields
  },
]);

// UPDATE - Modify existing plan
const updatePlan = useUpdatePlan();
await updatePlan.mutateAsync({
  id: planId,
  is_active: false,
});

// DELETE - Remove plan
const deletePlan = useDeletePlan();
await deletePlan.mutateAsync({ id: planId });
```

---

### User Subscriptions

```typescript
import {
  useSubscriptions,
  useActiveSubscriptions,
  useUserSubscriptions,
  useSubscriptionsCount,
  useCreateSubscription,
  useUpdateSubscription,
  useCancelSubscription,
} from '@/hooks/use-subscriptions';

// Get all subscriptions (with profiles + plans joined)
const { data: subscriptions } = useSubscriptions();
// Returns: Subscriptions with profiles and subscription_plans

// Get active subscriptions only
const { data: activeSubscriptions } = useActiveSubscriptions();

// Get user's subscriptions
const { data: userSubs } = useUserSubscriptions(userId);

// Get subscriptions count by status
const { data: count } = useSubscriptionsCount('authorized');

// CREATE - New subscription
const createSub = useCreateSubscription();
await createSub.mutateAsync([
  {
    user_id: userId,
    plan_id: planId,
    status: 'authorized',
    // ... other fields
  },
]);

// UPDATE - Modify subscription
const updateSub = useUpdateSubscription();
await updateSub.mutateAsync({
  id: subscriptionId,
  status: 'cancelled',
});

// CANCEL - Cancel subscription
const cancelSub = useCancelSubscription();
await cancelSub.mutateAsync({
  id: subscriptionId,
  cancelled_at: new Date().toISOString(),
  cancel_at_period_end: true,
});
```

---

### Payments

```typescript
import {
  usePayments,
  useUserPayments,
  useSubscriptionPayments,
} from '@/hooks/use-payments';

// Get all payments
const { data: payments } = usePayments();

// Get user's payments
const { data: userPayments } = useUserPayments(userId);

// Get subscription's payments
const { data: subPayments } = useSubscriptionPayments(subscriptionId);
```

---

## 🎯 Common Patterns

### Basic Query with Loading

```typescript
'use client';

export function MyComponent() {
  const { data, isLoading, error } = usePlans();

  if (isLoading) {
    return <Loader2 className="h-8 w-8 animate-spin" />;
  }

  if (error) {
    return <p className="text-destructive">Error: {error.message}</p>;
  }

  return (
    <div>
      {data.map(plan => (
        <PlanCard key={plan.id} plan={plan} />
      ))}
    </div>
  );
}
```

---

### Mutation with Toast Notification

```typescript
'use client';

import { useCreatePlan } from '@/hooks/use-subscription-plans';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function CreatePlanForm() {
  const queryClient = useQueryClient();
  const createPlan = useCreatePlan();

  const handleSubmit = async (formData) => {
    try {
      await createPlan.mutateAsync([formData], {
        onSuccess: () => {
          // Invalidate and refetch plans
          queryClient.invalidateQueries({ queryKey: ['subscription_plans'] });
          toast.success('Plan created successfully!');
        },
      });
    } catch (error) {
      toast.error('Failed to create plan');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button
        type="submit"
        disabled={createPlan.isPending}
      >
        {createPlan.isPending ? 'Creating...' : 'Create Plan'}
      </button>
    </form>
  );
}
```

---

### Conditional Query (Only Run When Ready)

```typescript
export function ProfileDetails({ profileId }: { profileId: string | undefined }) {
  const { data: profile, isLoading } = useProfile(profileId);
  // Query automatically disabled if profileId is undefined

  if (!profileId) {
    return <p>Select a profile to view details</p>;
  }

  if (isLoading) {
    return <Loader />;
  }

  return <ProfileCard profile={profile} />;
}
```

---

### Multiple Queries in Parallel

```typescript
export function Dashboard() {
  const { data: profiles, isLoading: profilesLoading } = useProfiles();
  const { data: plans, isLoading: plansLoading } = usePlans();
  const { data: subscriptions, isLoading: subsLoading } = useActiveSubscriptions();

  const isLoading = profilesLoading || plansLoading || subsLoading;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <StatCard title="Total Users" value={profiles.length} />
      <StatCard title="Total Plans" value={plans.length} />
      <StatCard title="Active Subs" value={subscriptions.length} />
    </div>
  );
}
```

---

### Manual Refetch

```typescript
export function RefreshButton() {
  const { refetch, isFetching } = usePlans();

  return (
    <button onClick={() => refetch()} disabled={isFetching}>
      {isFetching ? 'Refreshing...' : 'Refresh Plans'}
    </button>
  );
}
```

---

### Cache Invalidation After Mutation

```typescript
import { useQueryClient } from '@tanstack/react-query';

export function DeletePlanButton({ planId }: { planId: string }) {
  const queryClient = useQueryClient();
  const deletePlan = useDeletePlan();

  const handleDelete = async () => {
    await deletePlan.mutateAsync({ id: planId });

    // Invalidate all plans queries
    queryClient.invalidateQueries({ queryKey: ['subscription_plans'] });

    // Or refetch immediately
    await queryClient.refetchQueries({ queryKey: ['subscription_plans'] });
  };

  return (
    <button onClick={handleDelete} disabled={deletePlan.isPending}>
      {deletePlan.isPending ? 'Deleting...' : 'Delete'}
    </button>
  );
}
```

---

### Access Joined Data

```typescript
export function SubscriptionsList() {
  const { data: subscriptions } = useSubscriptions();

  return (
    <div>
      {subscriptions?.map(sub => (
        <div key={sub.id}>
          {/* Access profile data (joined) */}
          <p>User: {sub.profiles?.full_name}</p>

          {/* Access plan data (joined) */}
          <p>Plan: {sub.subscription_plans?.name}</p>
          <p>Price: ${sub.subscription_plans?.price / 100}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 🔄 Query States

### Loading States

```typescript
const {
  isLoading, // Initial loading (no data yet)
  isFetching, // Any fetch (including background refetch)
  isRefetching, // Background refetch (has cached data)
} = usePlans();
```

### Success State

```typescript
const {
  isSuccess, // Query succeeded
  data, // The actual data
} = usePlans();
```

### Error State

```typescript
const {
  isError, // Query failed
  error, // Error object
} = usePlans();
```

---

## 🛠️ Mutation States

```typescript
const createPlan = useCreatePlan();

createPlan.isPending; // Mutation in progress
createPlan.isSuccess; // Mutation succeeded
createPlan.isError; // Mutation failed
createPlan.error; // Error object
createPlan.data; // Response data
```

---

## 🎨 Component Examples

### Full CRUD Example

```typescript
'use client';

import { usePlans, useCreatePlan, useUpdatePlan, useDeletePlan } from '@/hooks/use-subscription-plans';
import { useQueryClient } from '@tanstack/react-query';

export function PlansManager() {
  const queryClient = useQueryClient();
  const { data: plans, isLoading } = usePlans();
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();
  const deletePlan = useDeletePlan();

  const handleCreate = async (planData) => {
    await createPlan.mutateAsync([planData]);
    queryClient.invalidateQueries({ queryKey: ['subscription_plans'] });
  };

  const handleUpdate = async (planId, updates) => {
    await updatePlan.mutateAsync({ id: planId, ...updates });
    queryClient.invalidateQueries({ queryKey: ['subscription_plans'] });
  };

  const handleDelete = async (planId) => {
    await deletePlan.mutateAsync({ id: planId });
    queryClient.invalidateQueries({ queryKey: ['subscription_plans'] });
  };

  if (isLoading) return <Loader />;

  return (
    <div>
      <button onClick={() => handleCreate({ name: 'New Plan', /* ... */ })}>
        Create Plan
      </button>

      {plans?.map(plan => (
        <div key={plan.id}>
          <h3>{plan.name}</h3>
          <button onClick={() => handleUpdate(plan.id, { is_active: !plan.is_active })}>
            Toggle Active
          </button>
          <button onClick={() => handleDelete(plan.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## 🧪 Testing Examples

### Mock Query Hook

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePlans } from '@/hooks/use-subscription-plans';

test('usePlans returns plans data', async () => {
  const queryClient = new QueryClient();

  const { result } = renderHook(() => usePlans(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    ),
  });

  await waitFor(() => expect(result.current.isSuccess).toBe(true));

  expect(result.current.data).toBeDefined();
  expect(Array.isArray(result.current.data)).toBe(true);
});
```

---

## 📝 Type Safety

### Inferred Types

```typescript
// TypeScript infers types automatically
const { data: plans } = usePlans();
// plans: Array<SubscriptionPlan> | undefined

// Access with type safety
plans?.forEach(plan => {
  console.log(plan.name); // ✅ TypeScript knows 'name' exists
  console.log(plan.invalid); // ❌ TypeScript error
});
```

### Explicit Types

```typescript
import type { Database } from '@/lib/supabase/db/database.types';

type Plan = Database['public']['Tables']['subscription_plans']['Row'];

const { data: plans } = usePlans() as { data: Plan[] | undefined };
```

---

## 🎉 Best Practices

1. **Always use 'use client'** directive in components using hooks
2. **Handle loading states** with spinners or skeletons
3. **Handle error states** with user-friendly messages
4. **Invalidate queries** after mutations for fresh data
5. **Use conditional queries** for dynamic parameters
6. **Parallel queries** for independent data fetching
7. **Manual refetch** when user explicitly requests refresh
8. **Toast notifications** for mutation success/failure feedback

---

## 🔗 Related Files

- Query Builders: `src/hooks/queries/*.ts`
- React Hooks: `src/hooks/use-*.ts`
- Provider: `src/lib/providers.tsx`
- Supabase Client: `src/lib/supabase/client.ts`
- Database Types: `src/lib/supabase/db/database.types.ts`

---

## 📖 Documentation

- [Full Migration Guide](./TANSTACK_QUERY_MIGRATION.md)
- [Implementation Summary](./TANSTACK_QUERY_IMPLEMENTATION_SUMMARY.md)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Supabase Cache Helpers](https://github.com/psteinroe/supabase-cache-helpers)
