import { Database } from './database.types';

// Inbox
export type Inboxes = Database['public']['Tables']['inboxes']['Row'];
export type InsertInboxes = Database['public']['Tables']['inboxes']['Insert'];
export type UpdateInboxes = Database['public']['Tables']['inboxes']['Update'];
