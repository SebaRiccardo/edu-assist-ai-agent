import { TypedSupabaseClient } from '@/lib/supabase/types/client.types';

export function getAllCoursesQuery(client: TypedSupabaseClient) {
  return client
    .from('courses')
    .select(`*`)
    .order('updated_at', { ascending: false });
}

export function getAllCoursesForUserQuery(
  client: TypedSupabaseClient,
  userId: string
) {
  return client
    .from('courses')
    .select(`*`)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
}

export function getCourseByIdQuery(
  client: TypedSupabaseClient,
  courseId: string
) {
  return client
    .from('courses')
    .select(`*`)
    .eq('id', courseId)
    .order('updated_at', { ascending: false });
}
