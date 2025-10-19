import { TypedSupabaseClient } from '@/lib/supabase/types/client.types';

/**
 * Query builder for fetching all subscription plans
 */
export function getAllPlansQuery(client: TypedSupabaseClient) {
  return client.from('subscription_plans').select('*').order('created_at', { ascending: false });
}

/**
 * Query builder for fetching active plans only
 */
export function getActivePlansQuery(client: TypedSupabaseClient) {
  return client.from('subscription_plans').select('*').eq('is_active', true).order('price', { ascending: true });
}

/**
 * Query builder for fetching a single plan by ID
 */
export function getPlanByIdQuery(client: TypedSupabaseClient, planId: string) {
  return client.from('subscription_plans').select('*').eq('id', planId).single();
}

/**
 * Query builder for fetching plans count
 */
export function getPlansCountQuery(client: TypedSupabaseClient) {
  return client.from('subscription_plans').select('id', { count: 'exact', head: true });
}
