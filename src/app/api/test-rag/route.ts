import { getAllCoursesForProfessorFullTextSearch } from '@/hooks/queries/courses';
import { runAllTests } from '@/lib/ai/embedding.test';
import { createClient } from '@/lib/server';
import { getCurrentUser } from '@/lib/supabase/server';

export async function GET() {
    // const supabase = await createClient();
    // const user = await getCurrentUser();

    const results = await runAllTests();
    // const coursesQuery = getAllCoursesForProfessorFullTextSearch(supabase, user?.id!, `'ALGEBRA'`);
    // const res = await coursesQuery;

    return Response.json(results);
}