# Admin Dashboard - Complete Implementation

## Overview

A comprehensive admin dashboard for managing users, subscription plans, and active subscriptions in the EduAssist AI platform. Built with Next.js App Router, shadcn/ui components, TanStack Table, and Supabase.

## 📂 Project Structure

```
src/
├── app/
│   └── admin/
│       ├── page.tsx                    # Main dashboard page
│       ├── users/
│       │   └── page.tsx                # Users management page
│       ├── plans/
│       │   ├── page.tsx                # Subscription plans page
│       │   └── create/
│       │       └── page.tsx            # Create new plan page
│       └── subscriptions/
│           └── page.tsx                # Active subscriptions page
│
└── components/
    └── admin/
        ├── layout/
        │   ├── admin-dashboard-layout.tsx   # Main layout wrapper
        │   └── admin-header.tsx             # Header with breadcrumbs
        ├── sidebar/
        │   └── admin-sidebar.tsx            # Navigation sidebar
        ├── dashboard/
        │   └── admin-dashboard-content.tsx  # Dashboard stats & quick actions
        ├── users/
        │   ├── users-columns.tsx            # User table column definitions
        │   └── users-data-table.tsx         # User table component
        ├── plans/
        │   ├── plans-columns.tsx            # Plans table columns
        │   ├── plans-data-table.tsx         # Plans table component
        │   └── create-plan-form.tsx         # Create plan form
        └── subscriptions/
            ├── subscriptions-columns.tsx    # Subscriptions table columns
            └── subscriptions-data-table.tsx # Subscriptions table component
```

## ✨ Features

### 1. Dashboard Overview (`/admin`)

- **Statistics Cards**: Total users, active subscriptions, available plans, estimated revenue
- **Quick Actions**: Direct links to manage users, plans, and subscriptions
- **Real-time Data**: Fetches live data from Supabase

### 2. Users Management (`/admin/users`)

- **User List Table**: Displays all registered users with profiles
- **User Information**:
  - Full name with avatar
  - Username and email
  - Subscription status and plan
  - Join date
- **Features**:
  - Sortable columns (name, email, join date)
  - Search/filter by email
  - Column visibility toggle
  - Pagination controls
  - Row actions (copy ID, view details, suspend user)

### 3. Subscription Plans (`/admin/plans`)

- **Plans Table**: All subscription plans with details
- **Plan Information**:
  - Name and description
  - Price and billing interval
  - Free trial period
  - Active/inactive status
  - Creation date
- **Features**:
  - Create new plans (integrates with MercadoPago API)
  - Sort by name, price, created date
  - Filter by plan name
  - Edit/deactivate plans
  - View subscribers

### 4. Active Subscriptions (`/admin/subscriptions`)

- **Subscriptions Table**: All user subscriptions
- **Subscription Details**:
  - User information (name, email)
  - Plan details (name, price, interval)
  - Status (authorized, pending, cancelled, paused)
  - Next billing date / trial end date
  - Start date
  - Cancellation indicators
- **Features**:
  - Filter by user email
  - Sort by user, plan, dates
  - Pause/cancel subscriptions
  - View payment history
  - Copy IDs for external reference

### 5. Create Plan Form (`/admin/plans/create`)

- **Comprehensive Form** with validation:
  - Plan name and description
  - Price (in cents) and currency
  - Billing interval (days, months, years)
  - Interval count (e.g., 3 months)
  - Free trial period (optional)
  - Features list (comma-separated)
  - Active/inactive toggle
- **Integration**:
  - Creates plan in MercadoPago
  - Saves to Supabase database
  - Success/error notifications
  - Redirects to plans list on success

## 🎨 Design System

### Layout Components

- **Sidebar Navigation**: Collapsible sidebar with menu items
- **Header**: Breadcrumb navigation and sidebar trigger
- **Content Area**: Responsive container with proper spacing

### Data Tables

- **TanStack Table**: Powerful, headless table library
- **Features**:
  - Sorting (multi-column)
  - Filtering (by text)
  - Pagination
  - Column visibility
  - Row selection
  - Responsive design

### UI Components (shadcn/ui)

- Avatar
- Badge
- Button
- Card
- Dropdown Menu
- Form (react-hook-form + zod)
- Input / Textarea / Select
- Switch
- Table
- Sidebar
- All styled with Tailwind CSS

## 🔒 Authentication & Authorization

### Current Implementation

```typescript
// Check authentication
const {
  data: { user },
  error: authError,
} = await supabase.auth.getUser();

if (authError || !user) {
  redirect('/auth/login');
}
```

### TODO: Add Admin Role Check

```typescript
// Add to each admin page
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single();

if (profile?.role !== 'admin') {
  redirect('/dashboard'); // or show unauthorized page
}
```

## 📊 Data Flow

### Users Page

```
Supabase Query
  ↓
profiles table (user data)
  ↓
auth.admin.getUserById (email)
  ↓
user_subscriptions (subscription data)
  ↓
Transform & Display
```

### Plans Page

```
Supabase Query
  ↓
subscription_plans table
  ↓
Transform data
  ↓
Display in DataTable
```

### Subscriptions Page

```
Supabase Query
  ↓
user_subscriptions (user_id → auth.users.id) JOIN subscription_plans
  ↓
For each subscription:
  - Get auth data for email (auth.admin.getUserById)
  - Get profile data from profiles table (profiles.id → auth.users.id)
  ↓
Transform & Display
```

**Important**: `user_subscriptions.user_id` references `auth.users.id` directly. Since `profiles.id` also references `auth.users.id`, we query both auth and profiles using the same `user_id`.

### Create Plan

```
Form Submission
  ↓
Zod Validation
  ↓
POST /api/subscriptions/plan/create
  ↓
MercadoPago API (create plan)
  ↓
Supabase (save plan)
  ↓
Success/Error Response
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase project set up
- MercadoPago account with API keys
- Environment variables configured

### Installation

1. **Navigate to admin dashboard**:

   ```bash
   npm run dev
   # Visit http://localhost:3000/admin
   ```

2. **Required Environment Variables**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your_anon_key
   MERCADOPAGO_ACCESS_TOKEN=your_mp_token
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

### Database Setup

Ensure these tables exist in Supabase:

```sql
-- profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  username TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- subscription_plans
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price BIGINT NOT NULL,
  currency TEXT DEFAULT 'ARS',
  interval TEXT NOT NULL,
  interval_count INTEGER DEFAULT 1,
  trial_period_days INTEGER,
  features JSONB,
  is_active BOOLEAN DEFAULT true,
  mercadopago_plan_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- user_subscriptions
-- IMPORTANT: user_id references auth.users(id) directly, not profiles
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),  -- References auth.users, not profiles
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  status TEXT NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  mercadopago_preapproval_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NOTE: To get user profile data, query profiles table using the same user_id
-- since profiles.id also references auth.users(id)
```

## 📝 Usage Examples

### Creating a New Plan

1. Navigate to `/admin/plans`
2. Click "Create Plan" button
3. Fill in the form:
   - Name: "Premium Plan"
   - Price: 9999 (= $99.99)
   - Currency: ARS
   - Interval: months
   - Interval Count: 1
   - Trial: 14 days
   - Features: "Unlimited emails, Priority support"
4. Toggle "Active Plan" ON
5. Click "Create Plan"
6. Plan is created in MercadoPago and saved to database

### Managing Users

1. Navigate to `/admin/users`
2. Use search box to filter by email
3. Click column headers to sort
4. Use "View" button to toggle column visibility
5. Click actions menu (⋮) for user-specific actions:
   - Copy user ID or email
   - View details
   - View subscriptions
   - Suspend user

### Monitoring Subscriptions

1. Navigate to `/admin/subscriptions`
2. View all active subscriptions with status badges
3. Filter by user email
4. Check "Next Billing" column for upcoming charges
5. Look for "Cancels at period end" indicators
6. Use actions menu to manage subscriptions

## 🎯 Best Practices

### Code Organization

✅ Feature-based folder structure
✅ Separation of concerns (columns, data-table, pages)
✅ Reusable components
✅ Type-safe with TypeScript
✅ Clean, self-documenting code

### Performance

✅ Server-side data fetching
✅ Efficient Supabase queries
✅ Optimized component rendering
✅ Proper pagination

### Security

⚠️ Add admin role checks to all admin pages
⚠️ Validate user permissions before mutations
⚠️ Sanitize user inputs
⚠️ Use RLS policies in Supabase

## 🔧 Customization

### Adding New Admin Pages

1. Create page in `src/app/admin/[feature]/page.tsx`
2. Add to sidebar in `src/components/admin/sidebar/admin-sidebar.tsx`
3. Follow existing patterns for layout and data tables

### Modifying Table Columns

Edit column definitions in respective `*-columns.tsx` files:

```typescript
export const columns: ColumnDef<YourType>[] = [
  {
    accessorKey: 'field_name',
    header: 'Display Name',
    cell: ({ row }) => {
      // Custom cell rendering
    },
  },
];
```

### Styling

All components use Tailwind CSS classes. Customize theme in `tailwind.config.js` and `globals.css`.

## 📦 Dependencies

### Core

- Next.js 15
- React 18
- TypeScript
- Tailwind CSS

### UI & Tables

- @radix-ui/\* (primitives)
- @tanstack/react-table
- lucide-react (icons)

### Forms & Validation

- react-hook-form
- zod
- @hookform/resolvers

### Backend

- @supabase/ssr
- mercadopago SDK

### Utilities

- clsx / tailwind-merge
- sonner (toast notifications)

## 🐛 Troubleshooting

### "Cannot find module" errors

- Run `npm install` to ensure all dependencies are installed
- Check that file paths match the component locations

### Authentication errors

- Verify Supabase environment variables
- Check that user is authenticated before accessing admin pages
- Implement admin role checks

### Table not displaying data

- Check Supabase query in the page component
- Verify table names match your database schema
- Check browser console for errors

### Form validation errors

- Ensure Zod schema matches your form fields
- Check that required fields are filled
- Verify number inputs are parsed correctly

## 🚧 Future Enhancements

### Suggested Features

- [ ] Add admin role management
- [ ] Implement real-time updates with Supabase subscriptions
- [ ] Add analytics dashboard with charts
- [ ] Export data to CSV/PDF
- [ ] Bulk actions (edit multiple plans, suspend multiple users)
- [ ] Email notifications for admin actions
- [ ] Audit log for admin activities
- [ ] Advanced filtering and saved filters
- [ ] Custom date range selectors
- [ ] Revenue analytics and projections

### Performance Optimizations

- [ ] Implement server-side pagination for large datasets
- [ ] Add caching layer (Redis)
- [ ] Optimize Supabase queries with indexes
- [ ] Lazy load images and heavy components

## 📄 License

Part of the EduAssist AI project - See project root for license information.

## 👥 Contributing

When adding new features:

1. Follow the existing folder structure
2. Use TypeScript for type safety
3. Add proper error handling
4. Document new components
5. Test with real data
6. Keep code clean and well-organized

## 📞 Support

For issues or questions:

- Check this README
- Review component implementation
- Check Supabase and MercadoPago documentation
- Open an issue in the project repository
