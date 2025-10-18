# Settings Page Implementation

## Overview

Comprehensive settings page for EduAssist AI where users can manage their profile, subscription, security, and notification preferences.

## Architecture

### Main Page

- **Location**: `src/app/settings/page.tsx`
- **Type**: Client Component
- **Features**:
  - Tabbed interface with 4 sections
  - Responsive layout with icons and labels
  - Smooth navigation between settings categories

### Components Structure

```
src/components/settings/
├── index.ts                        # Barrel export file
├── profile-settings.tsx            # Profile management
├── subscription-settings.tsx       # Subscription & payments
├── security-settings.tsx           # Password & OAuth
└── notification-settings.tsx       # Email preferences
```

## Component Details

### 1. Profile Settings (`profile-settings.tsx`)

**Purpose**: Manage personal information and profile picture

**Features**:

- Avatar display with fallback initials
- Full name, email, and username fields
- Avatar upload button (placeholder)
- Account information card showing:
  - User ID
  - Account creation date
- Email field is disabled (cannot be changed)
- Form submission with loading states

**Dependencies**:

- `useCurrentUser` hook for user data
- `sonner` for toast notifications
- Shadcn/ui: Card, Input, Label, Button, Avatar

**UI Elements**:

- Profile picture with 24x24 avatar
- Form fields with labels
- Save button with loading state
- Account creation date formatted

### 2. Subscription Settings (`subscription-settings.tsx`)

**Purpose**: View and manage subscription with payment history

**Features**:

- Current subscription details:
  - Plan name and description
  - Status badge (Active, Trial, Cancelled, Paused)
  - Current billing period
  - Next billing date
  - Plan limits display
- Plan limits shown:
  - AI Drafts per day
  - Connected Inboxes
  - Auto Replies (boolean)
  - Priority Support (boolean)
- Action buttons:
  - Upgrade Plan (links to /pricing)
  - Cancel Subscription (with confirmation dialog)
  - Reactivate (if cancelled)
- Payment History table:
  - Date, Amount, Status, Payment Method, Description
  - Uses native Table component (not DataTable)
  - Formats currency properly (ARS)
  - Status badges with colors

**Dependencies**:

- `useUserSubscription` hook
- `useUserPayments` hook (filters by user email)
- `useCancelSubscription` mutation
- Plan configuration from `@/subscriptions/plans`
- Shadcn/ui: Card, Badge, Table, AlertDialog, Separator

**Integration**:

- Reuses logic from `src/app/subscriptions/page.tsx`
- Adds payment history using `useUserPayments(user?.email)`
- Payment table with proper styling and status colors

### 3. Security Settings (`security-settings.tsx`)

**Purpose**: Manage password, OAuth connections, and email verification

**Features**:

- Password Section:
  - Shows if user has password-based auth
  - Reset password button with confirmation dialog
  - Sends password reset email
  - Handles OAuth-only users gracefully
- Connected Accounts:
  - Lists all OAuth providers (Google, etc.)
  - Shows provider name and email
  - "Connected" badge for each account
  - Placeholder for connecting new accounts
- Email Verification:
  - Shows primary email
  - Verification status indicator
  - Resend verification button (if unverified)

**Dependencies**:

- `useCurrentUser` hook
- Checks `user.identities` for auth providers
- Shadcn/ui: Card, Badge, Button, AlertDialog, Switch

**Security Checks**:

- Distinguishes between email and OAuth identities
- Shows appropriate UI based on auth method
- Graceful handling of users without password

### 4. Notification Settings (`notification-settings.tsx`)

**Purpose**: Manage email notification preferences

**Features**:

- Organized into 3 categories:
  1. **Account & Billing**:
     - Subscription updates
     - Payment confirmations
     - Trial reminders
  2. **Activity**:
     - Course updates
     - Email analysis digest
  3. **Product & Marketing**:
     - Product updates
     - Marketing emails
- Toggle switches for each preference
- Visual icons for each category
- Save button with loading state
- Preferences persist (TODO: implement backend)

**Dependencies**:

- `sonner` for toast notifications
- Shadcn/ui: Card, Label, Switch, Button, Separator

**State Management**:

- Local state for all notification preferences
- Async save function (placeholder)
- Optimistic UI updates

## User Flow

### Navigation

```
Settings Page
├─ Profile Tab (default)
│  └─ Edit profile info → Save
├─ Subscription Tab
│  ├─ View current plan
│  ├─ Cancel subscription → Confirm
│  ├─ Upgrade plan → Redirect to /pricing
│  └─ View payment history
├─ Security Tab
│  ├─ Reset password → Confirm → Email sent
│  └─ View connected OAuth accounts
└─ Notifications Tab
   └─ Toggle preferences → Save
```

## Data Sources

### Profile Settings

- `useCurrentUser()` - Gets current authenticated user
- User metadata: `full_name`, `username`, `avatar_url`
- Supabase Auth user object

### Subscription Settings

- `useUserSubscription(user?.id)` - Gets active subscription
- `useUserPayments(user?.email)` - Gets payment history
- `useCancelSubscription()` - Cancels subscription
- Plan data from `@/subscriptions/plans`

### Security Settings

- `useCurrentUser()` - Gets user and identities
- `user.identities` - Array of auth providers
- `user.email_confirmed_at` - Email verification status

### Notification Settings

- Local state (TODO: integrate with Supabase)
- Future: user_preferences table or user_metadata

## UI/UX Features

### Responsive Design

- Mobile-first approach
- Icon-only tabs on small screens
- Full labels on desktop (sm: breakpoint)
- Grid layouts adapt to screen size

### Loading States

- Skeleton loading for data fetching
- Spinner indicators for mutations
- Disabled buttons during operations
- Optimistic UI where appropriate

### Error Handling

- Error cards with retry options
- Toast notifications for actions
- Graceful fallbacks for missing data
- Empty states with helpful messages

### Accessibility

- Semantic HTML structure
- Proper ARIA labels on switches
- Keyboard navigation support
- Focus management in dialogs

## Styling

### Theme

- Consistent with app theme (gradient backgrounds)
- Uses Tailwind CSS utility classes
- Shadcn/ui component styling
- Responsive spacing and typography

### Color System

- Status badges: default (green), secondary (blue), destructive (red), outline (gray)
- Icons: consistent sizing (h-4 w-4 or h-5 w-5)
- Muted text for descriptions
- Primary actions in brand colors

## Future Enhancements

### Profile Settings

- [ ] Implement avatar upload to storage
- [ ] Add bio/description field
- [ ] Profile visibility settings
- [ ] Connect with user_profiles table

### Subscription Settings

- [ ] Usage tracking and limits display
- [ ] Invoice download links
- [ ] Payment method management
- [ ] Subscription pause feature

### Security Settings

- [ ] Two-factor authentication
- [ ] Session management (active sessions list)
- [ ] Login history
- [ ] Connect/disconnect OAuth accounts

### Notification Settings

- [ ] Store preferences in database
- [ ] Email frequency controls (instant, daily, weekly)
- [ ] Push notifications (if mobile app)
- [ ] In-app notification preferences

## Testing Checklist

### Profile Settings

- [ ] Load user data correctly
- [ ] Avatar fallback shows initials
- [ ] Save button triggers update
- [ ] Toast shows on success/error
- [ ] Email field is disabled

### Subscription Settings

- [ ] Subscription details display correctly
- [ ] Status badge matches subscription state
- [ ] Payment history loads and displays
- [ ] Cancel dialog confirms action
- [ ] Upgrade link navigates to pricing
- [ ] Empty state shows when no subscription

### Security Settings

- [ ] Password section shows for email users
- [ ] OAuth section shows connected accounts
- [ ] Reset password sends email
- [ ] Email verification status is accurate
- [ ] Handles OAuth-only users

### Notification Settings

- [ ] Toggles update state correctly
- [ ] Save button persists preferences
- [ ] All categories render properly
- [ ] Icons display correctly

## Implementation Notes

### Data Fetching

- Uses React Query (TanStack Query) for all API calls
- Automatic caching and refetching
- Optimistic updates where appropriate
- Error boundaries for failed requests

### Server Actions

- Profile updates (TODO: implement)
- Notification preferences save (TODO: implement)
- Password reset uses Supabase Auth
- Subscription actions already implemented

### Performance

- Client components for interactivity
- Lazy loading for heavy components
- Debounced search/filter inputs
- Pagination for large datasets

### Security

- All mutations require authentication
- Server-side validation for updates
- Rate limiting on sensitive actions
- CSRF protection via Supabase

## Related Files

### Hooks

- `src/hooks/use-current-user.ts` - User authentication
- `src/hooks/use-user-subscription.ts` - Subscription management
- `src/hooks/use-payments.ts` - Payment history

### Actions

- `src/actions/subscriptions/index.ts` - Subscription server actions
- Future: `src/actions/profile/index.ts` - Profile updates
- Future: `src/actions/notifications/index.ts` - Notification preferences

### Types

- `src/types/user.ts` - User type definitions
- `src/types/subscription.ts` - Subscription types
- `src/types/payment.ts` - Payment types

## API Endpoints Used

### Supabase Auth

- `auth.getUser()` - Get current user
- `auth.updateUser()` - Update profile (TODO)
- `auth.resetPasswordForEmail()` - Password reset (TODO)

### Database Tables

- `user_subscriptions` - Subscription records
- `payments` - Payment history (via MercadoPago)
- Future: `user_preferences` - Notification settings
- Future: `user_profiles` - Extended profile data

## Environment Variables

None specific to settings page (uses existing):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- MercadoPago credentials (for payments)
