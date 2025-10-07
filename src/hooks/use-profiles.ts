'use client';

import { useQuery } from '@supabase-cache-helpers/postgrest-react-query';
import useSupabaseBrowser from '@/lib/supabase/client';
import {
  getAllProfilesQuery,
  getProfileByIdQuery,
  getProfilesCountQuery,
} from './queries/profiles';

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

  return useQuery(
    profileId ? getProfileByIdQuery(client, profileId) : (null as any),
    {
      enabled: !!profileId,
    }
  );
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
