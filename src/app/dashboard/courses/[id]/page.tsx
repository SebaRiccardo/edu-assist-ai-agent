'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { EmailCard } from '@/components/email-card';
import { 
  Empty, 
  EmptyHeader, 
  EmptyTitle, 
  EmptyDescription, 
  EmptyContent, 
  EmptyMedia 
} from '@/components/ui/empty';
import { CategorizedEmail, Course } from '@/types';
import {
  ChevronRight,
  Loader2,
  Mail,
  Sparkles,
  Users,
  Clock,
  Home,
  CheckCircle,
  Inbox,
} from 'lucide-react';

export default function CourseDetailsPage() {
  const router = useRouter();
  const params = useParams()
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
    <div className="flex flex-1 flex-col bg-background">
      {/* Header with Breadcrumb */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-5xl mx-auto px-6 py-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </button>
            <ChevronRight className="h-4 w-4" />
            <button
              onClick={() => router.push('/dashboard')}
              className="hover:text-foreground transition-colors"
            >
              Courses
            </button>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">{course.title}</span>
          </div>

          {/* Title and Action */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
                {course.title}
              </h1>
              <p className="text-sm text-muted-foreground mb-6">
                {course.description}
              </p>
              
              {/* Course Info Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-foreground">{course.studentCount}</div>
                    <div className="text-xs text-muted-foreground">Students</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-chart-1/10">
                    <Mail className="h-5 w-5 text-chart-1" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-foreground">{course.unreadEmailCount}</div>
                    <div className="text-xs text-muted-foreground">Unread</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-chart-2/10">
                    <Clock className="h-5 w-5 text-chart-2" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">
                      {new Date(course.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Created</div>
                  </div>
                </div>
              </div>
            </div>
            
            <Button
              onClick={handleCheckEmails}
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
          
          {/* Analysis Stats Bar */}
          {stats && (
            <div className="flex items-center gap-6 text-sm p-4 bg-muted/30 rounded-lg border border-border">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-muted-foreground">Analyzed:</span>
                <span className="font-semibold text-foreground">{stats.totalAnalyzed}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-chart-2" />
                <span className="text-muted-foreground">Course Related:</span>
                <span className="font-semibold text-foreground">{stats.totalCategorized}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-muted-foreground">Analysis Complete</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content Area - Centered Email Cards */}
      <div className="flex-1 overflow-y-auto bg-muted/20">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Initial Empty State - No Analysis Yet */}
          {emails.length === 0 && !isChecking && !stats && (
            <Empty className="min-h-[60vh] border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Inbox className="h-6 w-6" />
                </EmptyMedia>
                <EmptyTitle>No emails analyzed yet</EmptyTitle>
                <EmptyDescription>
                  Click the "Analyze Inbox" button to scan your inbox for course-related messages using AI
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button
                  onClick={handleCheckEmails}
                  size="lg"
                  className="gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Analyze Inbox
                </Button>
              </EmptyContent>
            </Empty>
          )}

          {/* Empty State - No Results After Analysis */}
          {emails.length === 0 && !isChecking && stats && stats.totalCategorized === 0 && (
            <Empty className="min-h-[60vh] border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </EmptyMedia>
                <EmptyTitle>Inbox is clean!</EmptyTitle>
                <EmptyDescription>
                  Analyzed {stats.totalAnalyzed} emails, but none are related to this course
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}

          {/* Email Cards - Compact Grid Layout */}
          {emails.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  Unread Course Emails ({emails.length})
                </h2>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {emails.map((email) => (
                  <EmailCard
                    key={email.id}
                    email={email}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
