import { NextRequest, NextResponse } from 'next/server';
import { mercadoPagoService } from '@/lib/mercadopago/service';
import { createClient } from '@/lib/supabase/server';

/**
 * MercadoPago Webhook Handler
 * Handles payment and subscription events from MercadoPago
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('Webhook received:', {
      action: body.action,
      type: body.type,
      id: body.data?.id,
    });

    // Validate webhook signature (optional but recommended)
    const xSignature = request.headers.get('x-signature');
    const xRequestId = request.headers.get('x-request-id');

    if (xSignature && xRequestId && body.data?.id) {
      const isValid = mercadoPagoService.validateWebhookSignature(
        xSignature,
        xRequestId,
        body.data.id
      );

      if (!isValid) {
        console.error('Invalid webhook signature');
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    // Handle different event types
    switch (body.type) {
      case 'subscription_preapproval':
      case 'subscription_authorized_payment':
      case 'subscription_preapproval_plan':
        await handleSubscriptionEvent(body);
        break;

      case 'payment':
        await handlePaymentEvent(body);
        break;

      default:
        console.log('Unhandled event type:', body.type);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Handles subscription-related events
 */
async function handleSubscriptionEvent(body: any) {
  const { action, data } = body;
  const subscriptionId = data?.id;

  if (!subscriptionId) {
    console.error('No subscription ID in webhook');
    return;
  }

  try {
    // Fetch subscription details from MercadoPago
    const result = await mercadoPagoService.getSubscription(subscriptionId);

    if (!result.success || !result.data) {
      console.error('Failed to fetch subscription:', result.error);
      return;
    }

    const subscription = result.data;
    const supabase = await createClient();

    console.log('Processing subscription event:', {
      id: subscription.id,
      status: subscription.status,
      action,
    });

    // Map MercadoPago status to our status
    let dbStatus = 'pending';
    switch (subscription.status) {
      case 'authorized':
        dbStatus = 'active';
        break;
      case 'paused':
        dbStatus = 'paused';
        break;
      case 'cancelled':
        dbStatus = 'cancelled';
        break;
      case 'pending':
        dbStatus = 'pending';
        break;
      default:
        dbStatus = subscription.status || 'pending';
    }

    // Calculate period dates
    const now = new Date();
    const periodStart = subscription.date_created
      ? new Date(subscription.date_created)
      : now;

    // Calculate period end based on frequency
    let periodEnd = new Date(periodStart);
    if (subscription.auto_recurring) {
      const frequency = subscription.auto_recurring.frequency || 1;
      const frequencyType = subscription.auto_recurring.frequency_type;

      switch (frequencyType) {
        case 'months':
          periodEnd.setMonth(periodEnd.getMonth() + frequency);
          break;
        case 'days':
          periodEnd.setDate(periodEnd.getDate() + frequency);
          break;
        case 'years':
          periodEnd.setFullYear(periodEnd.getFullYear() + frequency);
          break;
      }
    }

    // Update or create subscription in database
    if (!subscription.id) {
      console.error('Missing subscription ID');
      return;
    }

    const { error: upsertError } = await supabase
      .from('user_subscriptions')
      .update({
        status: dbStatus,
        current_period_start: periodStart.toISOString(),
        current_period_end: periodEnd.toISOString(),
        updated_at: now.toISOString(),
        ...(dbStatus === 'cancelled' && {
          cancelled_at: now.toISOString(),
        }),
      })
      .eq('mercadopago_preapproval_id', subscription.id);

    if (upsertError) {
      console.error('Database update error:', upsertError);
      return;
    }

    console.log('Subscription updated successfully:', {
      mercadopagoId: subscription.id,
      status: dbStatus,
    });

    // Send notification emails based on action
    switch (action) {
      case 'created':
        console.log('Subscription created - send welcome email');
        // TODO: Send welcome email
        break;
      case 'updated':
        console.log('Subscription updated - send notification');
        // TODO: Send update notification
        break;
    }
  } catch (error) {
    console.error('Error handling subscription event:', error);
  }
}

/**
 * Handles payment-related events
 */
async function handlePaymentEvent(body: any) {
  const { action, data } = body;
  const paymentId = data?.id;

  if (!paymentId) {
    console.error('No payment ID in webhook');
    return;
  }

  try {
    // Fetch payment details from MercadoPago
    const result = await mercadoPagoService.getPayment(paymentId);

    if (!result.success || !result.data) {
      console.error('Failed to fetch payment:', result.error);
      return;
    }

    const payment = result.data;

    console.log('Processing payment event:', {
      id: payment.id,
      status: payment.status,
      amount: payment.transaction_amount,
      action,
    });

    // Handle different payment statuses
    switch (payment.status) {
      case 'approved':
        console.log('Payment approved - activate subscription if needed');
        // TODO: Update subscription status to active
        // TODO: Send payment confirmation email
        break;

      case 'pending':
      case 'in_process':
        console.log('Payment pending - wait for confirmation');
        // TODO: Send pending payment notification
        break;

      case 'rejected':
      case 'cancelled':
        console.log('Payment failed - notify user');
        // TODO: Send payment failure notification
        break;
    }
  } catch (error) {
    console.error('Error handling payment event:', error);
  }
}

// Allow GET for webhook verification (MercadoPago may send GET requests)
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Webhook endpoint is active',
    timestamp: new Date().toISOString(),
  });
}
