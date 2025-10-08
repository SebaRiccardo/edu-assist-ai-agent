'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CourseFormDialog } from '@/components/course-form-dialog';
import { DomainCourse } from '@/types';
import {
  Loader2,
  Plus,
  BookOpen,
  Users,
  Mail,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCurrentUser, useUserDisplayName } from '@/hooks/use-current-user';
import { useCourses, useCreateCourse } from '@/hooks/use-courses';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useCurrentUser();
  const displayName = useUserDisplayName();

  const [editingCourse, setEditingCourse] = useState<DomainCourse | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: courses, isLoading } = useCourses(user?.id);
  const { mutateAsync: createCourse } = useCreateCourse();

  const handleCreateCourse = async (courseData: {
    name: string;
    description: string;
    context: string;
    studentCount: number;
  }) => {
    const { name, description, context } = courseData;
    try {
      await createCourse([
        {
          name,
          description,
          context,
          professor_id: user?.id!,
          year: '2025',
        },
      ]);

      setIsFormOpen(false);
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  };

  const handleUpdateCourse = async (courseData: {
    name: string;
    description: string;
    context: string;
    studentCount: number;
  }) => {
    if (!editingCourse) return;

    try {
      setIsFormOpen(false);
      setEditingCourse(null);
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  };

  const handleEdit = (course: DomainCourse) => {
    setEditingCourse(course);
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
    <div className="max-w-7xl mx-auto flex flex-1 flex-col gap-4">
      {/* Hero Header */}
      <div className="rounded-3xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-8 py-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">
                {userLoading
                  ? 'Loading...'
                  : `Welcome back, ${displayName}! 👋`}
              </h1>
              <p className="text-muted-foreground text-lg">
                Take a look at your courses and emails
              </p>
            </div>
            <Button
              onClick={handleOpenCreateForm}
              size="lg"
              variant="outline"
              className="border-none shadow-lg gap-2"
            >
              <Plus className="h-4 w-4" />
              New Course
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4 shadow-none border-none">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Total Courses
                  </p>
                  <p className="text-3xl font-bold">{courses?.length}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
              </div>
            </Card>

            <Card className="p-4 shadow-none border-none">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Total Students
                  </p>
                  <p className="text-3xl font-bold">
                    {courses?.reduce((sum, c) => sum + c.student_count, 0)}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-chart-2/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-chart-2" />
                </div>
              </div>
            </Card>

            <Card className="p-4 shadow-none border-none">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Unread Emails
                  </p>
                  <p className="text-3xl font-bold"></p>
                </div>
                <div className="h-12 w-12 rounded-full bg-chart-1/10 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-chart-1" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 rounded-3xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !courses && (
          <div className="text-center py-20 border-2 border-dashed rounded-lg bg-card">
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

        {/* Courses Section */}
        {!isLoading && courses && courses?.length > 0 && (
          <div className="space-y-8">
            {/* Important Actions */}
            {/* <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  Important Actions (
                  {courses?.filter(c => c.unreadEmailCount > 0).length})
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {courses
                  .filter(c => c.unreadEmailCount > 0)
                  .slice(0, 2)
                  .map(course => (
                    <Card
                      key={course.id}
                      className="p-4 hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-destructive"
                      onClick={() =>
                        router.push(`/dashboard/courses/${course.id}`)
                      }
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Mail className="h-4 w-4 text-destructive" />
                            <h3 className="font-semibold">{course.title}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {course.unreadEmailCount} unread emails
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date().toLocaleDateString()}
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </Card>
                  ))}
              </div>
            </section> */}

            {/* Courses Horizontal Scroll */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Your Courses</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/dashboard/courses')}
                >
                  See More
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>

              <div className="pb-4 -mx-2 px-2">
                <div className="grid grid-cols-4 gap-4 grid-gr">
                  {courses.map(course => (
                    <Card
                      key={course.id}
                      className="flex-shrink-0 p-5 hover:shadow-lg transition-all cursor-pointer group"
                      onClick={() =>
                        router.push(`/dashboard/courses/${course.id}`)
                      }
                    >
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <BookOpen className="h-6 w-6 text-primary" />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 rounded-full group-hover:opacity-100 transition-opacity"
                            onClick={e => {
                              e.stopPropagation();
                              handleEdit(course);
                            }}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Content */}
                        <div>
                          <h3 className="font-semibold text-lg mb-1">
                            {course.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {course.description}
                          </p>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 pt-3 border-t">
                          <div className="flex items-center gap-1.5">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {course.studentCount}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {course.unreadEmailCount}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 ml-auto">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <span className="text-xs text-muted-foreground">
                              AI Ready
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Course Form Dialog */}
      <CourseFormDialog
        open={isFormOpen}
        onOpenChange={handleCloseForm}
        course={editingCourse}
        onSubmit={editingCourse ? handleUpdateCourse : handleCreateCourse}
      />
    </div>
  );
}
