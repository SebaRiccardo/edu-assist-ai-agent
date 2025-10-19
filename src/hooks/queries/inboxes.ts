import { TypedSupabaseClient } from '@/lib/supabase/types/client.types';

/**
 * Query to get all inboxes for a specific course
 */
export function getInboxesByCourseIdQuery(client: TypedSupabaseClient, courseId: string) {
  return client.from('inboxes').select('*').eq('course_id', courseId).order('created_at', { ascending: false });
}

/**
 * Query to get a single inbox by ID
 */
export function getInboxByIdQuery(client: TypedSupabaseClient, inboxId: string) {
  return client.from('inboxes').select('*').eq('id', inboxId).single();
}

/**
 * Query to get inbox by course ID and email
 */
export function getInboxByCourseAndEmailQuery(client: TypedSupabaseClient, courseId: string, email: string) {
  return client.from('inboxes').select('*').eq('course_id', courseId).eq('email', email).maybeSingle();
}

/**
 * Query to get all inboxes (admin use)
 */
export function getAllInboxesQuery(client: TypedSupabaseClient) {
  return client.from('inboxes').select('*').order('created_at', { ascending: false });
}
