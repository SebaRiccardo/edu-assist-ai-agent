import { createClient, isAdminUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AdminDashboardContent } from '@/components/admin/dashboard/admin-dashboard-content';
import { getQueryClient } from '@/providers/tankstack-query/get-query-client';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { prefetchQuery } from '@supabase-cache-helpers/postgrest-react-query';
import { getAllProfilesQuery } from '@/hooks/queries/profiles';

/**
 * Admin Dashboard Page
 * Protected route - only accessible to admin users
 */
export default async function AdminPage() {
  const supabase = await createClient();

  const queryClient = getQueryClient();

  await prefetchQuery(queryClient, getAllProfilesQuery(supabase));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminDashboardContent />
    </HydrationBoundary>
  );
}
