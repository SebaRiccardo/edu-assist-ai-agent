/**
 * InboxProfs AI - Subscription Plans Configuration
 * Centralized plan definitions, limits, and feature access control
 */

/**
 * InboxProfs AI Plan Definitions
 * These match the plans shown on the landing page
 */
export const INBOX_PROFS_PLANS = {
  FREE: {
    name: 'Basic',
    subtitle: 'Just Getting Started',
    price: 8,
    period: 'per month',
    description:
      'Smart labeling for one inbox and up to 2 courses. See how much time you save.',
    features: [
      'Smart labeling for 1 inbox',
      'Up to 2 courses',
      'Basic email organization',
      'Course-aware filtering',
    ],
    highlighted: false,
  },
  BASIC: {
    name: 'Pro',
    subtitle: 'Stay on Top of It',
    price: 15,
    period: 'per month',
    description: 'Unlimited courses, faster labeling, and advanced sorting.',
    features: [
      'Unlimited courses',
      'Advanced smart labeling',
      'Priority sorting',
      'Faster processing',
      'Email analytics',
      'Custom label rules',
    ],
    highlighted: true,
  },
  PRO: {
    name: 'Pro +',
    subtitle: 'Full Autopilot',
    price: 25,
    period: 'per month',
    description:
      'Your inbox runs itself — background cleanup, auto-replies, and smart prioritization.',
    features: [
      'Everything in Pro',
      'Auto-replies (AI-powered)',
      'Background cleanup',
      'Smart prioritization',
      'Continuous organization',
      'Custom response templates',
      'Advanced analytics',
    ],
    highlighted: false,
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
 * Defines usage limits for each plan tier
 */
export const PLAN_LIMITS = {
  basic: {
    maxInboxes: 1,
    maxCourses: 2,
    aiQueriesPerDay: 20,
    emailsProcessedPerMonth: 200,
    storageGB: 1,
    autoReplies: false,
    prioritySupport: false,
  },
  pro: {
    maxInboxes: 3,
    maxCourses: Infinity,
    aiQueriesPerDay: 500,
    emailsProcessedPerMonth: 10000,
    storageGB: 10,
    autoReplies: false,
    prioritySupport: false,
  },
  pro_plus: {
    maxInboxes: Infinity,
    maxCourses: Infinity,
    aiQueriesPerDay: Infinity,
    emailsProcessedPerMonth: Infinity,
    storageGB: 100,
    autoReplies: true,
    prioritySupport: true,
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
    INBOX_PROFS_PLANS[planType.toUpperCase() as keyof typeof INBOX_PROFS_PLANS]
      .price;

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
  return INBOX_PROFS_PLANS[
    planType.toUpperCase() as keyof typeof INBOX_PROFS_PLANS
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
