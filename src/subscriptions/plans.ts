/**
 * Subscription Plans Configuration
 * Centralized plan definitions, limits, and feature access control
 */

import plansConfigEN from './config/subscription-plans.en.json';
import plansConfigES from './config/subscription-plans.es.json';

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
 * Plan type definition
 */
export type PlanType = 'basic' | 'pro' | 'pro_plus';

/**
 * Feature access control
 * Defines which features are available for each plan
 */
export const PLAN_FEATURES = {
  'unlimited-courses': ['pro', 'pro_plus'],
  'advanced-labeling': ['pro', 'pro_plus'],
  'priority-sorting': ['pro', 'pro_plus'],
  'email-analytics': ['pro', 'pro_plus'],
  'custom-label-rules': ['pro', 'pro_plus'],
  'auto-replies': ['pro_plus'],
  'background-cleanup': ['pro_plus'],
  'smart-prioritization': ['pro_plus'],
  'custom-templates': ['pro_plus'],
  'advanced-analytics': ['pro_plus'],
  'continuous-organization': ['pro_plus'],
} as const;

/**
 * Plan limits configuration
 * Dynamically populated from JSON configuration files
 * null values in JSON are converted to Infinity for unlimited features
 */
export const PLAN_LIMITS = {
  basic: {
    maxInboxes: plansConfigES.basic.limits.maxInboxes,
    maxCourses: plansConfigES.basic.limits.maxCourses ?? Infinity,
    aiEmailDraftPerDay: plansConfigES.basic.limits.aiEmailDraftPerDay,
    emailsProcessedPerMonth: plansConfigES.basic.limits.emailsProcessedPerMonth,
    autoReplies: plansConfigES.basic.limits.autoReplies,
    prioritySupport: plansConfigES.basic.limits.prioritySupport,
    autoLabels: plansConfigES.basic.limits.autoLabels,
    autonomusEmailManagement:
      plansConfigES.basic.limits.autonomousEmailManagement,
  },
  pro: {
    maxInboxes: plansConfigES.pro.limits.maxInboxes,
    maxCourses: plansConfigES.pro.limits.maxCourses ?? Infinity,
    aiEmailDraftPerDay: plansConfigES.pro.limits.aiEmailDraftPerDay,
    emailsProcessedPerMonth: plansConfigES.pro.limits.emailsProcessedPerMonth,
    autoReplies: plansConfigES.pro.limits.autoReplies,
    autoLabels: plansConfigES.pro.limits.autoLabels,
    prioritySupport: plansConfigES.pro.limits.prioritySupport,
    autonomusEmailManagement:
      plansConfigES.pro.limits.autonomousEmailManagement,
  },
  pro_plus: {
    maxInboxes: plansConfigES.pro_plus.limits.maxInboxes,
    maxCourses: plansConfigES.pro_plus.limits.maxCourses ?? Infinity,
    aiEmailDraftPerDay:
      plansConfigES.pro_plus.limits.aiEmailDraftPerDay ?? Infinity,
    emailsProcessedPerMonth:
      plansConfigES.pro_plus.limits.emailsProcessedPerMonth ?? Infinity,
    autoReplies: plansConfigES.pro_plus.limits.autoReplies,
    autoLabels: plansConfigES.pro_plus.limits.autoLabels,
    prioritySupport: plansConfigES.pro_plus.limits.prioritySupport,
    autonomusEmailManagement:
      plansConfigES.pro_plus.limits.autonomousEmailManagement,
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

  return currentUsage >= limit;
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

  return Math.max(0, limit - currentUsage);
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

  return Math.min(100, (currentUsage / limit) * 100);
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
