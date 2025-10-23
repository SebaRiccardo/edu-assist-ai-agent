'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { CourseDetailsHeader } from '@/components/course-details-header';
import { CourseFormDialog } from '@/components/course-form-dialog';
import { EmailListStates } from '@/components/email-list-states';
import { CategorizedEmail, InboxAnalysisResult, DomainCourse } from '@/types';
import { Loader2 } from 'lucide-react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useCourse, useUpdateCourse } from '@/hooks/use-courses';
import { useConnections } from '@/hooks/use-connections';
import { useEmailConnection } from '@/hooks/use-email-connection';
import { ConnectionStatusCard } from '@/components/connection-status-card';
import { NoAccountsEmptyState } from '@/components/no-accounts-empty-state';
import { InsertCourse } from '@/lib/supabase/types/courses.types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { sendEmailReply, analyzeInbox, labelEmails } from '@/actions';
import { toast } from 'sonner';
import { CourseInboxProvider, useCourseInbox } from '@/contexts/course-inbox-context';
import { Tag } from 'lucide-react';

export default function CourseDetailsPage() {
  return (
    <CourseInboxProvider>
      <CourseDetailsPageContent />
    </CourseInboxProvider>
  );
}

function CourseDetailsPageContent() {
  const router = useRouter();
  const params = useParams();
  const t = useTranslations('CourseDetails');
  const locale = useLocale() as 'es' | 'en';

  const courseId = params.id as string;
  const { user } = useCurrentUser();

  // Context state management
  const {
    setAccountEmails,
    setAccountAnalyzing,
    setAccountStats,
    setAccountPriorityStats,
    getAccountEmails,
    getAccountStats,
    getAccountPriorityStats,
    isAccountAnalyzing,
    setEmailReplying,
    isEmailReplying,
    setAccountLabeling,
    isAccountLabeling,
  } = useCourseInbox();

  // Data fetching hooks
  const { data: courseData, isLoading: isLoadingCourse, isError: isErrorCourse } = useCourse(courseId);
  const { data: connections, isLoading: isLoadingConnections } = useConnections();
  const { mutateAsync: updateCourse, isPending: isUpdatingCourse } = useUpdateCourse();

  // UI state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [emailProvider, setEmailProvider] = useState(undefined);
  const [maxEmails, setMaxEmails] = useState<number>(20);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');

  const emailConnection = useEmailConnection({
    emailProvider,
    onConnectionSuccess: () => {
      // Connection successful, data will auto-refresh
    },
  });

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
      startAt: courseData.start_at ? new Date(courseData.start_at!) : undefined,
      endAt: courseData.end_at ? new Date(courseData.end_at!) : undefined,
      createdAt: new Date(courseData.created_at),
      updatedAt: new Date(courseData.updated_at),
    }
    : null;

  // Set initial selected account when connections load
  React.useEffect(() => {
    if (!selectedAccountId && connections && connections.length > 0) {
      const activeConnection = connections.find(conn => conn.status === 'ACTIVE' && conn.email);
      if (activeConnection) {
        setSelectedAccountId(activeConnection.id);
      }
    }
  }, [connections, selectedAccountId]);  // Handlers

  const handleEditCourse = () => {
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
  };

  const handleSubmitCourseEdit = async (data: Omit<InsertCourse, 'professor_id' | 'created_at' | 'updated_at' | 'id'>) => {
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
      toast.error(t('selectAccountFirst'));
      return;
    }

    setAccountAnalyzing(connectedAccountId, true);

    const toastId = `analyze-${connectedAccountId}`;
    toast.loading(t('analyzingInbox'), { id: toastId });

    try {
      const result = await analyzeInbox({
        course: courseData,
        connectedAccountId,
        reasoningLanguage: locale === 'es' ? 'Spanish' : locale === 'en' ? 'English' : "Spanish",
        maxEmails: maxEmails,
        includeRead: false,
        verbose: true,
        withPriorityClassification: true
      });

      if (!result.success) {
        if (result.account?.status !== 'ACTIVE') {
          toast.error(t('accountNotActive'), {
            id: toastId,
          });
          return;
        }

        throw new Error(result.error || t('failedToAnalyze'));
      }

      if (result.data && result.data.emails && result.data.analysis) {
        // Store emails using context
        setAccountEmails(connectedAccountId, result.data.emails);

        // Store stats using context
        setAccountStats(connectedAccountId, {
          totalAnalyzed: result.data.totalAnalyzed,
          courseRelated: result.data.analysis.stats.totalCourseRelated,
        });

        // Store priority stats if available
        if (result.data.priorityAnalysis) {
          setAccountPriorityStats(connectedAccountId, result.data.priorityAnalysis);
        }

        toast.success(
          t('foundCourseEmails', {
            courseRelated: result.data.analysis.stats.totalCourseRelated,
            total: result.data.totalAnalyzed,
          }),
          {
            id: toastId,
          }
        );
      }
    } catch (error) {
      toast.error(t('errorAnalyzing'), { id: toastId });
    } finally {
      setAccountAnalyzing(connectedAccountId, false);
    }
  };

  const handleAutoReply = async (emailId: string, connectedAccountId: string) => {
    if (!domainCourse || !user) return;

    const accountEmails = getAccountEmails(connectedAccountId);
    const email = accountEmails.find(e => e.id === emailId);

    if (!email) {
      console.error(t('emailNotFound'), emailId);
      return;
    }

    setEmailReplying(emailId, true);
    toast.loading(t('sendingEmailReply'), { id: `reply-${emailId}` });

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
        professorName: user.user_metadata.first_name,
        language: locale === 'es' ? 'Spanish' : locale === 'en' ? 'English' : 'Spanish',
      });

      if (result.success) {
        toast.success(t('emailReplySent'), {
          id: `reply-${emailId}`,
          description: t('replyDescription', { email: email.from }),
        });
      } else {
        toast.error(t('failedToSendEmail'), {
          id: `reply-${emailId}`,
        });
      }
    } catch (error) {
      toast.error(t('errorSendingEmail'), {
        id: `reply-${emailId}`,
      });
    } finally {
      setEmailReplying(emailId, false);
    }
  };

  const handleAutoTagAll = async (accountId: string) => {
    if (!domainCourse || !user) return;

    // Get emails from context
    const accountEmails = getAccountEmails(accountId);

    if (!accountEmails || accountEmails.length === 0) {
      toast.error(t('noEmailsToLabel') || 'No emails to label. Please analyze inbox first.');
      return;
    }

    setAccountLabeling(accountId, true);

    const toastId = `label-${accountId}`;


    try {
      const result = await labelEmails({
        connectedAccountId: accountId,
        emails: accountEmails as any, // Already CategorizedEmailWithPriority from analysis
        courseName: domainCourse.name,
        reasoningLanguage: locale === 'es' ? 'Spanish' : locale === 'en' ? 'English' : 'Spanish',
        verbose: true,
        createLabelsIfMissing: true
      });

      if (!result.success) {
        if (result.account?.status !== 'ACTIVE') {
          toast.error(t('accountNotActive') || 'Account is not active', {
            id: toastId,
          });
          return;
        }

        throw new Error(result.error || t('failedToLabel') || 'Failed to label emails');
      }

      if (result.data) {
        toast.success(
          t('labelingComplete'),
          {
            id: toastId,
            description: result.data.summary,
            duration: 5000,
          }
        );
      }
    } catch (error) {
      console.error('Error labeling emails:', error);
      toast.error(t('errorLabeling') || 'Error applying labels to emails', {
        id: toastId,
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setAccountLabeling(accountId, false);
    }
  };

  // Redirect if course not found
  if (isErrorCourse) {
    router.push('/dashboard');
    return null;
  }

  if (isLoadingCourse || isLoadingConnections || !domainCourse) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeConnections = connections?.filter(conn => conn.status === 'ACTIVE' && conn.email) || [];
  const hasNoConnections = activeConnections.length === 0;

  return (
    <div className="flex flex-col">
      <div className="w-full space-y-6">
        {/* <CourseDetailsHeader course={domainCourse} isChecking={false} onAnalyze={() => { }} onEdit={handleEditCourse} /> */}

        {/* Auto-Label Navigation */}
        {/* {!hasNoConnections && (
          <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-lg p-4 border-none shadow-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Tag className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h3 className="font-semibold text-sm">Auto-Label Emails</h3>
                  <p className="text-xs text-muted-foreground">
                    Automatically categorize and apply Gmail labels to course emails
                  </p>
                </div>
              </div>
              <Button
                onClick={() => router.push(`/dashboard/courses/${courseId}/auto-label`)}
                variant="default"
                size="sm"
                className="gap-2"
              >
                <Tag className="h-4 w-4" />
                Open Auto-Labeling
              </Button>
            </div>
          </div>
        )} */}
        <ConnectionStatusCard status={emailConnection.connectionStatus} onCancel={emailConnection.cancelConnection} />
      </div>
      {hasNoConnections ? (
        <NoAccountsEmptyState
          selectedEmailProvider={emailProvider}
          onSelectEmailProvider={setEmailProvider}
          connectionStatus={emailConnection.connectionStatus}
          isDialogOpen={emailConnection.isDialogOpen}
          onOpenDialog={emailConnection.setIsDialogOpen}
          onConnect={emailConnection.initiateConnection}
          onCancel={emailConnection.cancelConnection}
          onRetry={emailConnection.retryConnection}
        />
      ) : (
        <Tabs value={selectedAccountId} onValueChange={setSelectedAccountId} className="gap-4">
          <TabsList className="w-full justify-between rounded-md rounded-b p-0 bg-transparent border-none">
            {activeConnections.map(account => (
              <TabsTrigger
                key={account.id}
                value={account.id}
                disabled={account.status !== 'ACTIVE'}
                className='max-w-[200px] data-[state=active]:bg-primary data-[state=active]:text-white'
              // className="px-4 rounded-md rounded-b-none data-[state=active]:border-primary dark:data-[state=active]:border-primary data-[state=active]:text-foreground text-muted-foreground dark:text-muted-foreground hover:text-foreground dark:hover:text-foreground hover:border-muted-foreground/30 h-full border-0 border-b-2 border-transparent data-[state=active]:shadow-none"
              >
                {/* <Mail className="h-4 w-4" /> */}
                <span className="hidden sm:inline text-sm">{account.email || account.id}</span>
                {account.status !== 'ACTIVE' && (
                  <Badge variant="destructive" className="ml-2">
                    {account.status}
                  </Badge>
                )}
                {isAccountAnalyzing(account.id) && !getAccountStats(account.id) && (
                  <Loader2 className="ml-1 h-4 w-4 animate-spin text-muted-foreground" />
                )}
                {getAccountStats(account.id) && (
                  <Badge variant="secondary" className="ml-1">
                    {getAccountStats(account.id)!.courseRelated} / {getAccountStats(account.id)!.totalAnalyzed}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
            {/* Max Emails Selector */}
            <div className="ml-auto">
              <Select value={maxEmails.toString()} onValueChange={value => setMaxEmails(Number(value))}>
                <SelectTrigger id="maxEmails" className="bg-white text-black w-[180px]">
                  <SelectValue placeholder={t('maxEmailsLabel')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">Ultimos 10 emails</SelectItem>
                  <SelectItem value="20">Ultimos 20 emails</SelectItem>
                  <SelectItem value="30">Ultimos 30 emails</SelectItem>
                  <SelectItem value="40">Ultimos 40 emails</SelectItem>
                  <SelectItem value="50">Ultimos 50 emails</SelectItem>
                  <SelectItem value="75">Ultimos 75 emails</SelectItem>
                  <SelectItem value="100">Ultimos 100 emails</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsList>

          {/* Content for each Gmail account */}
          {activeConnections.map(account => {
            const emails = getAccountEmails(account.id) || [];
            const stats = getAccountStats(account.id) || null;
            const isAnalyzing = isAccountAnalyzing(account.id);
            const isLabeling = isAccountLabeling(account.id);

            return (
              <TabsContent
                key={account.id}
                value={account.id}
                className="max-h-[calc(100vh-11.5rem)] min-h-[calc(100vh-11.5rem)] items-center justify-center rounded-md border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
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
                  isAutoTagging={isLabeling}
                  onAutoTagAll={() => handleAutoTagAll(account.id)}
                  onAnalyze={() => handleAnalyzeInbox(account.id)}
                  onAutoReply={emailId => handleAutoReply(emailId, account.id)}
                />
              </TabsContent>
            );
          })}
        </Tabs>
      )}
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
