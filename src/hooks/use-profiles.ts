'use client';

import { useQuery, useUpdateMutation } from '@supabase-cache-helpers/postgrest-react-query';
import useSupabaseBrowser from '@/lib/supabase/client';
import { getAllProfilesQuery, getProfileByIdQuery, getProfilesCountQuery } from './queries/profiles';

/**
 * Hook to fetch all profiles with their subscriptions
 */
export function useProfiles() {
  const client = useSupabaseBrowser();

  return useQuery(getAllProfilesQuery(client));
}

/**
 * Hook to fetch a single profile by ID
 */
export function useProfile(profileId: string | undefined) {
  const client = useSupabaseBrowser();

  return useQuery(getProfileByIdQuery(client, profileId), {
    enabled: !!profileId,
  });
}

/**
 * Hook to fetch a single profile by ID
 */
export function useUpdateProfile(callbacks?: { onSuccess: () => void }) {
  const client = useSupabaseBrowser();

  return useUpdateMutation(client.from('profiles') as any, ['id'], null, {
    onSuccess: callbacks?.onSuccess,
  });
}

/**
 * Hook to fetch profiles count
 */
export function useProfilesCount() {
  const client = useSupabaseBrowser();

  return useQuery(getProfilesCountQuery(client), {
    select: (data: any) => data.count,
  });
}
