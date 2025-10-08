import useSupabaseBrowser from '@/lib/supabase/client';
import {
  useInsertMutation,
  useQuery,
  useUpdateMutation,
  useUpsertMutation,
} from '@supabase-cache-helpers/postgrest-react-query';
import {
  getAllCoursesForUserQuery,
  getAllCoursesQuery,
  getCourseByIdQuery,
} from './queries/courses';

export function useCourses(userId?: string) {
  const client = useSupabaseBrowser();

  return useQuery(
    userId
      ? getAllCoursesForUserQuery(client, userId)
      : getAllCoursesQuery(client)
  );
}

export function useCourse(id: string) {
  const client = useSupabaseBrowser();

  return useQuery(getCourseByIdQuery(client, id));
}

export function useCreateCourse() {
  const client = useSupabaseBrowser();

  return useInsertMutation(client.from('courses'), ['id'], null, {
    onSuccess: () => {
      console.log('Course created successfully');
    },
  });
}

export function useUpdateCourse() {
  const client = useSupabaseBrowser();

  return useUpdateMutation(client.from('courses'), ['id'], null, {
    onSuccess: () => {
      console.log('Course updated successfully');
    },
  });
}
