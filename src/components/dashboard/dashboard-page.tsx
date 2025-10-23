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
  const tCommon = useTranslations('Common');
  const router = useRouter();
  const { user } = useCurrentUser(serverSideUser);

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
    <div className="flex flex-col gap-4">
      <h3 className='text-2xl font-bold'>
        {t('title')}
      </h3>
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
      <div className="">
        {/* Loading State */}
        {isLoading && (
          <div className="space-y-8">
            {/* Skeleton for Courses Section Header */}
            <div>


              {/* Skeleton for Course Cards */}
              <div className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="p-5">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <Skeleton className="h-8 w-24 rounded-full" />
                      </div>

                      {/* Content */}
                      <div>
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full mb-1" />

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
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-lg text-muted-foreground font-medium">{t('yourCourses')}</h2>
                <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/courses')}>
                  {t('seeMore')}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {courses.map(course => (
                  <Card
                    key={course.id}
                    className="flex-shrink-0 p-5 hover:shadow-xl duration-150 transition-all cursor-pointer group"
                    onClick={() => router.push(`/dashboard/courses/${course.id}`)}
                  >
                    <div className="space-y-4">
                      {/* Content */}
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-lg mb-1">{course.name}</h3>
                          <Button
                            size='sm'
                            className="rounded-full h-7 hover:shadow-xl transition-all duration-200 ease-in-out cursor-pointer pointer-events-auto"
                            onClick={e => {
                              e.stopPropagation();
                              handleEdit(course);
                            }}
                          >
                            {tCommon('edit')}
                          </Button>
                        </div>
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
            </section>
          </div>
        )}
      </div>
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
