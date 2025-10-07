import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AdminDashboardLayout } from '@/components/admin/layout/admin-dashboard-layout';
import { SubscriptionsDataTable } from '@/components/admin/subscriptions/subscriptions-data-table';
import { columns } from '@/components/admin/subscriptions/subscriptions-columns';

export default async function AdminSubscriptionsPage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/auth/login');
  }

  // Fetch all subscriptions with plan data
  // Note: user_subscriptions.user_id references auth.users.id
  const { data: subscriptions, error } = await supabase
    .from('user_subscriptions')
    .select(
      `
      id,
      user_id,
      plan_id,
      status,
      current_period_start,
      current_period_end,
      trial_start,
      trial_end,
      cancel_at_period_end,
      cancelled_at,
      created_at,
      mercadopago_preapproval_id,
      subscription_plans (
        name,
        price,
        currency,
        interval
      )
    `
    )
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching subscriptions:', error);
    return (
      <AdminDashboardLayout>
        <div className="flex flex-col gap-4 p-4">
          <h1 className="text-3xl font-bold">Active Subscriptions</h1>
          <p className="text-destructive">
            Error loading subscriptions. Please try again.
          </p>
        </div>
      </AdminDashboardLayout>
    );
  }

  // Get user emails and profiles
  // Since user_subscriptions.user_id references auth.users.id,
  // we fetch both auth data (for email) and profiles (for names) using user_id
  const subscriptionsWithEmails = await Promise.all(
    (subscriptions || []).map(async sub => {
      // Get auth data for email
      const { data: authData } = await supabase.auth.admin.getUserById(
        sub.user_id
      );

      // Get profile data using the same user_id (profiles.id references auth.users.id)
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, username')
        .eq('id', sub.user_id)
        .single();

      return {
        id: sub.id,
        user_id: sub.user_id,
        user_email: authData?.user?.email || 'N/A',
        user_name:
          profile?.full_name ||
          profile?.username ||
          authData?.user?.email?.split('@')[0] ||
          'N/A',
        plan_name: (sub.subscription_plans as any)?.name || 'Unknown Plan',
        plan_price: (sub.subscription_plans as any)?.price || 0,
        plan_currency: (sub.subscription_plans as any)?.currency || 'ARS',
        plan_interval: (sub.subscription_plans as any)?.interval || 'month',
        status: sub.status,
        current_period_start: sub.current_period_start,
        current_period_end: sub.current_period_end,
        trial_start: sub.trial_start,
        trial_end: sub.trial_end,
        cancel_at_period_end: sub.cancel_at_period_end || false,
        cancelled_at: sub.cancelled_at,
        created_at: sub.created_at,
        mercadopago_preapproval_id: sub.mercadopago_preapproval_id,
      };
    })
  );

  return (
    <AdminDashboardLayout>
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <h1 className="text-3xl font-bold tracking-tight">
            Active Subscriptions
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manage all user subscriptions.
          </p>
        </div>
        <div className="px-4 lg:px-6">
          <SubscriptionsDataTable
            columns={columns}
            data={subscriptionsWithEmails}
          />
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
