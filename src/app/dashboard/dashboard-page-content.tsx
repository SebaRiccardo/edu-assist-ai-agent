'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty';
import { CourseFormDialog } from '@/components/course-form-dialog';
import { Loader2, Plus, BookOpen, Users, Mail, ChevronRight, Sparkles, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCurrentUser, useUserDisplayName } from '@/hooks/use-current-user';
import { useCourses, useCreateCourse, useUpdateCourse } from '@/hooks/use-courses';
import { Course, InsertCourse } from '@/lib/supabase/types/courses.types';
import { User } from '@supabase/supabase-js';
import { useTranslations } from 'next-intl';

export default function DashboardPageContent({ serverSideUser }: { serverSideUser: User | null }) {
  const t = useTranslations('Dashboard');
  const router = useRouter();
  const { user, loading: userLoading } = useCurrentUser(serverSideUser);
  const displayName = useUserDisplayName(serverSideUser);

  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: courses, isLoading } = useCourses(user?.id);
  const { mutateAsync: createCourse, isPending: isCreatingCourse } = useCreateCourse();
  const { mutateAsync: updateCourse, isPending: isUpdatingCourse } = useUpdateCourse();
  const handleCreateCourse = async (courseData: Omit<InsertCourse, 'professor_id' | 'created_at' | 'updated_at' | 'id'>) => {
    try {
      await createCourse([
        {
          professor_id: user?.id!,
          ...courseData,
        },
      ]);

      setIsFormOpen(false);
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  };

  const handleUpdateCourse = async (courseData: Omit<InsertCourse, 'professor_id' | 'created_at' | 'updated_at' | 'id'>) => {
    if (!editingCourse) return;

    await updateCourse({
      id: editingCourse.id,
      ...courseData,
    });

    try {
      setIsFormOpen(false);
      setEditingCourse(null);
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  };

  const handleEdit = (course: Course) => {
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
              <h1 className="text-4xl font-bold tracking-tight mb-2">{userLoading ? t('loading') : t('welcomeBack', { name: displayName })}</h1>
              <p className="text-muted-foreground text-lg">{t('takeLook')}</p>
            </div>
            <Button onClick={handleOpenCreateForm} size="lg" variant="outline" className="border-none shadow-lg gap-2">
              <Plus className="h-4 w-4" />
              {t('newCourse')}
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            {isLoading ? (
              // Loading Skeletons
              <>
                <Card className="p-4 shadow-none border-none">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-9 w-16" />
                    </div>
                    <Skeleton className="h-12 w-12 rounded-full" />
                  </div>
                </Card>
                <Card className="p-4 shadow-none border-none">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-9 w-16" />
                    </div>
                    <Skeleton className="h-12 w-12 rounded-full" />
                  </div>
                </Card>
                <Card className="p-4 shadow-none border-none">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-9 w-16" />
                    </div>
                    <Skeleton className="h-12 w-12 rounded-full" />
                  </div>
                </Card>
              </>
            ) : (
              // Actual Stats
              <>
                <Card className="p-4 shadow-none border-none">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{t('totalCourses')}</p>
                      <p className="text-3xl font-bold">{courses?.length || 0}</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </Card>

                <Card className="p-4 shadow-none border-none">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{t('totalStudents')}</p>
                      <p className="text-3xl font-bold">{courses?.reduce((sum, c) => sum + c.student_count, 0)}</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-chart-2/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-chart-2" />
                    </div>
                  </div>
                </Card>

                <Card className="p-4 shadow-none border-none">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{t('unreadEmails')}</p>
                      <p className="text-3xl font-bold">0</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-chart-1/10 flex items-center justify-center">
                      <Mail className="h-6 w-6 text-chart-1" />
                    </div>
                  </div>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 rounded-3xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {/* Loading State */}
        {isLoading && (
          <div className="space-y-8">
            {/* Skeleton for Courses Section Header */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-7 w-32" />
                <Skeleton className="h-9 w-24" />
              </div>

              {/* Skeleton for Course Cards */}
              <div className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="p-5">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </div>

                      {/* Content */}
                      <div>
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full mb-1" />
                        <Skeleton className="h-4 w-5/6" />
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 pt-3 border-t">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-4 w-16 ml-auto" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (!courses || courses.length === 0) && (
          <Empty className="border-2">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BookOpen className="h-6 w-6" />
              </EmptyMedia>
              <EmptyTitle>{t('noCourses')}</EmptyTitle>
              <EmptyDescription>{t('createFirstCourse')}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={handleOpenCreateForm} size="lg">
                <Plus className="mr-2 h-5 w-5" />
                {t('createYourFirstCourse')}
              </Button>
            </EmptyContent>
          </Empty>
        )}

        {/* Courses Section */}
        {!isLoading && courses && courses?.length > 0 && (
          <div className="space-y-8 ">
            {/* Courses Horizontal Scroll */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{t('yourCourses')}</h2>
                <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/courses')}>
                  {t('seeMore')}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>

              <div className="pb-4 -mx-2 px-2">
                <div className="grid grid-cols-4 gap-4 grid-gr">
                  {courses.map(course => (
                    <Card
                      key={course.id}
                      className="flex-shrink-0 p-5 hover:shadow-lg transition-all cursor-pointer group"
                      onClick={() => router.push(`/dashboard/courses/${course.id}`)}
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
                            // onClick={e => {
                            //   e.stopPropagation();
                            //   handleEdit(course);
                            // }}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Content */}
                        <div>
                          <h3 className="font-semibold text-lg mb-1">{course.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{course.description}</p>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 pt-3 border-t">
                          <div className="flex items-center gap-1.5">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{course.student_count}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{course.year}</span>
                          </div>
                          <div className="flex items-center gap-1.5 ml-auto">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <span className="text-xs text-muted-foreground">{t('aiReady')}</span>
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
        isLoading={isCreatingCourse}
        onSubmit={editingCourse ? handleUpdateCourse : handleCreateCourse}
      />
    </div>
  );
}
