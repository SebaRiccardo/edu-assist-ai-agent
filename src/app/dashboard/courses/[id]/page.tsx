'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CourseDetailsHeader } from '@/components/course-details-header';
import { CourseInfoCards } from '@/components/course-info-cards';
import { AnalysisStatsBar } from '@/components/analysis-stats-bar';
import { EmailListStates } from '@/components/email-list-states';
import { CategorizedEmail, InboxAnalysisResult, DomainCourse } from '@/types';
import { Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useCourse } from '@/hooks/use-courses';
import { Course } from '@/lib/supabase/types/courses.types';

export default function CourseDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useCurrentUser();
  const courseId = params.id as string;

  // Use TanStack Query hook to fetch course
  const { data: courseData, isLoading, error } = useCourse(courseId);

  // Transform Supabase data to DomainCourse type
  const course: DomainCourse | null = courseData
    ? {
        id: (courseData as Course).id,
        name: (courseData as Course).name,
        title: (courseData as Course).title,
        year: (courseData as Course).year,
        description: (courseData as Course).description,
        context: (courseData as Course).context,
        inboxes: (courseData as Course).inboxes as any, // JSON type from Supabase
        professorId: (courseData as Course).professor_id,
        studentCount: (courseData as Course).student_count,
        startAt: (courseData as Course).start_at
          ? new Date((courseData as Course).start_at!)
          : undefined,
        endAt: (courseData as Course).end_at
          ? new Date((courseData as Course).end_at!)
          : undefined,
        createdAt: new Date((courseData as Course).created_at),
        updatedAt: new Date((courseData as Course).updated_at),
      }
    : null;

  const [emails, setEmails] = useState<CategorizedEmail[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [replyingToEmailId, setReplyingToEmailId] = useState<string | null>(
    null
  );
  const [gmailAuthRequired, setGmailAuthRequired] = useState(false);
  const [gmailAuthUrl, setGmailAuthUrl] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    totalAnalyzed: number;
    courseRelated: number;
  } | null>(null);

  // Redirect if course not found after loading
  if (!isLoading && !course && !error) {
    router.push('/dashboard');
    return null;
  }

  const handleCheckEmails = async () => {
    if (!course) return;

    setIsChecking(true);
    setGmailAuthRequired(false);
    setAuthError(null);

    try {
      const response = await fetch('/api/inbox/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: course.id,
          userId: user?.id || course.professorId,
          reasoningLanguage: 'spanish',
        }),
      });

      const res: {
        success: boolean;
        data?: InboxAnalysisResult;
        authRequired?: boolean;
        error?: string;
      } = await response.json();

      // Handle Gmail authentication required
      if (response.status === 401 && res.authRequired) {
        setGmailAuthRequired(true);
        setAuthError(res.error || 'Gmail connection required');

        // Fetch the Gmail auth URL
        await handleGmailAuth();
        return;
      }

      if (!response.ok) {
        throw new Error(res.error || 'Failed to check emails');
      }

      if (res.success && res.data) {
        setEmails(res.data.emails);
        setStats({
          totalAnalyzed: res.data.totalAnalyzed,
          courseRelated: res.data.analysis.stats.courseRelated,
        });
      }
    } catch (error) {
      console.error('Error checking emails:', error);
      setAuthError(
        error instanceof Error ? error.message : 'An error occurred'
      );
    } finally {
      setIsChecking(false);
    }
  };

  const handleGmailAuth = async () => {
    if (!course || !user) return;

    try {
      const response = await fetch('/api/gmail-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (data.redirectUrl) {
        setGmailAuthUrl(data.redirectUrl);
      } else if (data.isConnected) {
        // Already connected, retry checking emails
        setGmailAuthRequired(false);
        await handleCheckEmails();
      }
    } catch (error) {
      console.error('Error initiating Gmail auth:', error);
      setAuthError('Failed to initiate Gmail authentication');
    }
  };

  const handleConnectGmail = () => {
    if (gmailAuthUrl) {
      window.open(gmailAuthUrl, '_blank', 'width=600,height=700');

      // Optional: Poll for connection status
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`/api/gmail-auth?userId=${user?.id}`);
          const data = await response.json();

          if (data.isConnected) {
            clearInterval(pollInterval);
            setGmailAuthRequired(false);
            setGmailAuthUrl(null);
            setAuthError(null);
            // Automatically retry checking emails
            await handleCheckEmails();
          }
        } catch (error) {
          console.error('Error checking connection status:', error);
        }
      }, 3000); // Check every 3 seconds

      // Stop polling after 2 minutes
      setTimeout(() => clearInterval(pollInterval), 120000);
    }
  };

  const handleAutoReply = async (emailId: string) => {
    if (!course || !user) return;

    const email = emails.find(e => e.id === emailId);
    if (!email) {
      console.error('Email not found:', emailId);
      return;
    }

    setIsSendingReply(true);
    setReplyingToEmailId(emailId);

    try {
      console.log('🤖 Starting auto-reply workflow for:', email.subject);

      const response = await fetch('/api/email/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          email: {
            id: email.id,
            from: email.from,
            subject: email.subject,
            body: email.body,
            category: email.category,
            reasoning: email.reasoning,
            threadId: email.threadId,
          },
          priority: {
            priority: 'medium',
            responseDeadline: 'Within 24 hours',
            reasoning: 'Auto-reply requested by professor',
          },
          courseName: course.name,
          professorName: 'Professor',
          language: 'Neutral Spanish',
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Email sent successfully:', result.data.sent);
        alert('Email reply sent successfully!');
      } else {
        console.error('❌ Failed to send email:', result.error);
        alert(`Failed to send email: ${result.error}`);
      }
    } catch (error) {
      console.error('Error in auto-reply:', error);
      alert('An error occurred while sending the email');
    } finally {
      setIsSendingReply(false);
      setReplyingToEmailId(null);
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
    <div className="flex flex-1 flex-col h-screen overflow-hidden">
      <div className="mx-auto max-w-7xl w-full px-6 pb-6 space-y-6">
        <CourseDetailsHeader
          course={course}
          isChecking={isChecking}
          onAnalyze={handleCheckEmails}
        />

        {/* <CourseInfoCards course={course} /> */}

        {/* Gmail Authentication Required Card */}
        {gmailAuthRequired && (
          <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-900/50">
                  <Mail className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">
                    Gmail Connection Required
                  </CardTitle>
                  <CardDescription className="text-amber-700 dark:text-amber-300">
                    {authError ||
                      'Connect your Gmail account to analyze emails'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  To analyze emails for this course, you need to connect your
                  Gmail account. This will allow the AI assistant to securely
                  access and categorize your emails.
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={handleConnectGmail}
                    disabled={!gmailAuthUrl}
                    className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800"
                  >
                    {gmailAuthUrl ? (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Connect Gmail Account
                      </>
                    ) : (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    )}
                  </Button>
                  {gmailAuthUrl && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setGmailAuthRequired(false);
                        setGmailAuthUrl(null);
                        setAuthError(null);
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  💡 A new window will open for you to authorize the connection.
                  After authorization, this page will automatically refresh.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* {stats && <AnalysisStatsBar stats={stats} />} */}
      </div>

      {/* Email List - Full Height Layout */}
      <div className="flex-1 overflow-hidden mx-auto max-w-7xl w-full px-6 pb-6">
        <EmailListStates
          emails={emails}
          isChecking={isChecking}
          stats={stats}
          courseName={course.name}
          userId={user?.id}
          isSendingReply={isSendingReply}
          replyingToEmailId={replyingToEmailId}
          onAnalyze={handleCheckEmails}
          onAutoReply={handleAutoReply}
        />
      </div>
    </div>
  );
}
