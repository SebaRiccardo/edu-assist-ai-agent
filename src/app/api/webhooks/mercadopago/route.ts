import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const supabase = await createClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Log the webhook event
    const { data: webhookLog, error: logError } = await supabase
      .from('webhook_events')
      .insert({
        event_type: body.action,
        resource_id: body.data?.id || body.id,
        topic: body.type,
        payload: body,
        processed: false,
      })
      .select()
      .single();

    if (logError) {
      console.error('Error logging webhook:', logError);
    }

    // Process the webhook based on topic
    switch (body.type) {
      case 'subscription_preapproval':
        await handleSubscriptionPreapproval(body, webhookLog?.id);
        break;

      case 'subscription_authorized_payment':
        await handleSubscriptionPayment(body, webhookLog?.id);
        break;

      case 'subscription_preapproval_plan':
        await handleSubscriptionPlanUpdate(body, webhookLog?.id);
        break;

      default:
        console.log(`Unhandled webhook type: ${body.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Handle subscription status changes
async function handleSubscriptionPreapproval(data: any, webhookId?: string) {
  try {
    const preapprovalId = data.data?.id as string;

    if (!preapprovalId) {
      throw new Error('No preapproval ID in webhook data');
    }

    // Fetch full preapproval details from MercadoPago
    const preapprovalDetails =
      await fetchPreapprovalFromMercadoPago(preapprovalId);

    // Map MercadoPago status to our status
    const status = mapMercadoPagoStatus(preapprovalDetails.status);

    // Update or create subscription
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .upsert({
        mercadopago_preapproval_id: preapprovalId,
        status: status,
        current_period_start: preapprovalDetails.next_payment_date
          ? new Date(preapprovalDetails.next_payment_date)
          : null,
        current_period_end: preapprovalDetails.last_modified
          ? new Date(preapprovalDetails.last_modified)
          : null,
        updated_at: new Date(),
      });

    if (error) {
      throw error;
    }

    // Mark webhook as processed
    if (webhookId) {
      await supabase
        .from('webhook_events')
        .update({ processed: true, processed_at: new Date().toISOString() })
        .eq('id', webhookId);
    }

    console.log(`Subscription ${preapprovalId} updated to status: ${status}`);
  } catch (error) {
    console.error('Error handling subscription preapproval:', error);

    // Log error in webhook events
    if (webhookId) {
      await supabase
        .from('webhook_events')
        .update({
          processed: false,
          error_message:
            error instanceof Error ? error.message : 'Unknown error',
        })
        .eq('id', webhookId);
    }
  }
}

// Handle subscription payments
async function handleSubscriptionPayment(data: any, webhookId?: string) {
  try {
    const paymentId = data.data?.id;

    if (!paymentId) {
      throw new Error('No payment ID in webhook data');
    }

    // Fetch payment details from MercadoPago
    const paymentDetails = await fetchPaymentFromMercadoPago(paymentId);

    // Find the subscription by preapproval_id
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('mercadopago_preapproval_id', paymentDetails.preapproval_id)
      .single();

    if (!subscription) {
      console.warn(`Subscription not found for payment ${paymentId}`);
      return;
    }

    // Record the payment
    const { error: paymentError } = await supabase
      .from('subscription_payments')
      .insert({
        subscription_id: subscription.id,
        user_id: subscription.user_id,
        mercadopago_payment_id: paymentId,
        amount: paymentDetails.transaction_amount,
        currency: paymentDetails.currency_id,
        status: paymentDetails.status,
        payment_method: paymentDetails.payment_method_id,
        paid_at:
          paymentDetails.status === 'approved'
            ? new Date(paymentDetails.date_approved)
            : null,
        metadata: paymentDetails,
      });

    if (paymentError) {
      throw paymentError;
    }

    // Update subscription status based on payment
    if (paymentDetails.status === 'approved') {
      const { error: subError } = await supabase
        .from('user_subscriptions')
        .update({
          status: 'active',
          current_period_start: new Date(),
          current_period_end: calculatePeriodEnd(subscription),
          updated_at: new Date(),
        })
        .eq('id', subscription.id);

      if (subError) {
        throw subError;
      }
    }

    // Mark webhook as processed
    if (webhookId) {
      await supabase
        .from('webhook_events')
        .update({ processed: true, processed_at: new Date() })
        .eq('id', webhookId);
    }

    console.log(`Payment ${paymentId} processed successfully`);
  } catch (error) {
    console.error('Error handling subscription payment:', error);

    if (webhookId) {
      await supabase
        .from('webhook_events')
        .update({
          processed: false,
          error_message:
            error instanceof Error ? error.message : 'Unknown error',
        })
        .eq('id', webhookId);
    }
  }
}

// Handle plan updates
async function handleSubscriptionPlanUpdate(data: any, webhookId?: string) {
  try {
    const planId = data.data?.id;

    // Update plan details in your database if needed
    console.log(`Plan ${planId} was updated`);

    if (webhookId) {
      await supabase
        .from('webhook_events')
        .update({ processed: true, processed_at: new Date() })
        .eq('id', webhookId);
    }
  } catch (error) {
    console.error('Error handling plan update:', error);
  }
}

// Helper function to fetch preapproval details from MercadoPago
async function fetchPreapprovalFromMercadoPago(preapprovalId: string) {
  const response = await fetch(
    `https://api.mercadopago.com/preapproval/${preapprovalId}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch preapproval: ${response.statusText}`);
  }

  return response.json();
}

// Helper function to fetch payment details from MercadoPago
async function fetchPaymentFromMercadoPago(paymentId: string) {
  const response = await fetch(
    `https://api.mercadopago.com/v1/payments/${paymentId}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch payment: ${response.statusText}`);
  }

  return response.json();
}

// Map MercadoPago status to our internal status
function mapMercadoPagoStatus(mpStatus: string): string {
  const statusMap: Record<string, string> = {
    pending: 'pending',
    authorized: 'active',
    paused: 'paused',
    cancelled: 'cancelled',
    expired: 'expired',
  };

  return statusMap[mpStatus] || 'pending';
}

// Calculate period end based on plan interval
function calculatePeriodEnd(subscription: any): Date {
  const start = new Date();
  const interval = subscription.interval || 'monthly';
  const intervalCount = subscription.interval_count || 1;

  switch (interval) {
    case 'monthly':
      start.setMonth(start.getMonth() + intervalCount);
      break;
    case 'yearly':
      start.setFullYear(start.getFullYear() + intervalCount);
      break;
    case 'weekly':
      start.setDate(start.getDate() + 7 * intervalCount);
      break;
  }

  return start;
}
