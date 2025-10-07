import { TypedSupabaseClient } from '@/lib/supabase/client';

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
        avatar_url
      ),
      subscription_plans (
        id,
        name,
        price,
        currency,
        interval,
        interval_count
      )
    `
    )
    .order('created_at', { ascending: false });
}

/**
 * Query builder for fetching active subscriptions only
 */
export function getActiveSubscriptionsQuery(client: TypedSupabaseClient) {
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
        full_name,
        username
      ),
      subscription_plans (
        name,
        price,
        currency
      )
    `
    )
    .eq('status', 'authorized')
    .order('created_at', { ascending: false });
}

/**
 * Query builder for fetching subscriptions by user ID
 */
export function getSubscriptionsByUserIdQuery(
  client: TypedSupabaseClient,
  userId: string
) {
  return client
    .from('user_subscriptions')
    .select(
      `
      id,
      plan_id,
      status,
      current_period_start,
      current_period_end,
      trial_start,
      trial_end,
      cancel_at_period_end,
      created_at,
      subscription_plans (
        name,
        price,
        currency,
        interval
      )
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
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
