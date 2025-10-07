# Database Relationship Fix - Subscriptions Page

## Issue Identified

The subscriptions page was incorrectly attempting to join `user_subscriptions` with `profiles` table directly in the Supabase query.

## Root Cause

- **`user_subscriptions.user_id`** references **`auth.users.id`** (not `profiles.id`)
- This is the correct design, as subscriptions are tied to authentication, not just profiles

## Database Schema

```sql
-- auth.users (Supabase Auth table)
-- └── id (UUID)

-- profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),  -- References auth.users
  full_name TEXT,
  username TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP
);

-- user_subscriptions
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),  -- References auth.users (NOT profiles)
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  status TEXT NOT NULL,
  -- ... other fields
);
```

## Relationship Diagram

```
auth.users (id)
    ↓ FK
    ├─→ profiles (id)           # One-to-one
    └─→ user_subscriptions (user_id)  # One-to-many
```

Both `profiles.id` and `user_subscriptions.user_id` reference the same `auth.users.id`.

## Solution Implemented

### Before (Incorrect)

```typescript
// ❌ This doesn't work - can't join profiles directly in Supabase query
const { data } = await supabase.from('user_subscriptions').select(`
    *,
    profiles (full_name, username)  // Wrong! No direct FK relationship
  `);
```

### After (Correct)

```typescript
// ✅ Query subscriptions with plan data only
const { data: subscriptions } = await supabase.from('user_subscriptions')
  .select(`
    *,
    subscription_plans (name, price, currency, interval)
  `);

// ✅ Then fetch user data separately for each subscription
const subscriptionsWithUserData = await Promise.all(
  subscriptions.map(async sub => {
    // Get email from auth.users
    const { data: authData } = await supabase.auth.admin.getUserById(
      sub.user_id
    );

    // Get profile using the same user_id (profiles.id → auth.users.id)
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, username')
      .eq('id', sub.user_id)
      .single();

    return {
      ...sub,
      user_email: authData?.user?.email || 'N/A',
      user_name: profile?.full_name || profile?.username || 'N/A',
    };
  })
);
```

## Why This Approach

1. **Supabase Limitation**: Cannot join `auth.users` table in regular queries
2. **RLS Policies**: `auth.users` is managed by Supabase Auth, not regular RLS
3. **Correct Design**: Subscriptions should be tied to auth identity, not just profiles

## Performance Considerations

### Current Implementation

- Fetches all subscriptions in one query
- Then makes 2 queries per subscription (auth + profile)
- For 100 subscriptions = 1 + 200 = 201 queries

### Optimization Options (Future)

**Option 1: Batch Profile Queries**

```typescript
// Get all user IDs
const userIds = subscriptions.map(s => s.user_id);

// Fetch all profiles in one query
const { data: profiles } = await supabase
  .from('profiles')
  .select('id, full_name, username')
  .in('id', userIds);

// Create a lookup map
const profileMap = new Map(profiles.map(p => [p.id, p]));

// Auth data still needs individual calls (or use auth.admin.listUsers)
```

**Option 2: Create a Database View**

```sql
-- Create a view that includes user data
CREATE VIEW subscription_details AS
SELECT
  us.*,
  p.full_name,
  p.username,
  p.avatar_url
FROM user_subscriptions us
LEFT JOIN profiles p ON p.id = us.user_id;

-- Then query the view
-- (Note: Still need auth data for emails)
```

**Option 3: Add Email to Profiles** (Optional)

```sql
-- Store email in profiles table as well
ALTER TABLE profiles ADD COLUMN email TEXT;

-- Then can get everything without auth queries
```

## Files Modified

1. **`src/app/admin/subscriptions/page.tsx`**
   - Removed profiles join from initial query
   - Added separate profile query for each subscription
   - Added fallback to email username if no profile name

2. **`ADMIN_DASHBOARD_README.md`**
   - Updated data flow documentation
   - Added note about auth.users vs profiles relationship
   - Updated database schema with clarifying comments

## Testing Checklist

- [x] Subscriptions page loads without errors
- [x] User emails display correctly
- [x] User names display correctly (from profiles)
- [x] Plan information displays correctly
- [x] Status badges show correctly
- [x] Next billing dates display correctly
- [x] TypeScript compiles without errors

## Key Takeaways

1. **`user_subscriptions.user_id`** → **`auth.users.id`** (direct reference)
2. **`profiles.id`** → **`auth.users.id`** (direct reference)
3. Both use the same `user_id`, but no direct FK between subscriptions and profiles
4. Must query profiles separately using the `user_id` value
5. Auth data (email) requires `auth.admin.getUserById()`

## Future Enhancements

- [ ] Implement profile batch fetching for better performance
- [ ] Consider caching user data for frequently accessed pages
- [ ] Add pagination to limit subscriptions per page
- [ ] Use server-side pagination with cursor-based approach
- [ ] Add search/filter before fetching all subscriptions

---

**Fixed and documented by**: AI Assistant
**Date**: October 7, 2025
**Status**: ✅ Resolved and tested
