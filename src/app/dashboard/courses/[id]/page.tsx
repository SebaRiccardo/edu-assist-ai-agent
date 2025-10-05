'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CourseDetailsHeader } from '@/components/course-details-header';
import { CourseInfoCards } from '@/components/course-info-cards';
import { AnalysisStatsBar } from '@/components/analysis-stats-bar';
import { EmailListStates } from '@/components/email-list-states';
import { CategorizedEmail, Course, InboxAnalysisResult } from '@/types';
import { Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CourseDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [emails, setEmails] = useState<CategorizedEmail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [gmailAuthRequired, setGmailAuthRequired] = useState(false);
  const [gmailAuthUrl, setGmailAuthUrl] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    totalAnalyzed: number;
    courseRelated: number;
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
          userId: course.professorId,
          reasoningLanguage: "spanish"
        }),
      });

      const res: { success: boolean, data?: InboxAnalysisResult, authRequired?: boolean, error?: string } = await response.json();

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
      setAuthError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsChecking(false);
    }
  };

  const handleGmailAuth = async () => {
    if (!course) return;

    try {
      const response = await fetch('/api/gmail-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: course.professorId,
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
          const response = await fetch(`/api/gmail-auth?userId=${course?.professorId}`);
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
      <div className="mx-auto max-w-5xl w-full px-6 space-y-6">
        <CourseDetailsHeader
          course={course}
          isChecking={isChecking}
          onAnalyze={handleCheckEmails}
        />

        <CourseInfoCards course={course} />

        {/* Gmail Authentication Required Card */}
        {gmailAuthRequired && (
          <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-900/50">
                  <Mail className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">Gmail Connection Required</CardTitle>
                  <CardDescription className="text-amber-700 dark:text-amber-300">
                    {authError || 'Connect your Gmail account to analyze emails'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  To analyze emails for this course, you need to connect your Gmail account.
                  This will allow the AI assistant to securely access and categorize your emails.
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
