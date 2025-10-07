import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AdminDashboardLayout } from '@/components/admin/layout/admin-dashboard-layout';
import { UsersDataTable } from '@/components/admin/users/users-data-table';
import { columns } from '@/components/admin/users/users-columns';

export default async function AdminUsersPage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/auth/login');
  }

  // Fetch users with their profiles and subscription data
  const { data: users, error } = await supabase
    .from('profiles')
    .select(
      `
      id,
      full_name,
      username,
      avatar_url,
      updated_at
    `
    )
    .order('updated_at', { ascending: false });

  console.log(users);

  if (error) {
    console.error('Error fetching users:', error);
    return (
      <AdminDashboardLayout>
        <div className="flex flex-col gap-4 p-4">
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-destructive">
            Error loading users. Please try again.
          </p>
        </div>
      </AdminDashboardLayout>
    );
  }

  // Fetch auth data for each user
  const usersWithAuth = await Promise.all(
    (users || []).map(async profile => {
      // Get auth data
      const { data: authData } = await supabase.auth.admin.getUserById(
        profile.id
      );

      // Get subscription data
      const { data: subscriptions } = await supabase
        .from('user_subscriptions')
        .select('status, plan_id, subscription_plans(name)')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      return {
        id: profile.id,
        email: authData?.user?.email || 'N/A',
        full_name: profile.full_name || 'N/A',
        username: profile.username || 'N/A',
        avatar_url: profile.avatar_url,
        created_at: authData?.user?.created_at || null,
        updated_at: profile.updated_at,
        subscription_status: subscriptions?.status || 'none',
        subscription_plan:
          (subscriptions?.subscription_plans as any)?.name || 'None',
      };
    })
  );

  return (
    <AdminDashboardLayout>
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <h1 className="text-3xl font-bold tracking-tight">
            Users Management
          </h1>
          <p className="text-muted-foreground mt-2">
            View and manage all registered users.
          </p>
        </div>
        <div className="px-4 lg:px-6">
          <UsersDataTable columns={columns} data={usersWithAuth} />
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
