import { TypedSupabaseClient } from '@/lib/supabase/types/client.types';

/**
 * Query builder for fetching all courses
 */
export function getAllCoursesQuery(client: TypedSupabaseClient) {
  return client.from('courses').select(`*`).order('updated_at', { ascending: false });
}

/**
 * Query builder for fetching all courses for a specific professor
 */
export function getAllCoursesForProfessorQuery(client: TypedSupabaseClient, professorId: string) {
  return client.from('courses').select(`*`).eq('professor_id', professorId).order('updated_at', { ascending: false });
}

/**
 * Query builder for fetching a single course by ID
 */
export function getCourseByIdQuery(client: TypedSupabaseClient, courseId: string) {
  return client.from('courses').select(`*`).eq('id', courseId).single();
}

/**
 * Query builder for fetching courses count for a professor
 */
export function getCoursesCountQuery(client: TypedSupabaseClient, professorId?: string) {
  const query = client.from('courses').select('id', { count: 'exact', head: true });

  if (professorId) {
    return query.eq('professor_id', professorId);
  }

  return query;
}
