'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { DomainCourse } from '@/types';
import { Loader2, Sparkles, Clock, Home, Users, Pencil, ChevronDown } from 'lucide-react';
import { Badge } from './ui/badge';

interface CourseDetailsHeaderProps {
  course: DomainCourse;
  isChecking: boolean;
  onAnalyze: () => void;
  onEdit?: () => void;
}

export function CourseDetailsHeader({ course, isChecking, onAnalyze, onEdit }: CourseDetailsHeaderProps) {
  const router = useRouter();
  const t = useTranslations('CourseDetails');
  const [isContextOpen, setIsContextOpen] = useState(false);

  return (
    <div className="w-full">
      <div>
        <Breadcrumb className="mb-2"  >
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <button onClick={() => router.push('/dashboard')} className="flex items-center gap-1">
                  <Home className="h-4 w-4 mr-2" />
                  <span>{t('dashboard')}</span>
                </button>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <button onClick={() => router.push('/dashboard/courses')}>{t('courses')}</button>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{course.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        {/* Title and Action - Horizontal Layout */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 gap-4">
            {/* <div className="flex items-center gap-2 text-sm text-muted-foreground my-2">
              <span>
                Created {new Date(course.createdAt).toLocaleDateString()}
              </span>
            </div> */}
            {/* <div className="flex items-start justify-between gap-4 ">
              <div className="flex flex-row gap-2 items-center mb-2">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">{course.name}</h1>
                <Badge>{course.year}</Badge>
                {course.studentCount > 0 && (
                  <Badge variant="info">{t('students', { count: course.studentCount })}</Badge>
                )}
              </div>
              <div className="flex items-center gap-3">
                {onEdit && (
                  <Button onClick={onEdit} variant="ghost" size="sm" className="gap-2 text-primary shadow-none">
                    <Pencil className="h-4 w-4" />
                    {t('editCourse')}
                  </Button>
                )}
              </div>
            </div>
            <p className="text-sm text-pretty max-w-sm lg:max-w-5xl truncate text-muted-foreground ">{course.description}</p> */}


            {/* Course Context Collapsible */}
            {course.context && (
              <Collapsible open={isContextOpen} onOpenChange={setIsContextOpen} className="mb-4">
                <CollapsibleTrigger asChild>
                  <Button variant="link" size="sm" className="has-[>svg]:px-0 font-semibold ">
                    <span className="text-sm font-normal">{isContextOpen ? t('hideContext') : t('readContext')}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isContextOpen ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="collapsible-content">
                  <div className="mt-3 p-4 rounded-lg bg-muted/50 border border-none">
                    <p className="text-base text-gray-800 whitespace-pre-wrap leading-relaxed">{course.context}</p>
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
