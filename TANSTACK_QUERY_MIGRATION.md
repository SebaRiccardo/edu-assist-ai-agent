# TanStack Query Migration - Admin Dashboard

## Overview

Successfully migrated the entire admin dashboard from server-side data fetching to client-side TanStack Query with `@supabase-cache-helpers/postgrest-react-query` for optimal caching and performance.

## Architecture

### Query Layer Structure

```
src/hooks/
├── queries/                      # Query builders (return Supabase queries)
│   ├── profiles.ts              # Profile queries with subscriptions
│   ├── subscription-plans.ts    # Subscription plan queries
│   ├── user-subscriptions.ts    # User subscription queries with joins
│   └── subscription-payments.ts # Payment queries
│
├── use-profiles.ts              # Profile hooks with useQuery
├── use-subscription-plans.ts    # Plan hooks with useQuery + mutations
├── use-subscriptions.ts         # Subscription hooks with useQuery + mutations
└── use-payments.ts              # Payment hooks with useQuery
```

### Query Builders (`src/hooks/queries/`)

Query builder functions take a `TypedSupabaseClient` and return Supabase query objects:

- **Purpose**: Define reusable queries without executing them
- **Pattern**: `function getXQuery(client: TypedSupabaseClient) { return client.from('table').select(...) }`
- **Benefits**: Type-safe, reusable, testable, composable

**Example:**

```typescript
export function getAllProfilesQuery(client: TypedSupabaseClient) {
  return client
    .from('profiles')
    .select(
      `
      id,
      full_name,
      username,
      avatar_url,
      is_admin,
      updated_at,
      user_subscriptions (
        id,
        status,
        plan_id,
        current_period_end,
        subscription_plans (name, price, currency, interval)
      )
    `
    )
    .order('updated_at', { ascending: false });
}
```

### React Hooks (`src/hooks/`)

Custom hooks wrap query builders with TanStack Query's `useQuery`:

- **Purpose**: Execute queries with React lifecycle integration
- **Pattern**: `const client = useSupabaseBrowser(); return useQuery(queryBuilder(client));`
- **Features**: Loading states, error handling, automatic refetching, caching

**Example:**

```typescript
export function useProfiles() {
  const client = useSupabaseBrowser();
  return useQuery(getAllProfilesQuery(client));
}
```

### Mutation Hooks

For create/update/delete operations using `useInsertMutation`, `useUpdateMutation`, `useDeleteMutation`:

```typescript
export function useCreatePlan() {
  const client = useSupabaseBrowser();
  return useInsertMutation(client.from('subscription_plans'), ['id'], null, {
    onSuccess: () => {
      console.log('Plan created successfully');
    },
  });
}
```

## Component Migration

### Before (Server Component)

```typescript
// src/app/admin/users/page.tsx
export default async function AdminUsersPage() {
  const supabase = await createClient();

  const { data: users } = await supabase
    .from('profiles')
    .select('*');

  return <UsersDataTable data={users} />;
}
```

### After (Client Component Pattern)

```typescript
// src/app/admin/users/page.tsx
export default function AdminUsersPage() {
  return (
    <AdminDashboardLayout>
      <UsersPageContent />
    </AdminDashboardLayout>
  );
}

// src/components/admin/users/users-page-content.tsx
'use client';

export function UsersPageContent() {
  const { data: users, isLoading, error } = useProfiles();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage />;

  return <UsersDataTable data={users} />;
}
```

## Migrated Pages

### ✅ Dashboard (`/admin`)

- **Component**: `AdminDashboardContent` (client)
- **Hooks Used**: `useProfiles()`, `usePlans()`, `useActiveSubscriptions()`
- **Features**: Statistics cards with loading states, count-based metrics
- **Changes**: Server-side Promise.all → 3 parallel useQuery hooks

### ✅ Users Management (`/admin/users`)

- **Component**: `UsersPageContent` (client)
- **Hooks Used**: `useProfiles()`
- **Features**: Data table with profile + subscription data (joined)
- **Changes**: Server-side fetch + auth.admin → Client-side query with auto-join
- **Note**: Email requires separate auth.admin implementation if needed

### ✅ Plans Management (`/admin/plans`)

- **Component**: `PlansPageContent` (client)
- **Hooks Used**: `usePlans()`
- **Features**: Data table with CRUD operations
- **Changes**: Server-side fetch → Client-side query
- **Mutations Available**: `useCreatePlan()`, `useUpdatePlan()`, `useDeletePlan()`

### ✅ Subscriptions Monitoring (`/admin/subscriptions`)

- **Component**: `SubscriptionsPageContent` (client)
- **Hooks Used**: `useSubscriptions()`
- **Features**: Data table with user + plan data (double-joined)
- **Changes**: Server-side fetch with auth.admin → Client-side with FK joins
- **Query Join**: `user_subscriptions → profiles (via FK) → subscription_plans (via FK)`

## Database Relationships

### Key Foreign Keys (Enables Clean Joins)

- `user_subscriptions.user_id` → `profiles.id` (FK added by user)
- `user_subscriptions.plan_id` → `subscription_plans.id`
- `subscription_payments.user_id` → `profiles.id`
- `subscription_payments.subscription_id` → `user_subscriptions.id`
- `profiles.id` → `auth.users.id` (implicit)

### Query Joins

```typescript
// getAllSubscriptionsQuery - Double join example
client.from('user_subscriptions').select(`
    *,
    profiles (full_name, username),
    subscription_plans (name, price, currency, interval)
  `);
```

## TanStack Query Configuration

### Provider Setup (`src/lib/providers.tsx`)

Already configured with existing `QueryClientProvider`:

- **Stale Time**: 60 seconds (1 minute)
- **Cache Time (gcTime)**: 5 minutes
- **Refetch on Window Focus**: Disabled
- **Retry**: 1 attempt
- **DevTools**: Enabled in development

### Client Creation (`src/lib/supabase/client.ts`)

```typescript
export default function useSupabaseBrowser() {
  return useMemo(() => createClient(), []);
}
```

## Benefits of Migration

### Performance

✅ **Client-side caching**: Data cached for 1 minute, reducing server load
✅ **Parallel queries**: Multiple queries execute simultaneously
✅ **Automatic refetching**: Keeps data fresh without manual refresh
✅ **Background updates**: Refetch without blocking UI

### Developer Experience

✅ **Loading states**: Built-in `isLoading`, `isFetching` states
✅ **Error handling**: Automatic error state management
✅ **Type safety**: Full TypeScript support with inferred types
✅ **DevTools**: React Query DevTools for debugging
✅ **Code reusability**: Query builders used across components

### User Experience

✅ **Instant navigation**: No server round-trips between pages
✅ **Loading indicators**: Spinner UI during data fetch
✅ **Error messages**: User-friendly error displays
✅ **Optimistic updates**: Mutations can update UI instantly
✅ **Stale-while-revalidate**: Show cached data while fetching fresh data

## Usage Examples

### Basic Query

```typescript
'use client';
import { usePlans } from '@/hooks/use-subscription-plans';

export function PlansList() {
  const { data: plans, isLoading, error } = usePlans();

  if (isLoading) return <Loader />;
  if (error) return <Error />;

  return <div>{plans.map(plan => <PlanCard key={plan.id} plan={plan} />)}</div>;
}
```

### Conditional Query

```typescript
export function useProfile(profileId: string | undefined) {
  const client = useSupabaseBrowser();

  return useQuery(
    profileId ? getProfileByIdQuery(client, profileId) : (null as any),
    {
      enabled: !!profileId, // Only run if profileId exists
    }
  );
}
```

### Mutation with Success Callback

```typescript
'use client';
import { useCreatePlan } from '@/hooks/use-subscription-plans';
import { useQueryClient } from '@tanstack/react-query';

export function CreatePlanForm() {
  const queryClient = useQueryClient();
  const createPlan = useCreatePlan();

  const handleSubmit = async data => {
    await createPlan.mutateAsync([data], {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['subscription_plans'] });
        toast.success('Plan created!');
      },
    });
  };
}
```

## Query Keys (for cache invalidation)

TanStack Query automatically generates keys from Supabase queries, but you can manually invalidate:

```typescript
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

// Invalidate all profiles queries
queryClient.invalidateQueries({ queryKey: ['profiles'] });

// Invalidate specific plan
queryClient.invalidateQueries({ queryKey: ['subscription_plans', planId] });

// Refetch all queries
queryClient.refetchQueries();
```

## Testing Considerations

### Query Builders (Unit Tests)

```typescript
import { getAllProfilesQuery } from '@/hooks/queries/profiles';
import { createMockClient } from '@/lib/supabase/test-utils';

test('getAllProfilesQuery builds correct query', () => {
  const client = createMockClient();
  const query = getAllProfilesQuery(client);

  expect(query.table).toBe('profiles');
  expect(query.select).toContain('user_subscriptions');
});
```

### React Hooks (Integration Tests)

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useProfiles } from '@/hooks/use-profiles';

test('useProfiles fetches profiles', async () => {
  const { result } = renderHook(() => useProfiles(), {
    wrapper: QueryClientProvider,
  });

  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data).toHaveLength(3);
});
```

## Future Enhancements

### Infinite Queries (Pagination)

```typescript
import { useInfiniteQuery } from '@tanstack/react-query';

export function useInfiniteProfiles() {
  return useInfiniteQuery({
    queryKey: ['profiles', 'infinite'],
    queryFn: ({ pageParam = 0 }) => fetchProfiles(pageParam),
    getNextPageParam: lastPage => lastPage.nextCursor,
  });
}
```

### Optimistic Updates

```typescript
export function useUpdatePlanOptimistic() {
  const queryClient = useQueryClient();

  return useUpdateMutation({
    onMutate: async newData => {
      // Cancel ongoing queries
      await queryClient.cancelQueries(['subscription_plans']);

      // Snapshot previous value
      const previous = queryClient.getQueryData(['subscription_plans']);

      // Optimistically update cache
      queryClient.setQueryData(['subscription_plans'], old =>
        updatePlanInList(old, newData)
      );

      return { previous };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(['subscription_plans'], context.previous);
    },
  });
}
```

### Real-time Subscriptions

```typescript
import { useEffect } from 'react';

export function useRealTimePlans() {
  const queryClient = useQueryClient();
  const client = useSupabaseBrowser();

  useEffect(() => {
    const subscription = client
      .channel('subscription_plans_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'subscription_plans' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['subscription_plans'] });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [client, queryClient]);

  return usePlans();
}
```

## Troubleshooting

### TypeScript Errors

- **Issue**: `Property 'count' does not exist on type '{ id: string; }[]'`
- **Solution**: Use `.select('id', { count: 'exact', head: true })` returns count in metadata, access with `select: (data: any) => data.count`

### Stale Data

- **Issue**: Data not updating after mutation
- **Solution**: Invalidate queries after mutation:
  ```typescript
  queryClient.invalidateQueries({ queryKey: ['profiles'] });
  ```

### Loading State Issues

- **Issue**: Component shows loading forever
- **Solution**: Check browser console for Supabase errors, verify RLS policies

### Type Inference Issues

- **Issue**: TypeScript can't infer query return types
- **Solution**: Use `TypedSupabaseClient` from `@/lib/supabase/client` and ensure database types are up-to-date

## Related Documentation

- [Admin Dashboard README](./ADMIN_DASHBOARD_README.md)
- [Database Relationship Fix](./DATABASE_RELATIONSHIP_FIX.md)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Supabase Cache Helpers](https://github.com/psteinroe/supabase-cache-helpers)

## Conclusion

The admin dashboard is now fully client-side with modern data fetching patterns. All pages use TanStack Query for optimal performance, caching, and developer experience. The query layer is well-structured, type-safe, and ready for future enhancements like real-time subscriptions and optimistic updates.
