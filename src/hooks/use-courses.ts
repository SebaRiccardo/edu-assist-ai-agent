'use client';

import useSupabaseBrowser from '@/lib/supabase/client';
import {
  useInsertMutation,
  useQuery,
  useUpdateMutation,
  useDeleteMutation,
  UseQuerySingleReturn,
} from '@supabase-cache-helpers/postgrest-react-query';
import {
  getAllCoursesForProfessorQuery,
  getAllCoursesQuery,
  getCourseByIdQuery,
  getCoursesCountQuery,
} from './queries/courses';
import { Course } from '@/lib/supabase/types/courses.types';

/**
 * Hook to fetch all courses or courses for a specific professor
 */
export function useCourses(professorId?: string) {
  const client = useSupabaseBrowser();

  return useQuery(
    professorId
      ? getAllCoursesForProfessorQuery(client, professorId)
      : getAllCoursesQuery(client)
  );
}

/**
 * Hook to fetch a single course by ID
 */
export function useCourse(
  courseId: string | undefined
): UseQuerySingleReturn<Course> {
  const client = useSupabaseBrowser();

  return useQuery(
    courseId ? getCourseByIdQuery(client, courseId) : (null as any),
    {
      enabled: !!courseId,
    }
  );
}

/**
 * Hook to fetch courses count
 */
export function useCoursesCount(professorId?: string) {
  const client = useSupabaseBrowser();

  return useQuery(getCoursesCountQuery(client, professorId), {
    select: (data: any) => data.count,
  });
}

/**
 * Hook to create a new course
 */
export function useCreateCourse() {
  const client = useSupabaseBrowser();

  return useInsertMutation(client.from('courses'), ['id'], null, {
    onSuccess: () => {
      console.log('Course created successfully');
    },
  });
}

/**
 * Hook to update a course
 */
export function useUpdateCourse() {
  const client = useSupabaseBrowser();

  return useUpdateMutation(client.from('courses'), ['id'], null, {
    onSuccess: () => {
      console.log('Course updated successfully');
    },
  });
}

/**
 * Hook to delete a course
 */
export function useDeleteCourse() {
  const client = useSupabaseBrowser();

  return useDeleteMutation(client.from('courses'), ['id'], null, {
    onSuccess: () => {
      console.log('Course deleted successfully');
    },
  });
}
