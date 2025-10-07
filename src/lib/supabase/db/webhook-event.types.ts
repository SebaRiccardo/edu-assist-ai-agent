import { Database } from "./types";

// Webhook Events
export type WebhookEvent =
  Database['public']['Tables']['webhook_events']['Row'];
export type InsertWebhookEvent =
  Database['public']['Tables']['webhook_events']['Insert'];
export type UpdateWebhookEvent =
  Database['public']['Tables']['webhook_events']['Update'];
