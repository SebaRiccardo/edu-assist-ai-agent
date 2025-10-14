'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CourseDetailsHeader } from '@/components/course-details-header';
import { CourseFormDialog } from '@/components/course-form-dialog';
import { EmailListStates } from '@/components/email-list-states';
import { CategorizedEmail, InboxAnalysisResult, DomainCourse } from '@/types';
import { Loader2 } from 'lucide-react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useCourse, useUpdateCourse } from '@/hooks/use-courses';
import { useConnections } from '@/hooks/use-connections';
import { useGmailConnection } from '@/hooks/use-gmail-connection';
import { ConnectionStatusCard } from '@/components/connection-status-card';
import { NoAccountsEmptyState } from '@/components/no-accounts-empty-state';
import { InsertCourse } from '@/lib/supabase/types/courses.types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { sendEmailReply, analyzeInbox } from '@/actions';
import { toast } from 'sonner';

export default function CourseDetailsPage() {
  const router = useRouter();
  const params = useParams();

  const courseId = params.id as string;
  const { user } = useCurrentUser();

  // Data fetching hooks
  const {
    data: courseData,
    isLoading: isLoadingCourse,
    isError: isErrorCourse,
  } = useCourse(courseId);
  const { data: gmailConnections, isLoading: isLoadingConnections } =
    useConnections();
  const { mutateAsync: updateCourse, isPending: isUpdatingCourse } =
    useUpdateCourse();

  // Edit course dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Gmail connection logic
  const gmailConnection = useGmailConnection({
    courseId,
    onConnectionSuccess: () => {
      // Connection successful, data will auto-refresh
    },
  });

  // Track selected tab (Gmail account)
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');

  // Set default tab when connections load
  React.useEffect(() => {
    if (!selectedAccountId && gmailConnections && gmailConnections.length > 0) {
      const activeConnection = gmailConnections.find(
        conn => conn.status === 'ACTIVE' && conn.email
      );
      if (activeConnection) {
        setSelectedAccountId(activeConnection.id);
      }
    }
  }, [gmailConnections, selectedAccountId]);

  // Transform Supabase data to DomainCourse type
  const domainCourse: DomainCourse | null = courseData
    ? {
        id: courseData.id,
        name: courseData.name,
        year: courseData.year ?? '',
        description: courseData.description,
        context: courseData.context,
        professorId: courseData.professor_id,
        studentCount: courseData.student_count,
        startAt: courseData.start_at
          ? new Date(courseData.start_at!)
          : undefined,
        endAt: courseData.end_at ? new Date(courseData.end_at!) : undefined,
        createdAt: new Date(courseData.created_at),
        updatedAt: new Date(courseData.updated_at),
      }
    : null;

  // Email state per account - using a map to store emails for each account
  const [emailsByAccount, setEmailsByAccount] = useState<
    Record<string, CategorizedEmail[]>
  >({});
  const [checkingAccounts, setCheckingAccounts] = useState<Set<string>>(
    new Set()
  );
  const [replyingEmails, setReplyingEmails] = useState<Set<string>>(new Set());

  const [authError, setAuthError] = useState<string | null>(null);

  const [statsByAccount, setStatsByAccount] = useState<
    Record<
      string,
      {
        totalAnalyzed: number;
        courseRelated: number;
      }
    >
  >({});

  // Set initial selected account when connections load
  React.useEffect(() => {
    if (gmailConnections && gmailConnections.length > 0 && !selectedAccountId) {
      setSelectedAccountId(gmailConnections[0].id);
    }
  }, [gmailConnections, selectedAccountId]);

  // Handlers
  const handleEditCourse = () => {
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
  };

  const handleSubmitCourseEdit = async (
    data: Omit<
      InsertCourse,
      'professor_id' | 'created_at' | 'updated_at' | 'id'
    >
  ) => {
    try {
      if (!courseData) {
        console.error('No course data available');
        return;
      }

      const result = await updateCourse({
        id: courseData.id,
        name: data.name,
        description: data.description,
        context: data.context,
        year: data.year,
        student_count: data.student_count ?? 0,
      });

      console.log('Update result:', result);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating course:', error);

      // Don't re-throw to prevent double error handling
    }
  };

  const handleAnalyzeInbox = async (connectedAccountId: string) => {
    if (!domainCourse || !user || !courseData) return;

    if (!connectedAccountId) {
      setAuthError('Please select a Gmail account first');
      toast.error('Please select a Gmail account first');
      return;
    }

    setCheckingAccounts(prev => new Set(prev).add(connectedAccountId));
    setAuthError(null);

    const toastId = `analyze-${connectedAccountId}`;
    toast.loading('Analyzing inbox...', { id: toastId });

    try {
      const result = await analyzeInbox({
        courseId: domainCourse.id,
        course: courseData,
        connectedAccountId,
        reasoningLanguage: 'spanish',
        maxEmails: 3,
        includeRead: false,
        verbose: true,
      });

      if (!result.success) {
        if (result.error === 'unauthorized') {
          setAuthError('Gmail connection required');
          toast.error('Gmail connection required', { id: toastId });
          return;
        }

        if (result.error === 'Connected Account is not active') {
          setAuthError('Gmail account is not active. Please reconnect.');
          toast.error('Gmail account is not active. Please reconnect.', {
            id: toastId,
          });
          return;
        }

        throw new Error(result.error || 'Failed to analyze emails');
      }

      if (result.data && result.data.emails && result.data.analysis) {
        // Store emails for this specific account
        setEmailsByAccount(prev => ({
          ...prev,
          [connectedAccountId]: result.data!.emails,
        }));

        // Store stats for this specific account
        setStatsByAccount(prev => ({
          ...prev,
          [connectedAccountId]: {
            totalAnalyzed: result.data!.totalAnalyzed,
            courseRelated: result.data!.analysis.stats.totalCourseRelated,
          },
        }));

        toast.success(
          `Found ${result.data.analysis.stats.totalCourseRelated} course-related emails out of ${result.data.totalAnalyzed} analyzed`,
          { id: toastId }
        );
      }
    } catch (error) {
      console.error('Error checking emails:', error);
      const errorMessage =
        'Ocurrió un error al analizar los correos. Por favor, inténtalo de nuevo.';
      setAuthError(errorMessage);
      toast.error(errorMessage, { id: toastId });
    } finally {
      setCheckingAccounts(prev => {
        const next = new Set(prev);
        next.delete(connectedAccountId);
        return next;
      });
    }
  };

  const handleAutoReply = async (
    emailId: string,
    connectedAccountId: string
  ) => {
    if (!domainCourse || !user) return;

    const accountEmails = emailsByAccount[connectedAccountId] || [];
    const email = accountEmails.find(e => e.id === emailId);

    if (!email) {
      console.error('Email not found:', emailId);
      return;
    }

    setReplyingEmails(prev => new Set(prev).add(emailId));
    toast.loading('Sending email reply...', { id: `reply-${emailId}` });

    try {
      const result = await sendEmailReply({
        connectedAccountId,
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
        courseName: domainCourse.name,
        professorName: 'Professor',
        language: 'Neutral Spanish',
      });

      if (result.success) {
        toast.success('Email reply sent successfully!', {
          id: `reply-${emailId}`,
          description: `Your reply has been sent to: ${email.from} `,
        });
      } else {
        toast.error(`Failed to send email: ${result.error}`, {
          id: `reply-${emailId}`,
        });
      }
    } catch (error) {
      console.error('Error in auto-reply:', error);
      toast.error('An error occurred while sending the email', {
        id: `reply-${emailId}`,
      });
    } finally {
      setReplyingEmails(prev => {
        const next = new Set(prev);
        next.delete(emailId);
        return next;
      });
    }
  };

  // Redirect if course not found
  if (isErrorCourse) {
    router.push('/dashboard');
    return null;
  }

  if (isLoadingCourse || isLoadingConnections || !domainCourse) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const activeConnections =
    gmailConnections?.filter(conn => conn.status === 'ACTIVE' && conn.email) ||
    [];

  const hasNoConnections = activeConnections.length === 0;

  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto max-w-7xl w-full px-6 space-y-6">
        <CourseDetailsHeader
          course={domainCourse}
          isChecking={false}
          onAnalyze={() => {}}
          onEdit={handleEditCourse}
        />

        <ConnectionStatusCard
          status={gmailConnection.connectionStatus}
          onCancel={gmailConnection.cancelConnection}
        />
      </div>

      {/* Main Content Area */}
      {hasNoConnections ? (
        <NoAccountsEmptyState
          connectionStatus={gmailConnection.connectionStatus}
          isDialogOpen={gmailConnection.isDialogOpen}
          onOpenDialog={gmailConnection.setIsDialogOpen}
          onConnect={gmailConnection.initiateConnection}
          onCancel={gmailConnection.cancelConnection}
          onRetry={gmailConnection.retryConnection}
        />
      ) : (
        <div className="flex-1 overflow-hidden mx-auto max-w-7xl w-full px-6 pt-6">
          <Tabs
            value={selectedAccountId}
            onValueChange={setSelectedAccountId}
            className="gap-0"
          >
            {/* Gmail Account Tabs */}
            <TabsList className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-lg rounded-b-none border-b p-0">
              {activeConnections.map(account => (
                <TabsTrigger
                  key={account.id}
                  value={account.id}
                  disabled={account.status !== 'ACTIVE'}
                  className="px-4 rounded-md rounded-b-none data-[state=active]:border-primary dark:data-[state=active]:border-primary data-[state=active]:text-foreground text-muted-foreground dark:text-muted-foreground hover:text-foreground dark:hover:text-foreground hover:border-muted-foreground/30 h-full border-0 border-b-2 border-transparent data-[state=active]:shadow-none"
                >
                  {/* <Mail className="h-4 w-4" /> */}
                  <span className="hidden sm:inline text-[13px]">
                    {account.email}
                  </span>
                  {account.status !== 'ACTIVE' && (
                    <Badge variant="destructive" className="ml-2">
                      {account.status}
                    </Badge>
                  )}
                  {checkingAccounts.has(account.id) &&
                    !statsByAccount[account.id] && (
                      <Loader2 className="ml-1 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  {statsByAccount[account.id] && (
                    <Badge variant="secondary" className="ml-1">
                      {statsByAccount[account.id].courseRelated} /{' '}
                      {statsByAccount[account.id].totalAnalyzed}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Content for each Gmail account */}
            {activeConnections.map(account => {
              const emails = emailsByAccount[account.id] || [];
              const stats = statsByAccount[account.id] || null;
              const isAnalyzing = checkingAccounts.has(account.id);

              return (
                <TabsContent
                  key={account.id}
                  value={account.id}
                  className="rounded-3xl rounded-tl-none bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
                >
                  <EmailListStates
                    selectedAccountId={selectedAccountId}
                    emails={emails}
                    isChecking={isAnalyzing}
                    stats={stats}
                    courseName={domainCourse.name}
                    userId={user?.id}
                    isSendingReply={false}
                    replyingToEmailId={null}
                    onAnalyze={() => handleAnalyzeInbox(account.id)}
                    onAutoReply={emailId =>
                      handleAutoReply(emailId, account.id)
                    }
                  />
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      )}

      {/* Edit Course Dialog */}
      <CourseFormDialog
        open={isEditDialogOpen}
        onOpenChange={handleCloseEditDialog}
        course={courseData}
        onSubmit={handleSubmitCourseEdit}
        isLoading={isUpdatingCourse}
      />
    </div>
  );
}
