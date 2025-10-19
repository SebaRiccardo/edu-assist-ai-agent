'use server';

import { createClient } from '@/lib/supabase/server';
import { getPlanAction, createSubscriptionAction, cancelSubscriptionAction } from '@/lib/mercadopago/actions';
import type { PlanType } from '@/subscriptions/plans';

/**
 * Creates a subscription checkout session
 * Returns the init_point URL for MercadoPago hosted checkout
 */
export async function createSubscriptionCheckoutAction(params: {
  planType: PlanType;
  mercadoPagoPlanId: string;
  userEmail: string;
  userName: string;
}) {
  try {
    const supabase = await createClient();

    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    // Get MercadoPago plan details to get init_point
    const mpPlan = await getPlanAction(params.mercadoPagoPlanId);

    if (!mpPlan || !mpPlan.init_point) {
      throw new Error('Invalid plan or missing checkout URL');
    }

    // Split user name
    const nameParts = params.userName.split(' ');
    const firstName = nameParts[0] || params.userEmail;
    const lastName = nameParts.slice(1).join(' ') || '';

    // Create MercadoPago subscription (preapproval)
    const subscription = await createSubscriptionAction({
      preApprovalPlanId: params.mercadoPagoPlanId,
      reason: `EduAssist AI - ${params.planType.toUpperCase()} Plan`,
      payer: {
        email: params.userEmail,
        firstName,
        lastName,
      },
      backUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });

    // Create subscription record in database
    const { data: dbSubscription, error: dbError } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: user.id,
        plan_id: params.planType,
        mercadopago_preapproval_id: subscription.id || null,
        status: 'pending',
        current_period_start: new Date().toISOString(),
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to create subscription record');
    }

    return {
      subscriptionId: dbSubscription.id,
      mercadopagoId: subscription.id,
      init_point: subscription.init_point!,
    };
  } catch (error) {
    console.error('Subscription checkout error:', error);
    throw error;
  }
}

/**
 * Gets user's active subscription
 */
export async function getUserSubscriptionAction() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No subscription found
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Get subscription error:', error);
    throw error;
  }
}

/**
 * Updates subscription status
 */
export async function updateSubscriptionStatusAction(params: {
  mercadopagoPreapprovalId: string;
  status: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
}) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('user_subscriptions')
      .update({
        status: params.status,
        current_period_start: params.currentPeriodStart,
        current_period_end: params.currentPeriodEnd,
        updated_at: new Date().toISOString(),
      })
      .eq('mercadopago_preapproval_id', params.mercadopagoPreapprovalId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Update subscription status error:', error);
    throw error;
  }
}

/**
 * Creates a basic plan subscription for new users (free trial)
 */
export async function createBasicSubscriptionForNewUserAction(userId: string) {
  try {
    const supabase = await createClient();

    // Calculate trial dates
    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + 7); // 7 days free trial

    const { data, error } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: userId,
        type: 'basic',
        status: 'trialing',
        trial_start: now.toISOString(),
        trial_end: trialEnd.toISOString(),
        current_period_start: now.toISOString(),
        current_period_end: trialEnd.toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.log(error.message);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error('Create basic subscription error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Cancels a subscription
 */
export async function cancelUserSubscriptionAction(subscriptionId: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    // Get subscription to get mercadopago_preapproval_id
    const { data: subscription, error: fetchError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !subscription) {
      throw new Error('Subscription not found');
    }

    // Cancel in MercadoPago if there's a preapproval ID
    if (subscription.mercadopago_preapproval_id) {
      const mpResult = await cancelSubscriptionAction(subscription.mercadopago_preapproval_id);
      // mpResult is the data, not a success object
      console.log('MercadoPago subscription cancelled:', mpResult);
    }

    // Update database
    const { data, error } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscriptionId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Cancel subscription error:', error);
    throw error;
  }
}
