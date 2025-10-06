'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Course } from '@/types';
import { Loader2, Sparkles, Clock, Home, Users } from 'lucide-react';

interface CourseDetailsHeaderProps {
  course: Course;
  isChecking: boolean;
  onAnalyze: () => void;
}

export function CourseDetailsHeader({
  course,
  isChecking,
  onAnalyze,
}: CourseDetailsHeaderProps) {
  const router = useRouter();

  return (
    <div className="mt-6 w-full ">
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-3xl p-8 border-none shadow-none">
        {/* Breadcrumb and Created Date */}
        <div className="flex items-center justify-between mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="flex items-center gap-1"
                  >
                    <Home className="h-4 w-4" />
                    <span>Dashboard</span>
                  </button>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <button onClick={() => router.push('/dashboard/courses')}>
                    Courses
                  </button>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{course.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Created Date */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              Created {new Date(course.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Title and Action - Horizontal Layout */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
                {course.title}
              </h1>
              {/* Analyze Button */}
              <Button
                onClick={onAnalyze}
                disabled={isChecking}
                size="lg"
                className="gap-2 flex-shrink-0"
              >
                {isChecking ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Analyze Inbox
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {course.description}
            </p>
            {course.studentCount > 0 && (
              <div className="flex items-center gap-2 pt-2 text-muted-foreground">
              <Users className="text-sm" size={15} />
              <span className="flex gap-1">
                {course.studentCount}
                {course.studentCount === 1 ? 'student' : 'students'}
              </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
