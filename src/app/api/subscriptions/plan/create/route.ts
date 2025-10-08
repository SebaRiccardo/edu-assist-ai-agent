import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createSubscriptionPlan } from '@/lib/mercadopago/service';
import { InsertSubscriptionPlan } from '@/lib/supabase/types/subscription-plans.types';
import { z } from 'zod';

// Extend the route timeout for MercadoPago API calls
export const maxDuration = 30;

// Request validation schema
const createPlanSchema = z.object({
  name: z.string().min(1, 'Plan name is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  currency: z.string().default('ARS'),
  interval: z.enum(['months', 'days', 'years']),
  intervalCount: z.number().int().positive().default(1),
  trialPeriodDays: z.number().int().nonnegative().optional(),
  features: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
});

type CreatePlanRequest = z.infer<typeof createPlanSchema>;

/**
 * POST /api/subscriptions/plan/create
 * Creates a new subscription plan in MercadoPago and saves it to Supabase
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    // 2. Parse and validate request body
    const body = await request.json();
    const validationResult = createPlanSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const planData: CreatePlanRequest = validationResult.data;

    // 3. Create subscription plan in MercadoPago
    const mercadoPagoResult = await createSubscriptionPlan({
      reason: planData.name,
      autoRecurring: {
        frequency: planData.intervalCount,
        frequencyType: planData.interval,
        transactionAmount: planData.price,
        currencyId: planData.currency,
        // Add free trial if specified
        ...(planData.trialPeriodDays && {
          freeTrial: {
            frequency: planData.trialPeriodDays,
            frequencyType: 'days',
          },
        }),
      },
      backUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });

    if (!mercadoPagoResult.success || !mercadoPagoResult.data) {
      console.error(
        'MercadoPago plan creation failed:',
        mercadoPagoResult.error
      );
      return NextResponse.json(
        {
          error: 'Failed to create subscription plan in MercadoPago',
          details: mercadoPagoResult.error,
        },
        { status: 500 }
      );
    }

    // 4. Prepare data for Supabase
    const supabasePlan: InsertSubscriptionPlan = {
      name: planData.name,
      description: planData.description || null,
      price: planData.price,
      currency: planData.currency,
      interval: planData.interval,
      interval_count: planData.intervalCount,
      trial_period_days: planData.trialPeriodDays || null,
      features: planData.features ? (planData.features as any) : null,
      is_active: planData.isActive,
      mercadopago_plan_id: mercadoPagoResult.data.id || null,
    };

    // 5. Save plan to Supabase
    const { data: savedPlan, error: dbError } = await supabase
      .from('subscription_plans')
      .insert(supabasePlan)
      .select()
      .single();

    if (dbError) {
      console.error('Database insert error:', dbError);

      // Note: You may want to implement a rollback mechanism here
      // to delete the MercadoPago plan if the database insert fails

      return NextResponse.json(
        {
          error: 'Failed to save subscription plan to database',
          details: dbError.message,
        },
        { status: 500 }
      );
    }

    // 6. Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Subscription plan created successfully',
        data: {
          plan: savedPlan,
          mercadoPago: {
            planId: mercadoPagoResult.data.id,
            initPoint: mercadoPagoResult.data.init_point,
          },
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Unexpected error in create plan route:', error);

    return NextResponse.json(
      {
        error: 'An unexpected error occurred',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
