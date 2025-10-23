import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getQueryClient } from '@/providers/tankstack-query/get-query-client';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { prefetchQuery } from '@supabase-cache-helpers/postgrest-react-query';
import { getProfileByIdQuery } from '@/hooks/queries/profiles';
import { SettingsPageContent } from '@/components/settings/settings-page-content';
import { getUserSubscriptionById } from '@/hooks/queries/user-subscriptions';

/**
 * Settings Page
 * Server component that prefetches user profile and subscription data
 */
export default async function SettingsPage() {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/auth/login');
  }

  const queryClient = getQueryClient();

  // Prefetch profile data

  await Promise.all([
    prefetchQuery(queryClient, getUserSubscriptionById(supabase, user.id)),
    prefetchQuery(queryClient, getProfileByIdQuery(supabase, user.id)),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SettingsPageContent user={user} />
    </HydrationBoundary>
  );
}
