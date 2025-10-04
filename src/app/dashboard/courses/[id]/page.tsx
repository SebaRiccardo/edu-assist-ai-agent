'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CourseDetailsHeader } from '@/components/course-details-header';
import { CourseInfoCards } from '@/components/course-info-cards';
import { AnalysisStatsBar } from '@/components/analysis-stats-bar';
import { EmailListStates } from '@/components/email-list-states';
import { CategorizedEmail, Course } from '@/types';
import { Loader2 } from 'lucide-react';

export default function CourseDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [emails, setEmails] = useState<CategorizedEmail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [stats, setStats] = useState<{
    totalAnalyzed: number;
    totalCategorized: number;
  } | null>(null);

  useEffect(() => {
    fetchCourse();
  }, [params.id]);

  const fetchCourse = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/courses');
      if (!response.ok) throw new Error('Failed to fetch courses');

      const data = await response.json();
      const foundCourse = data.courses.find((c: Course) => c.id === params.id);

      if (foundCourse) {
        setCourse(foundCourse);
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckEmails = async () => {
    if (!course) return;

    setIsChecking(true);
    try {
      const response = await fetch('/api/check-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: course.id,
          userId: course.professorId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to check emails');
      }

      const data = await response.json();
      setEmails(data.emails);
      setStats({
        totalAnalyzed: data.totalAnalyzed,
        totalCategorized: data.totalCategorized,
      });
    } catch (error) {
      console.error('Error checking emails:', error);
    } finally {
      setIsChecking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="mt-6 mx-auto max-w-5xl w-full px-6 space-y-6">
        <CourseDetailsHeader
          course={course}
          isChecking={isChecking}
          onAnalyze={handleCheckEmails}
        />

        <CourseInfoCards course={course} />

        {stats && <AnalysisStatsBar stats={stats} />}
      </div>

      <div className="flex-1 overflow-y-auto mt-6 mx-auto max-w-5xl w-full px-6 pb-8">
        <EmailListStates
          emails={emails}
          isChecking={isChecking}
          stats={stats}
          onAnalyze={handleCheckEmails}
        />
      </div>
    </div>
  );
}
