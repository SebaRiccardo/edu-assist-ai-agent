import { Database } from './database.types';
// User Subscriptions
export type UserSubscription = Database['public']['Tables']['user_subscriptions']['Row'];
export type InsertUserSubscription = Database['public']['Tables']['user_subscriptions']['Insert'];
export type UpdateUserSubscription = Database['public']['Tables']['user_subscriptions']['Update'];
