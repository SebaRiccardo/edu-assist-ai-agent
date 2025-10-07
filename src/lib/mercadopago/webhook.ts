import { NextRequest, NextResponse } from 'next/server';
import { getPayment, getPreApproval, getSubscriptionPlan } from './service';
import type { MercadoPagoWebhookEvent } from './types';

/**
 * MercadoPago Webhook Handler
 * Handles incoming webhook notifications from MercadoPago
 */

/**
 * Processes MercadoPago webhook events
 * @param request - Next.js request object
 * @returns Response indicating success or failure
 */
export async function handleMercadoPagoWebhook(
  request: NextRequest
): Promise<NextResponse> {
  try {
    // Get webhook headers for signature validation
    const xSignature = request.headers.get('x-signature');
    const xRequestId = request.headers.get('x-request-id');

    if (!xSignature || !xRequestId) {
      console.error('Missing webhook signature headers');
      return NextResponse.json(
        { error: 'Missing signature headers' },
        { status: 400 }
      );
    }

    // Parse webhook body
    const body: MercadoPagoWebhookEvent = await request.json();

    console.log('Received MercadoPago webhook:', {
      type: body.type,
      action: body.action,
      dataId: body.data.id,
    });

    // Validate webhook signature (implement according to MercadoPago docs)
    // const isValid = validateWebhookSignature(xSignature, xRequestId, body.data.id);
    // if (!isValid) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    // Process webhook based on type and action
    switch (body.action) {
      case 'payment.created':
      case 'payment.updated':
        await handlePaymentEvent(body);
        break;

      case 'subscription.created':
      case 'subscription.updated':
        await handleSubscriptionEvent(body);
        break;

      case 'subscription.preapproval_plan.updated':
        await handlePlanEvent(body);
        break;

      case 'subscription.authorized_payment':
        await handleAuthorizedPaymentEvent(body);
        break;

      default:
        console.log('Unhandled webhook action:', body.action);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error processing MercadoPago webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Handles payment-related webhook events
 */
async function handlePaymentEvent(event: MercadoPagoWebhookEvent) {
  try {
    const paymentId = event.data.id;
    const paymentResult = await getPayment(paymentId);

    if (!paymentResult.success) {
      console.error('Failed to fetch payment:', paymentResult.error);
      return;
    }

    const payment = paymentResult.data;

    if (!payment) {
      console.error('Payment data is undefined');
      return;
    }

    console.log('Payment event processed:', {
      id: payment.id,
      status: payment.status,
      amount: payment.transaction_amount,
    });

    // TODO: Update your database with payment information
    // Example:
    // await updatePaymentInDatabase({
    //   mercadopagoId: payment.id,
    //   status: payment.status,
    //   amount: payment.transaction_amount,
    //   payer_email: payment.payer?.email,
    // });

    // Send email notifications based on payment status
    if (payment.status === 'approved') {
      // TODO: Send success email
      console.log('Payment approved - send confirmation email');
    } else if (payment.status === 'rejected') {
      // TODO: Send rejection email
      console.log('Payment rejected - send notification email');
    }
  } catch (error) {
    console.error('Error handling payment event:', error);
  }
}

/**
 * Handles subscription-related webhook events
 */
async function handleSubscriptionEvent(event: MercadoPagoWebhookEvent) {
  try {
    const subscriptionId = event.data.id;
    const subscriptionResult = await getPreApproval(subscriptionId);

    if (!subscriptionResult.success) {
      console.error('Failed to fetch subscription:', subscriptionResult.error);
      return;
    }

    const subscription = subscriptionResult.data;

    if (!subscription) {
      console.error('Subscription data is undefined');
      return;
    }

    console.log('Subscription event processed:', {
      id: subscription.id,
      status: subscription.status,
      payer_email: subscription.payer_email,
    });

    // TODO: Update your database with subscription information
    // Example:
    // await updateSubscriptionInDatabase({
    //   mercadopagoId: subscription.id,
    //   status: subscription.status,
    //   payer_email: subscription.payer_email,
    //   plan_id: subscription.preapproval_plan_id,
    // });

    // Handle different subscription statuses
    switch (subscription.status) {
      case 'authorized':
        // TODO: Grant user access to subscription features
        console.log('Subscription authorized - grant access');
        break;

      case 'paused':
        // TODO: Pause user access
        console.log('Subscription paused - suspend access');
        break;

      case 'cancelled':
        // TODO: Revoke user access
        console.log('Subscription cancelled - revoke access');
        break;

      case 'ended':
        // TODO: Handle subscription end
        console.log('Subscription ended - handle expiration');
        break;
    }
  } catch (error) {
    console.error('Error handling subscription event:', error);
  }
}

/**
 * Handles plan-related webhook events
 */
async function handlePlanEvent(event: MercadoPagoWebhookEvent) {
  try {
    const planId = event.data.id;
    const planResult = await getSubscriptionPlan(planId);

    if (!planResult.success) {
      console.error('Failed to fetch plan:', planResult.error);
      return;
    }

    const plan = planResult.data;

    if (!plan) {
      console.error('Plan data is undefined');
      return;
    }

    console.log('Plan event processed:', {
      id: plan.id,
      status: plan.status,
    });

    // TODO: Update your database with plan information
    // Example:
    // await updatePlanInDatabase({
    //   mercadopagoId: plan.id,
    //   status: plan.status,
    //   amount: plan.auto_recurring.transaction_amount,
    // });
  } catch (error) {
    console.error('Error handling plan event:', error);
  }
}

/**
 * Handles authorized payment events for subscriptions
 */
async function handleAuthorizedPaymentEvent(event: MercadoPagoWebhookEvent) {
  try {
    const paymentId = event.data.id;
    const paymentResult = await getPayment(paymentId);

    if (!paymentResult.success) {
      console.error('Failed to fetch authorized payment:', paymentResult.error);
      return;
    }

    const payment = paymentResult.data;

    if (!payment) {
      console.error('Authorized payment data is undefined');
      return;
    }

    console.log('Authorized payment event processed:', {
      id: payment.id,
      status: payment.status,
      amount: payment.transaction_amount,
    });

    // TODO: Record subscription payment in your database
    // Example:
    // await recordSubscriptionPayment({
    //   mercadopagoId: payment.id,
    //   subscription_id: payment.metadata?.subscription_id,
    //   amount: payment.transaction_amount,
    //   status: payment.status,
    // });
  } catch (error) {
    console.error('Error handling authorized payment event:', error);
  }
}

/**
 * Validates webhook authenticity
 * Implement according to: https://www.mercadopago.com/developers/en/docs/your-integrations/notifications/webhooks
 */
export function validateWebhookSignature(
  xSignature: string,
  xRequestId: string,
  dataId: string
): boolean {
  try {
    // TODO: Implement signature validation
    // This requires:
    // 1. Extract ts and hash from x-signature header
    // 2. Get your webhook secret from environment
    // 3. Create manifest: id + request_id + ts
    // 4. Generate HMAC SHA256 hash with secret
    // 5. Compare with received hash

    const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
    if (!secret) {
      console.warn('MERCADOPAGO_WEBHOOK_SECRET not configured');
      return false;
    }

    // Placeholder - implement actual validation
    return true;
  } catch (error) {
    console.error('Error validating webhook signature:', error);
    return false;
  }
}
