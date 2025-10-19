'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { sendEmailReply, analyzeInbox } from '@/actions';
import { toast } from 'sonner';

export default function CourseDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const t = useTranslations('CourseDetails');

  const courseId = params.id as string;
  const { user } = useCurrentUser();

  // Data fetching hooks
  const { data: courseData, isLoading: isLoadingCourse, isError: isErrorCourse } = useCourse(courseId);
  const { data: connections, isLoading: isLoadingConnections } = useConnections();
  const { mutateAsync: updateCourse, isPending: isUpdatingCourse } = useUpdateCourse();

  // Edit course dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [emailProvider, setEmailProvider] = useState(undefined);
  const [maxEmails, setMaxEmails] = useState<number>(20);

  const emailConnection = useEmailConnection({
    emailProvider,
    onConnectionSuccess: () => {
      // Connection successful, data will auto-refresh
    },
  });

  const [selectedAccountId, setSelectedAccountId] = useState<string>('');

  // Set default tab when connections load
  React.useEffect(() => {
    if (!selectedAccountId && connections && connections.length > 0) {
      const activeConnection = connections.find(conn => conn.status === 'ACTIVE' && conn.email);
      if (activeConnection) {
        setSelectedAccountId(activeConnection.id);
      }
    }
  }, [connections, selectedAccountId]);

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

  // Email state per account - using a map to store emails for each account
  const [emailsByAccount, setEmailsByAccount] = useState<Record<string, CategorizedEmail[]>>({});
  const [checkingAccounts, setCheckingAccounts] = useState<Set<string>>(new Set());
  const [replyingEmails, setReplyingEmails] = useState<Set<string>>(new Set());

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
    if (connections && connections.length > 0 && !selectedAccountId) {
      setSelectedAccountId(connections[0].id);
    }
  }, [connections, selectedAccountId]);

  // Handlers
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

    setCheckingAccounts(prev => new Set(prev).add(connectedAccountId));

    const toastId = `analyze-${connectedAccountId}`;
    toast.loading(t('analyzingInbox'), { id: toastId });

    try {
      const result = await analyzeInbox({
        course: courseData,
        connectedAccountId,
        reasoningLanguage: 'spanish',
        maxEmails: maxEmails,
        includeRead: false,
        verbose: true,
      });

      if (!result.success) {
        if (result.account.status !== 'ACTIVE') {
          toast.error(t('accountNotActive'), {
            id: toastId,
          });
          return;
        }

        throw new Error(result.error || t('failedToAnalyze'));
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
      setCheckingAccounts(prev => {
        const next = new Set(prev);
        next.delete(connectedAccountId);
        return next;
      });
    }
  };

  const handleAutoReply = async (emailId: string, connectedAccountId: string) => {
    if (!domainCourse || !user) return;

    const accountEmails = emailsByAccount[connectedAccountId] || [];
    const email = accountEmails.find(e => e.id === emailId);

    if (!email) {
      console.error(t('emailNotFound'), emailId);
      return;
    }

    setReplyingEmails(prev => new Set(prev).add(emailId));
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
        professorName: 'Professor',
        language: 'Neutral Spanish',
      });

      if (result.success) {
        toast.success(t('emailReplySent'), {
          id: `reply-${emailId}`,
          description: t('replyDescription', { email: email.from }),
        });
      } else {
        toast.error(t('failedToSendEmail', { error: result.error }), {
          id: `reply-${emailId}`,
        });
      }
    } catch (error) {
      console.error('Error in auto-reply:', error);
      toast.error(t('errorSendingEmail'), {
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

  const handleAutoTagAll = async (accountId: string) => {
    toast.info(t('autoTaggingEmails'));
    // Implement auto-tagging logic here
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

  const activeConnections = connections?.filter(conn => conn.status === 'ACTIVE' && conn.email) || [];

  const hasNoConnections = activeConnections.length === 0;

  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto max-w-7xl w-full px-6 space-y-6">
        <CourseDetailsHeader course={domainCourse} isChecking={false} onAnalyze={() => { }} onEdit={handleEditCourse} />
        <ConnectionStatusCard status={emailConnection.connectionStatus} onCancel={emailConnection.cancelConnection} />
      </div>

      {/* Main Content Area */}
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
        <div className="flex-1 overflow-hidden mx-auto max-w-7xl w-full px-6 pt-6">
          <Tabs value={selectedAccountId} onValueChange={setSelectedAccountId} className="gap-0">
            {/* Gmail Account Tabs */}
            <TabsList className=" justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-lg rounded-b-none border-b p-0">
              {activeConnections.map(account => (
                <TabsTrigger
                  key={account.id}
                  value={account.id}
                  disabled={account.status !== 'ACTIVE'}
                  className="px-4 rounded-md rounded-b-none data-[state=active]:border-primary dark:data-[state=active]:border-primary data-[state=active]:text-foreground text-muted-foreground dark:text-muted-foreground hover:text-foreground dark:hover:text-foreground hover:border-muted-foreground/30 h-full border-0 border-b-2 border-transparent data-[state=active]:shadow-none"
                >
                  {/* <Mail className="h-4 w-4" /> */}
                  <span className="hidden sm:inline text-[13px]">{account.email || account.id}</span>
                  {account.status !== 'ACTIVE' && (
                    <Badge variant="destructive" className="ml-2">
                      {account.status}
                    </Badge>
                  )}
                  {checkingAccounts.has(account.id) && !statsByAccount[account.id] && (
                    <Loader2 className="ml-1 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                  {statsByAccount[account.id] && (
                    <Badge variant="secondary" className="ml-1">
                      {statsByAccount[account.id].courseRelated} / {statsByAccount[account.id].totalAnalyzed}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
              {/* Max Emails Selector */}
              <div className="ml-10">
                {/* <Label htmlFor="maxEmails" className="text-sm font-medium">
                  {t('maxEmailsLabel')}:
                </Label> */}
                <Select value={maxEmails.toString()} onValueChange={value => setMaxEmails(Number(value))}>
                  <SelectTrigger id="maxEmails" className="bg-white shadow-none border-none text-black w-[180px]">
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
                    onAutoTagAll={() => handleAutoTagAll(account.id)}
                    onAnalyze={() => handleAnalyzeInbox(account.id)}
                    onAutoReply={emailId => handleAutoReply(emailId, account.id)}
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
