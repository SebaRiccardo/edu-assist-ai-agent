import { TypedSupabaseClient } from '@/lib/supabase/types/client.types';

/**
 * Query builder for fetching all subscription payments
 */
export function getAllPaymentsQuery(client: TypedSupabaseClient) {
  return client
    .from('subscription_payments')
    .select(
      `
      id,
      amount,
      currency,
      status,
      payment_method,
      paid_at,
      created_at,
      mercadopago_payment_id,
      user_id,
      subscription_id,
      profiles (
        full_name,
        username
      )
    `
    )
    .order('created_at', { ascending: false });
}

/**
 * Query builder for fetching payments by user ID
 */
export function getPaymentsByUserIdQuery(
  client: TypedSupabaseClient,
  userId: string
) {
  return client
    .from('subscription_payments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
}

/**
 * Query builder for fetching payments by subscription ID
 */
export function getPaymentsBySubscriptionIdQuery(
  client: TypedSupabaseClient,
  subscriptionId: string
) {
  return client
    .from('subscription_payments')
    .select('*')
    .eq('subscription_id', subscriptionId)
    .order('created_at', { ascending: false });
}
