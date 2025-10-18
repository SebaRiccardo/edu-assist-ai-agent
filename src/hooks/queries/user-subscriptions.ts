import { TypedSupabaseClient } from '@/lib/supabase/types/client.types';

/**
 * Query builder for fetching all user subscriptions with profile and plan data
 */
export function getAllSubscriptionsQuery(client: TypedSupabaseClient) {
  return client
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
      updated_at,
      mercadopago_preapproval_id,
      profiles (
        id,
        full_name,
        username,
        email,
        avatar_url
      ),
    `
    )
    .order('created_at', { ascending: false });
}

/**
 * Query builder for fetching active subscriptions only
 */
export function getActiveUserSubscriptionsQuery(client: TypedSupabaseClient) {
  return client
    .from('user_subscriptions')
    .select(
      `
      id,
      user_id,
      plan_id,
      status,
      current_period_start,
      current_period_end,
      created_at,
      profiles (
        id,
        full_name,
        username,
        email,
        avatar_url
      ),
    `
    )
    .eq('status', 'authorized')
    .eq('status', 'active')
    .order('created_at', { ascending: false });
}

export function getUserSubscriptionById(
  client: TypedSupabaseClient,
  userId: string
) {
  return client.from('user_subscriptions').select(`*`).eq('user_id', userId);
}

/**
 * Query builder for fetching subscriptions count
 */
export function getSubscriptionsCountQuery(
  client: TypedSupabaseClient,
  status?: string
) {
  const query = client
    .from('user_subscriptions')
    .select('id', { count: 'exact', head: true });

  if (status) {
    query.eq('status', status);
  }

  return query;
}
