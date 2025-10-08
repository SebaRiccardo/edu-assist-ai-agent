import { Database } from './database.types';
// Subscription Plans
export type SubscriptionPlan =
  Database['public']['Tables']['subscription_plans']['Row'];
export type InsertSubscriptionPlan =
  Database['public']['Tables']['subscription_plans']['Insert'];
export type UpdateSubscriptionPlan =
  Database['public']['Tables']['subscription_plans']['Update'];
