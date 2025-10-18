'use client';

import { useState } from 'react';
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { DomainCourse } from '@/types';
import {
  Loader2,
  Sparkles,
  Clock,
  Home,
  Users,
  Pencil,
  ChevronDown,
} from 'lucide-react';
import { Badge } from './ui/badge';

interface CourseDetailsHeaderProps {
  course: DomainCourse;
  isChecking: boolean;
  onAnalyze: () => void;
  onEdit?: () => void;
}

export function CourseDetailsHeader({
  course,
  isChecking,
  onAnalyze,
  onEdit,
}: CourseDetailsHeaderProps) {
  const router = useRouter();
  const [isContextOpen, setIsContextOpen] = useState(false);

  return (
    <div className="mt-3 w-full ">
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-3xl p-8 border-none shadow-none">
        {/* Breadcrumb and Created Date */}
        <div className="flex items-center justify-between mb-2 ">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="flex items-center gap-1"
                  >
                    <Home className="h-4 w-4 mr-2" />
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
                <BreadcrumbPage>{course.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Created Date and Edit Button */}
          <div className="flex items-center gap-3">
            {onEdit && (
              <Button
                onClick={onEdit}
                variant="ghost"
                size="sm"
                className="gap-2 shadow-none"
              >
                <Pencil className="h-4 w-4" />
                Edit Course
              </Button>
            )}
          </div>
        </div>

        {/* Title and Action - Horizontal Layout */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 gap-4">
            {/* <div className="flex items-center gap-2 text-sm text-muted-foreground my-2">
              <span>
                Created {new Date(course.createdAt).toLocaleDateString()}
              </span>
            </div> */}
            <div className="flex items-center justify-between gap-4 ">
              <div className="flex flex-row gap-2 items-center mb-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  {course.name}
                </h1>
                <Badge>{course.year}</Badge>
              </div>
              {/* Analyze Button */}
              {/* <Button
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
              </Button> */}
            </div>
            <p className="text-sm text-pretty max-w-sm lg:max-w-5xl truncate text-muted-foreground ">
              {course.description}
            </p>

            {course.studentCount > 0 && (
              <div className="flex items-center gap-2 pt-4 text-muted-foreground">
                <Badge variant="info">
                  {course.studentCount}{' '}
                  {course.studentCount === 1 ? 'student' : 'students'}
                </Badge>
              </div>
            )}

            {/* Course Context Collapsible */}
            {course.context && (
              <Collapsible
                open={isContextOpen}
                onOpenChange={setIsContextOpen}
                className="mt-4"
              >
                <CollapsibleTrigger asChild>
                  <Button variant="link" size="sm" className=" p-0">
                    <span className="text-sm font-normal">
                      {isContextOpen ? 'Hide' : 'Read'} course context
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-300 ${
                        isContextOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="collapsible-content">
                  <div className="mt-3 p-4 rounded-lg bg-muted/50 border border-none">
                    <p className="text-base text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {course.context}
                    </p>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 *     <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                Created {new Date(course.createdAt).toLocaleDateString()}
              </span>
            </div>
 */
