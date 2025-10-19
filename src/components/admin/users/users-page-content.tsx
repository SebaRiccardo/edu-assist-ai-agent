'use client';

import { UsersDataTable } from '@/components/admin/users/users-data-table';
import { columns, UserRow } from '@/components/admin/users/users-columns';
import { useProfiles } from '@/hooks/use-profiles';
import { Loader2 } from 'lucide-react';

export function UsersPageContent() {
  const { data: users, isLoading, error } = useProfiles();

  if (error) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-destructive">Error loading users. Please try again.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Loading users...</p>
      </div>
    );
  }

  // Transform data for table
  const usersData: UserRow[] = (users || []).map(profile => ({
    id: profile.id,
    full_name: profile.full_name || 'N/A',
    email: profile.email || 'N/A',
    username: profile.username,
    avatar_url: profile.avatar_url,
    created_at: profile.created_at, // From auth if needed
    updated_at: profile.updated_at,
    subscription_status: profile.user_subscriptions?.[0]?.status || 'none',
    subscription_plan: (profile.user_subscriptions?.[0]?.subscription_plans as any)?.name || 'None',
  }));

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <h1 className="text-3xl font-bold tracking-tight">Users Management</h1>
        <p className="text-muted-foreground mt-2">View and manage all registered users.</p>
      </div>
      <div className="px-4 lg:px-6">
        <UsersDataTable columns={columns} data={usersData} />
      </div>
    </div>
  );
}
