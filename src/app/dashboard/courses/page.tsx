'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CourseCard } from '@/components/course-card';
import { CourseFormDialog } from '@/components/course-form-dialog';
import { Loader2, Plus, BookOpen } from 'lucide-react';
import {
  useCourses,
  useCreateCourse,
  useUpdateCourse,
  useDeleteCourse,
} from '@/hooks/use-courses';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Course, InsertCourse } from '@/lib/supabase/types/courses.types';

export default function CoursesPage() {
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { user } = useCurrentUser();
  const { data: courses, isLoading } = useCourses(user?.id);
  const { mutateAsync: createCourse } = useCreateCourse();
  const { mutateAsync: updateCourse } = useUpdateCourse();
  const { mutateAsync: deleteCourse } = useDeleteCourse();

  const handleSubmitCourse = async (
    courseData: Omit<
      InsertCourse,
      'professor_id' | 'created_at' | 'updated_at' | 'id'
    >
  ) => {
    try {
      if (editingCourse) {
        // Update existing course
        await updateCourse({
          id: editingCourse.id,
          ...courseData,
        });
      } else {
        // Create new course
        await createCourse([
          {
            ...courseData,
            professor_id: user?.id!,
          },
        ]);
      }

      setIsFormOpen(false);
      setEditingCourse(null);
    } catch (error) {
      console.error('Error saving course:', error);
      throw error;
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this course? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      await deleteCourse({ id: courseId });
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  };

  const handleEdit = (course: Course) => {
    // Convert Course to DomainCourse format for editing
    setEditingCourse({
      id: course.id,
      name: course.name,
      year: course.year,
      description: course.description,
      context: course.context,
      professor_id: course.professor_id,
      student_count: course.student_count,
      start_at: course.start_at ? course.start_at : null,
      end_at: course.end_at ? course.end_at : null,
      created_at: course.created_at,
      updated_at: course.updated_at,
    });
    setIsFormOpen(true);
  };

  const handleOpenCreateForm = () => {
    setEditingCourse(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCourse(null);
  };

  return (
    <div className="flex flex-1 flex-col my-5">
      {/* Header */}
      <div className="mx-auto max-w-7xl w-full px-6 mb-6">
        <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-3xl p-8 border-none shadow-none">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-muted-foreground" />
              <div>
                <h1 className="text-2xl font-bold">Courses</h1>
                <p className="text-sm text-muted-foreground">
                  Manage your courses and check student emails
                </p>
              </div>
            </div>
            <Button onClick={handleOpenCreateForm} size="lg" className="gap-2">
              <Plus className="h-4 w-4" />
              Create Course
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 mx-auto max-w-7xl w-full px-6 pb-8">
        <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-3xl p-8 border-none shadow-none">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Empty State */}
          {!isLoading && courses?.length === 0 && (
            <div className="text-center py-20 bg-background/50 rounded-2xl border-none">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No courses yet</h2>
              <p className="text-muted-foreground mb-6">
                Create your first course to get started
              </p>
              <Button onClick={handleOpenCreateForm} size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Create Your First Course
              </Button>
            </div>
          )}

          {/* Course Grid */}
          {!isLoading && courses && courses?.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses?.map(course => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onEdit={handleEdit}
                  onDelete={handleDeleteCourse}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Course Form Dialog */}
      <CourseFormDialog
        open={isFormOpen}
        onOpenChange={handleCloseForm}
        course={editingCourse}
        onSubmit={handleSubmitCourse}
      />
    </div>
  );
}
