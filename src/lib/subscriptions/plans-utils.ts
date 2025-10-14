/**
 * Subscription Plans Utilities
 * Helper functions for working with subscription plans across different locales
 */

import { SUBSCRIPTION_PLANS_CONFIG, PLAN_LIMITS, type PlanType } from './plans';
import plansConfigEN from '@/config/subscription-plans.en.json';
import plansConfigES from '@/config/subscription-plans.es.json';

type LocalizedPlanConfig = typeof plansConfigEN;

/**
 * Get all plans with their limits for a specific locale
 * @param locale - Language locale ('en' or 'es')
 * @returns Array of plans with combined config and limits
 */
export function getLocalizedPlansWithLimits(locale: 'en' | 'es' = 'en') {
  const config = locale === 'es' ? plansConfigES : plansConfigEN;

  return [
    {
      key: 'basic' as PlanType,
      ...config.basic,
      limits: PLAN_LIMITS.basic,
    },
    {
      key: 'pro' as PlanType,
      ...config.pro,
      limits: PLAN_LIMITS.pro,
    },
    {
      key: 'pro_plus' as PlanType,
      ...config.pro_plus,
      limits: PLAN_LIMITS.pro_plus,
    },
  ];
}

/**
 * Get a specific plan configuration by type and locale
 * @param planType - Plan type identifier
 * @param locale - Language locale ('en' or 'es')
 * @returns Plan configuration with limits
 */
export function getLocalizedPlan(
  planType: PlanType,
  locale: 'en' | 'es' = 'en'
) {
  const config = locale === 'es' ? plansConfigES : plansConfigEN;

  return {
    key: planType,
    ...config[planType],
    limits: PLAN_LIMITS[planType],
  };
}

/**
 * Format price with currency symbol
 * @param price - Price amount
 * @param currency - Currency code (USD or ARS)
 * @returns Formatted price string
 */
export function formatPrice(
  price: number,
  currency: 'USD' | 'ARS' = 'USD'
): string {
  if (currency === 'ARS') {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(price);
}

/**
 * Convert USD to ARS (1 USD = 1300 ARS)
 */
export const USD_TO_ARS_RATE = 1300;

/**
 * Convert a USD price to ARS
 * @param usdPrice - Price in USD
 * @returns Price in ARS
 */
export function convertUsdToArs(usdPrice: number): number {
  return usdPrice * USD_TO_ARS_RATE;
}

/**
 * Convert an ARS price to USD
 * @param arsPrice - Price in ARS
 * @returns Price in USD
 */
export function convertArsToUsd(arsPrice: number): number {
  return Math.round(arsPrice / USD_TO_ARS_RATE);
}

/**
 * Get plan display name for UI
 * @param planType - Plan type
 * @param locale - Language locale
 * @returns Display name
 */
export function getPlanDisplayName(
  planType: PlanType,
  locale: 'en' | 'es' = 'en'
): string {
  const config = locale === 'es' ? plansConfigES : plansConfigEN;
  return config[planType].name;
}

/**
 * Get all plan types as array
 */
export const ALL_PLAN_TYPES: PlanType[] = ['basic', 'pro', 'pro_plus'];

/**
 * Check if a plan type is valid
 */
export function isValidPlanType(type: string): type is PlanType {
  return ALL_PLAN_TYPES.includes(type as PlanType);
}
