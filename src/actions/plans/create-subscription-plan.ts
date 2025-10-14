'use server';

import { createClient } from '@/lib/supabase/server';
import { createSubscriptionPlan as createMercadoPagoPlan } from '@/lib/mercadopago/service';
import { InsertSubscriptionPlan } from '@/lib/supabase/types/subscription-plans.types';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

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

type CreatePlanResult =
  | {
      success: true;
      message: string;
      data: {
        plan: any;
        mercadoPago: {
          planId: string | undefined;
          initPoint: string | undefined;
        };
      };
    }
  | {
      success: false;
      error: string;
      details?: any;
    };

/**
 * Server Action: Create Subscription Plan
 * Creates a new subscription plan in MercadoPago and saves it to Supabase
 *
 * @param formData - Plan creation data
 * @returns Result object with success status and data or error
 */
export async function createSubscriptionPlan(
  formData: CreatePlanRequest
): Promise<CreatePlanResult> {
  try {
    // 1. Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'Unauthorized. Please log in.',
      };
    }

    // 2. Validate request data
    const validationResult = createPlanSchema.safeParse(formData);

    if (!validationResult.success) {
      return {
        success: false,
        error: 'Invalid request data',
        details: validationResult.error.flatten().fieldErrors,
      };
    }

    const planData: CreatePlanRequest = validationResult.data;

    // 3. Create subscription plan in MercadoPago
    const mercadoPagoResult = await createMercadoPagoPlan({
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
      return {
        success: false,
        error: 'Failed to create subscription plan in MercadoPago',
        details: mercadoPagoResult.error,
      };
    }

    console.log('MercadoPago plan created:', mercadoPagoResult);

    // 4. Prepare data for Supabase
    const supabasePlan: InsertSubscriptionPlan = {
      name: planData.name,
      description: planData.description || null,
      price: planData.price,
      currency: planData.currency,
      interval: planData.interval,
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

      return {
        success: false,
        error: 'Failed to save subscription plan to database',
        details: dbError.message,
      };
    }

    // 6. Revalidate relevant paths
    revalidatePath('/admin/plans');
    revalidatePath('/admin/plans/create');

    // 7. Return success response
    return {
      success: true,
      message: 'Subscription plan created successfully',
      data: {
        plan: savedPlan,
        mercadoPago: {
          planId: mercadoPagoResult.data.id,
          initPoint: mercadoPagoResult.data.init_point,
        },
      },
    };
  } catch (error: any) {
    console.error('Unexpected error in create plan action:', error);

    return {
      success: false,
      error: 'An unexpected error occurred',
      details: error.message || 'Unknown error',
    };
  }
}

/**
 * Server Action: Create Subscription Plan from Template
 * Creates a subscription plan using predefined template configuration
 *
 * @param planType - Type of plan template ('basic' | 'pro' | 'pro_plus')
 * @param locale - Locale for pricing ('en' | 'es')
 * @returns Result object with success status and data or error
 */
export async function createSubscriptionPlanFromTemplate(
  planType: 'basic' | 'pro' | 'pro_plus',
  locale: 'en' | 'es' = 'en'
): Promise<CreatePlanResult> {
  try {
    const { getLocalizedPlan } = await import(
      '@/lib/subscriptions/plans-utils'
    );

    // Get plan configuration from template
    const planConfig = getLocalizedPlan(planType, locale);

    // Convert plan config to CreatePlanRequest
    const planData: CreatePlanRequest = {
      name: planConfig.name,
      description: planConfig.description,
      price: planConfig.price,
      currency: planConfig.currency as 'USD' | 'ARS',
      interval: 'months',
      intervalCount: 1,
      trialPeriodDays: undefined,
      features: planConfig.features,
      isActive: true,
    };

    // Create the plan using the main action
    return await createSubscriptionPlan(planData);
  } catch (error: any) {
    console.error('Error creating plan from template:', error);

    return {
      success: false,
      error: 'Failed to create plan from template',
      details: error.message || 'Unknown error',
    };
  }
}
