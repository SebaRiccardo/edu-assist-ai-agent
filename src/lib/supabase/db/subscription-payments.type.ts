import { Database } from "./types"

// Subscription Payments
export type SubscriptionPayment = Database["public"]["Tables"]["subscription_payments"]["Row"]
export type InsertSubscriptionPayment = Database["public"]["Tables"]["subscription_payments"]["Insert"]
export type UpdateSubscriptionPayment = Database["public"]["Tables"]["subscription_payments"]["Update"]
