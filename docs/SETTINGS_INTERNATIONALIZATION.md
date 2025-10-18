# Settings Page - Internationalization & Reorganization

## Overview

Complete internationalization of the settings page with 5 tabs: Account, Profile, Subscription, Security, and Notifications. All content is translatable using next-intl.

## Architecture Changes

### Server Component Pattern

The main settings page is now a **server component** that:

- Fetches the authenticated user using `supabase.auth.getUser()`
- Prefetches profile data using TanStack Query
- Passes user data to the client component
- Uses HydrationBoundary for optimal performance

**File**: `src/app/settings/page.tsx`

```typescript
export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) redirect('/auth/login');

  const queryClient = getQueryClient();
  await prefetchQuery(queryClient, getProfileByIdQuery(supabase, user.id));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SettingsPageContent user={user} />
    </HydrationBoundary>
  );
}
```

### Client Component

**File**: `src/components/settings/settings-page-content.tsx`

- Receives user from server component as prop
- Handles all client-side interactivity
- Uses `useTranslations` for i18n
- 5 tabs: Account, Profile, Subscription, Security, Notifications

## New Components

### 1. Account Settings (`account-settings.tsx`)

**Purpose**: Display Supabase Auth user information (read-only)

**Data Source**: Props (user passed from server component)

**Features**:

- User ID (with copy functionality)
- Email address
- Email verification status with badges
- Authentication providers list
- Account created date
- Last sign-in date
- User metadata (JSON display)
- Connected identities with provider info

**Translations Used**: `Settings.Account.*`

**Key UI Elements**:

- Read-only information cards
- Status badges for verification
- Provider badges for OAuth identities
- Formatted timestamps
- JSON metadata display

### 2. Profile Settings (`profile-settings.tsx`)

**Purpose**: Manage user profile from `profiles` table

**Data Source**: `useProfile(user?.id)` hook - fetches from Supabase `profiles` table

**Features**:

- Avatar with upload button (TODO: implement)
- Full name (editable)
- Username (editable)
- Public profile display
- Admin badge (if applicable)
- Last updated timestamp

**Translations Used**: `Settings.Profile.*`

**Database Fields**:

- `id`: Profile ID (matches auth.users.id)
- `full_name`: User's full name
- `username`: Unique username
- `avatar_url`: Profile picture URL
- `is_admin`: Admin flag
- `updated_at`: Last modification date

**TODO**: Implement profile update mutation

## Translations Structure

### English (`messages/en.json`)

```json
{
  "Settings": {
    "title": "Settings",
    "subtitle": "Manage your account settings and preferences",
    "account": "Account",
    "profile": "Profile",
    "subscription": "Subscription",
    "security": "Security",
    "notifications": "Notifications",

    "Account": {
      "title": "Account Information",
      "subtitle": "Your Supabase authentication details",
      "userId": "User ID",
      "email": "Email Address",
      "emailVerified": "Email Verified",
      "verified": "Verified",
      "notVerified": "Not verified",
      "accountCreated": "Account Created",
      "lastSignIn": "Last Sign In",
      "authProvider": "Authentication Provider",
      "identities": "Connected Identities",
      "metadata": "User Metadata"
    },

    "Profile": {
      "title": "Profile Information",
      "subtitle": "Update your personal information and profile picture",
      "fullName": "Full Name",
      "username": "Username",
      "uploadPhoto": "Upload new photo",
      "photoRequirements": "JPG, GIF or PNG. Max size of 2MB.",
      "saveChanges": "Save Changes",
      "saving": "Saving...",
      "profileUpdated": "Profile updated successfully",
      "profileUpdateFailed": "Failed to update profile. Please try again.",
      "publicProfile": "Public Profile",
      "isAdmin": "Administrator",
      "lastUpdated": "Last Updated",
      "noProfile": "No profile found",
      "createProfile": "Create Profile"
    },

    "Subscription": {
      "title": "Subscription",
      "currentPlan": "Current Plan",
      "status": "Status",
      "active": "Active",
      "trialing": "Free Trial",
      "planLimits": "Plan Limits",
      "paymentHistory": "Payment History"
      // ... more keys
    },

    "Security": {
      "title": "Security Settings",
      "password": "Password",
      "resetPassword": "Reset Password",
      "connectedAccounts": "Connected Accounts"
      // ... more keys
    },

    "Notifications": {
      "title": "Notification Settings",
      "emailNotifications": "Email Notifications",
      "accountBilling": "Account & Billing"
      // ... more keys
    }
  }
}
```

### Spanish (`messages/es.json`)

Full Spanish translations provided for all keys.

## Tab Structure

### 1. Account Tab (NEW)

- **Icon**: UserCircle
- **Component**: `AccountSettings`
- **Props**: `user: User` (Supabase Auth user)
- **Purpose**: Display authentication information
- **Editable**: ❌ Read-only

### 2. Profile Tab (UPDATED)

- **Icon**: UserIcon
- **Component**: `ProfileSettings`
- **Data Source**: `profiles` table via `useProfile` hook
- **Purpose**: Manage public profile information
- **Editable**: ✅ Full name, username

### 3. Subscription Tab

- **Icon**: CreditCard
- **Component**: `SubscriptionSettings`
- **Purpose**: Manage subscription and view payments
- **Features**: Plan details, cancel, payment history

### 4. Security Tab

- **Icon**: Shield
- **Component**: `SecuritySettings`
- **Purpose**: Password reset, OAuth connections
- **Features**: Password management, connected accounts

### 5. Notifications Tab

- **Icon**: Bell
- **Component**: `NotificationSettings`
- **Purpose**: Email notification preferences
- **Features**: Toggle switches for all notification types

## Data Flow

```
Server (page.tsx)
├─ Fetch auth user (supabase.auth.getUser())
├─ Prefetch profile (useProfile hook query)
└─ Pass to HydrationBoundary
   └─ Client (settings-page-content.tsx)
      ├─ Account Tab: Uses user prop
      ├─ Profile Tab: Uses useProfile(user.id)
      ├─ Subscription Tab: Uses useUserSubscription(user.id)
      ├─ Security Tab: Uses user prop
      └─ Notifications Tab: Local state (TODO: backend)
```

## Database Schema

### `profiles` Table

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Note**: The `website` column was removed as it doesn't exist in the schema.

## Queries

### Profile Query (`src/hooks/queries/profiles.ts`)

```typescript
export function getProfileByIdQuery(
  client: TypedSupabaseClient,
  profileId: string | undefined
) {
  if (!profileId) {
    return client
      .from('profiles')
      .select('id, full_name, username, avatar_url, is_admin, updated_at')
      .eq('id', 'impossible-id-to-match')
      .single();
  }

  return client
    .from('profiles')
    .select('id, full_name, username, avatar_url, is_admin, updated_at')
    .eq('id', profileId)
    .single();
}
```

## Usage Example

### In Component

```typescript
import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('Settings.Profile');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('subtitle')}</p>
      <Label>{t('fullName')}</Label>
      <Button>{t('saveChanges')}</Button>
    </div>
  );
}
```

## Responsive Design

### Mobile (< 640px)

- Tab icons only
- Single column layouts
- Compact spacing

### Desktop (>= 640px)

- Tab icons + labels
- Two column layouts where appropriate
- Comfortable spacing

## Component Exports

**File**: `src/components/settings/index.ts`

```typescript
export { AccountSettings } from './account-settings';
export { ProfileSettings } from './profile-settings';
export { SubscriptionSettings } from './subscription-settings';
export { SecuritySettings } from './security-settings';
export { NotificationSettings } from './notification-settings';
```

## TODO List

### Account Settings

- [ ] Add copy-to-clipboard for User ID
- [ ] Implement resend verification email

### Profile Settings

- [ ] Implement avatar upload to Supabase Storage
- [ ] Create profile update mutation
- [ ] Add profile completion percentage
- [ ] Validate username uniqueness

### General

- [ ] Add translation for Subscription, Security, and Notifications components
- [ ] Implement actual backend for notification preferences
- [ ] Add loading skeletons for better UX
- [ ] Add form validation with Zod
- [ ] Implement optimistic updates

## Testing Checklist

- [ ] Account tab shows correct auth user info
- [ ] Profile tab fetches and displays profile data
- [ ] Profile edit form updates state correctly
- [ ] All translations work in English
- [ ] All translations work in Spanish
- [ ] Language switcher updates all text
- [ ] Server prefetching reduces loading time
- [ ] Protected route redirects unauthenticated users
- [ ] Admin badge shows only for admin users
- [ ] Timestamps format correctly

## Migration Notes

### Breaking Changes

1. **Settings page is now a server component** - if you had client-side logic in page.tsx, move it to settings-page-content.tsx
2. **Profile data now comes from `profiles` table** - not from `user_metadata`
3. **Separate Account and Profile tabs** - Auth user info vs. Profile info

### Benefits

1. ✅ Faster initial load (server prefetching)
2. ✅ Better SEO and performance
3. ✅ Clear separation of concerns
4. ✅ Full internationalization support
5. ✅ Type-safe translations with next-intl
6. ✅ Reusable translation keys

## Files Modified/Created

### Created

- `src/components/settings/account-settings.tsx`
- `src/components/settings/settings-page-content.tsx`

### Modified

- `src/app/settings/page.tsx` - Converted to server component
- `src/components/settings/profile-settings.tsx` - Now uses profiles table
- `src/components/settings/index.ts` - Added AccountSettings export
- `src/hooks/queries/profiles.ts` - Removed website field
- `messages/en.json` - Added complete Settings translations
- `messages/es.json` - Added complete Settings translations

### To Be Modified

- `src/components/settings/subscription-settings.tsx` - Add translations
- `src/components/settings/security-settings.tsx` - Add translations
- `src/components/settings/notification-settings.tsx` - Add translations
