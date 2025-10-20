/**
 * Subscription Plans Configuration
 * Centralized plan definitions, limits, and feature access control
 */

import plansConfigEN from './config/subscription-plans.en.json';
import plansConfigES from './config/subscription-plans.es.json';
import subscriptionLimits from './config/subscription-limits.json';

/**
 * Convert USD to ARS (1 USD = 1300 ARS)
 */
export const USD_TO_ARS_RATE = 1500;

/**
 * Plan type definition
 */
export type PlanType = 'basic' | 'pro' | 'pro_plus';

/**
 * Get plans configuration based on locale
 * @param locale - Language locale ('en' or 'es')
 * @returns Plans configuration
 */
export function getPlansConfig(locale: 'en' | 'es' = 'es') {
  return locale === 'es' ? plansConfigES : plansConfigEN;
}

/**
 * Plan Definitions
 * Dynamically populated from JSON configuration files
 * Uses Spanish (ES) configuration by default for ARS pricing
 */
export const SUBSCRIPTION_PLANS_CONFIG = {
  BASIC: {
    type: 'basic' as PlanType,
    mp_id: process.env.MERCADOPAGO_BASIC_PLAN_ID || '',
    name: plansConfigES.basic.name,
    subtitle: plansConfigES.basic.subtitle,
    price: plansConfigES.basic.price,
    period: plansConfigES.basic.period,
    description: plansConfigES.basic.description,
    features: plansConfigES.basic.features,
    highlighted: plansConfigES.basic.highlighted,
    currency: plansConfigES.basic.currency,
    free_trial: {
      count: plansConfigES.basic.free_trial_count,
      interval: plansConfigES.basic.free_trial_interval,
    },
  },
  PRO: {
    type: 'pro' as PlanType,
    mp_id: process.env.MERCADOPAGO_PRO_PLAN_ID || '',
    name: plansConfigES.pro.name,
    subtitle: plansConfigES.pro.subtitle,
    price: plansConfigES.pro.price,
    period: plansConfigES.pro.period,
    description: plansConfigES.pro.description,
    features: plansConfigES.pro.features,
    highlighted: plansConfigES.pro.highlighted,
    currency: plansConfigES.pro.currency,
    free_trial: {
      count: plansConfigES.pro.free_trial_count,
      interval: plansConfigES.pro.free_trial_interval,
    },
  },
  PRO_PLUS: {
    type: 'pro_plus' as PlanType,
    mp_id: process.env.MERCADOPAGO_PRO_PLUS_PLAN_ID || '',
    name: plansConfigES.pro_plus.name,
    subtitle: plansConfigES.pro_plus.subtitle,
    price: plansConfigES.pro_plus.price,
    period: plansConfigES.pro_plus.period,
    description: plansConfigES.pro_plus.description,
    features: plansConfigES.pro_plus.features,
    highlighted: plansConfigES.pro_plus.highlighted,
    currency: plansConfigES.pro_plus.currency,
    free_trial: {
      count: plansConfigES.pro_plus.free_trial_count,
      interval: plansConfigES.pro_plus.free_trial_interval,
    },
  },
} as const;

/**
 * Feature access control
 * Defines which features are available for each plan
 * Based on subscription-plans.en.json configuration
 */
export const PLAN_FEATURES = {
  // Basic features (available in basic, pro, pro_plus)
  'smart-inbox-analysis': ['basic', 'pro', 'pro_plus'],
  'basic-email-organization': ['basic', 'pro', 'pro_plus'],
  'course-aware-filtering': ['basic', 'pro', 'pro_plus'],
  'ai-email-drafts': ['basic', 'pro', 'pro_plus'],
  'label-suggestions': ['basic', 'pro', 'pro_plus'],

  // Pro features (available in pro, pro_plus)
  'unlimited-courses': ['pro', 'pro_plus'],
  'auto-labeling': ['pro', 'pro_plus'],
  'auto-replies': ['pro', 'pro_plus'],
  'priority-sorting': ['pro', 'pro_plus'],
  'multiple-inboxes': ['pro', 'pro_plus'],

  // Pro+ features (available only in pro_plus)
  'realtime-replies': ['pro_plus'],
  'background-cleanup': ['pro_plus'],
  'smart-prioritization': ['pro_plus'],
  'continuous-organization': ['pro_plus'],
  'unlimited-ai-drafts': ['pro_plus'],
  'unlimited-emails': ['pro_plus'],
  'priority-support': ['pro_plus'],
  'autonomous-email-management': ['pro_plus'],
  'chat-with-inbox': ['pro_plus'],
} as const;

/**
 * Plan limits configuration
 * Single source of truth from subscription-limits.json
 * null values in JSON are converted to Infinity for unlimited features
 */
export const PLAN_LIMITS = {
  basic: {
    maxInboxes: subscriptionLimits.basic.maxInboxes,
    maxCourses: subscriptionLimits.basic.maxCourses ?? Infinity,
    aiEmailDraftPerDay: subscriptionLimits.basic.aiEmailDraftPerDay,
    emailsProcessedPerMonth: subscriptionLimits.basic.emailsProcessedPerMonth,
    autoReplies: subscriptionLimits.basic.autoReplies,
    prioritySupport: subscriptionLimits.basic.prioritySupport,
    autoLabels: subscriptionLimits.basic.autoLabels,
    realTimeReplies: subscriptionLimits.basic.realTimeReplies,
    autonomousEmailManagement:
      subscriptionLimits.basic.autonomousEmailManagement,
    chatWithInboxUsage: subscriptionLimits.basic.chatWithInboxUsage,
  },
  pro: {
    maxInboxes: subscriptionLimits.pro.maxInboxes,
    maxCourses: subscriptionLimits.pro.maxCourses ?? Infinity,
    aiEmailDraftPerDay: subscriptionLimits.pro.aiEmailDraftPerDay,
    emailsProcessedPerMonth: subscriptionLimits.pro.emailsProcessedPerMonth,
    autoReplies: subscriptionLimits.pro.autoReplies,
    autoLabels: subscriptionLimits.pro.autoLabels,
    prioritySupport: subscriptionLimits.pro.prioritySupport,
    realTimeReplies: subscriptionLimits.pro.realTimeReplies,
    autonomousEmailManagement: subscriptionLimits.pro.autonomousEmailManagement,
    chatWithInboxUsage: subscriptionLimits.pro_plus.chatWithInboxUsage,
  },
  pro_plus: {
    maxInboxes: subscriptionLimits.pro_plus.maxInboxes,
    maxCourses: subscriptionLimits.pro_plus.maxCourses ?? Infinity,
    aiEmailDraftPerDay:
      subscriptionLimits.pro_plus.aiEmailDraftPerDay ?? Infinity,
    emailsProcessedPerMonth:
      subscriptionLimits.pro_plus.emailsProcessedPerMonth ?? Infinity,
    autoReplies: subscriptionLimits.pro_plus.autoReplies,
    autoLabels: subscriptionLimits.pro_plus.autoLabels,
    prioritySupport: subscriptionLimits.pro_plus.prioritySupport,
    realTimeReplies: subscriptionLimits.pro_plus.realTimeReplies,
    autonomousEmailManagement:
      subscriptionLimits.pro_plus.autonomousEmailManagement,
    chatWithInboxUsage: subscriptionLimits.pro_plus.chatWithInboxUsage,
  },
} as const;

/**
 * Checks if user has access to a specific feature based on their plan
 * @param planType - User's plan type
 * @param feature - Feature to check
 * @returns Whether user has access
 */
export function hasFeatureAccess(
  planType: PlanType,
  feature: keyof typeof PLAN_FEATURES
): boolean {
  const allowedPlans = PLAN_FEATURES[feature] as readonly string[];
  return allowedPlans.includes(planType);
}

/**
 * Gets plan limits for a user
 * @param planType - User's plan type
 * @returns Plan limits
 */
export function getPlanLimits(planType: PlanType) {
  return PLAN_LIMITS[planType];
}

/**
 * Checks if a user has exceeded their plan limit
 * @param planType - User's plan type
 * @param limitType - Type of limit to check
 * @param currentUsage - Current usage amount
 * @returns Whether limit is exceeded
 */
export function isLimitExceeded(
  planType: PlanType,
  limitType: keyof typeof PLAN_LIMITS.basic,
  currentUsage: number
): boolean {
  const limits = PLAN_LIMITS[planType];
  const limit = limits[limitType];

  if (typeof limit === 'boolean' || limit === Infinity) {
    return false;
  }

  // Handle complex limit types (like chatWithInboxUsage)
  if (typeof limit === 'object' && limit !== null) {
    return false; // Complex limits need specific handling
  }

  return currentUsage >= (limit as number);
}

/**
 * Gets remaining usage for a specific limit
 * @param planType - User's plan type
 * @param limitType - Type of limit to check
 * @param currentUsage - Current usage amount
 * @returns Remaining usage or Infinity if unlimited
 */
export function getRemainingUsage(
  planType: PlanType,
  limitType: keyof typeof PLAN_LIMITS.basic,
  currentUsage: number
): number {
  const limits = PLAN_LIMITS[planType];
  const limit = limits[limitType];

  if (typeof limit === 'boolean' || limit === Infinity) {
    return Infinity;
  }

  // Handle complex limit types (like chatWithInboxUsage)
  if (typeof limit === 'object' && limit !== null) {
    return Infinity; // Complex limits need specific handling
  }

  return Math.max(0, (limit as number) - currentUsage);
}

/**
 * Formats subscription price for display
 * @param planType - Plan type
 * @param currencyId - Currency code (default: 'ARS')
 * @returns Formatted price string
 */
export function formatPlanPrice(
  planType: PlanType,
  currencyId: string = 'ARS'
): string {
  const price =
    SUBSCRIPTION_PLANS_CONFIG[
      planType.toUpperCase() as keyof typeof SUBSCRIPTION_PLANS_CONFIG
    ].price;

  // if (price === 0) {
  //   return '$0';
  // }

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currencyId,
    minimumFractionDigits: 0,
  }).format(price);
}

/**
 * Gets plan badge color for UI
 * @param planType - Plan type
 * @returns Tailwind color classes
 */
export function getPlanBadgeColor(planType: PlanType): string {
  const colors = {
    basic: 'bg-gray-100 text-gray-800 border-gray-300',
    pro: 'bg-primary/10 text-primary border-primary/30',
    pro_plus:
      'bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-700 border-purple-300',
  };

  return colors[planType];
}

/**
 * Gets plan details by type
 * @param planType - Plan type
 * @returns Plan configuration
 */
export function getPlanDetails(planType: PlanType) {
  const planMap = {
    basic: 'BASIC',
    pro: 'PRO',
    pro_plus: 'PRO_PLUS',
  } as const;

  return SUBSCRIPTION_PLANS_CONFIG[
    planMap[planType] as keyof typeof SUBSCRIPTION_PLANS_CONFIG
  ];
}

/**
 * Determines if a plan upgrade is needed for a feature
 * @param currentPlan - User's current plan
 * @param feature - Feature to access
 * @returns Required plan tier or null if user has access
 */
export function getRequiredPlanForFeature(
  currentPlan: PlanType,
  feature: keyof typeof PLAN_FEATURES
): PlanType | null {
  if (hasFeatureAccess(currentPlan, feature)) {
    return null;
  }

  const allowedPlans = PLAN_FEATURES[feature] as readonly string[];

  // Return the lowest tier that has access
  const planOrder: PlanType[] = ['basic', 'pro', 'pro_plus'];
  for (const plan of planOrder) {
    if (allowedPlans.includes(plan)) {
      return plan;
    }
  }

  return null;
}

/**
 * Gets upgrade message for a feature
 * @param feature - Feature name
 * @param requiredPlan - Required plan tier
 * @returns User-friendly upgrade message
 */
export function getUpgradeMessage(
  feature: string,
  requiredPlan: PlanType
): string {
  const planDetails = getPlanDetails(requiredPlan);
  return `Upgrade to ${planDetails.name} (${formatPlanPrice(requiredPlan)}/month) to unlock ${feature.replace(/-/g, ' ')}.`;
}

/**
 * Calculates percentage of limit used
 * @param planType - User's plan type
 * @param limitType - Type of limit to check
 * @param currentUsage - Current usage amount
 * @returns Percentage used (0-100) or null if unlimited
 */
export function getLimitUsagePercentage(
  planType: PlanType,
  limitType: keyof typeof PLAN_LIMITS.basic,
  currentUsage: number
): number | null {
  const limits = PLAN_LIMITS[planType];
  const limit = limits[limitType];

  if (typeof limit === 'boolean' || limit === Infinity) {
    return null;
  }

  // Handle complex limit types (like chatWithInboxUsage)
  if (typeof limit === 'object' && limit !== null) {
    return null; // Complex limits need specific handling
  }

  return Math.min(100, (currentUsage / (limit as number)) * 100);
}

/**
 * Checks if user is approaching their limit (>80%)
 * @param planType - User's plan type
 * @param limitType - Type of limit to check
 * @param currentUsage - Current usage amount
 * @returns Whether user is approaching limit
 */
export function isApproachingLimit(
  planType: PlanType,
  limitType: keyof typeof PLAN_LIMITS.basic,
  currentUsage: number
): boolean {
  const percentage = getLimitUsagePercentage(planType, limitType, currentUsage);
  return percentage !== null && percentage >= 80;
}

export type LocalizedPlanConfig = typeof plansConfigEN;

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
