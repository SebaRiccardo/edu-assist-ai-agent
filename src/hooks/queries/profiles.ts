import { TypedSupabaseClient } from '@/lib/supabase/types/client.types';

/**
 * Query builder for fetching all profiles with their subscriptions
 */
export function getAllProfilesQuery(client: TypedSupabaseClient) {
  return client
    .from('profiles')
    .select(
      `
      id,
      full_name,
      username,
      email,
      avatar_url,
      is_admin,
      updated_at,
      created_at,
      user_subscriptions (
        id,
        status,
        plan_id,
        current_period_end,
        subscription_plans (
          name,
          price,
          currency,
          interval
        )
      )
    `
    )
    .order('updated_at', { ascending: false });
}

/**
 * Query builder for fetching a single profile by ID
 */
export function getProfileByIdQuery(
  client: TypedSupabaseClient,
  profileId: string
) {
  return client
    .from('profiles')
    .select(
      `
      id,
      full_name,
      username,
      avatar_url,
      is_admin,
      updated_at,
      website,
      user_subscriptions (
        id,
        status,
        plan_id,
        current_period_start,
        current_period_end,
        trial_start,
        trial_end,
        cancel_at_period_end,
        cancelled_at,
        created_at,
        subscription_plans (
          name,
          price,
          currency,
          interval
        )
      )
    `
    )
    .eq('id', profileId)
    .single();
}

/**
 * Query builder for fetching profiles count
 */
export function getProfilesCountQuery(client: TypedSupabaseClient) {
  return client.from('profiles').select('id', { count: 'exact', head: true });
}
