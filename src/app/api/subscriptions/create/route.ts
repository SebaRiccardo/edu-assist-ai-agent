// app/api/subscriptions/create/route.ts

import { subscribeUserToPlan } from '@/lib/mercadopago';
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { planId, userId } = await request.json();

    const supabase = await createClient();

    const { data: authResponse, error: authError } =
      await supabase.auth.getUser();

    if (authError) {
      console.log(authError.message);
      return NextResponse.json({ error: 'unknow error' }, { status: 401 });
    }

    // Get plan details
    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const { user } = authResponse;

    const {
      success,
      error,
      data: subscriptionResponse,
    } = await subscribeUserToPlan(
      planId,
      user.email!,
      user.user_metadata.displayName
    );

    if (!success) throw new Error(error);

    // Save subscription in database
    const { data: subscription, error: dbError } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: userId,
        plan_id: planId,
        mercadopago_preapproval_id: plan.mercadopago_plan_id,
        status: 'pending',
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return NextResponse.json({
      subscription,
      init_point: subscriptionResponse?.init_point, // URL to redirect user for payment
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
