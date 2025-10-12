'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CourseDetailsHeader } from '@/components/course-details-header';
import { EmailListStates } from '@/components/email-list-states';
import {
  CategorizedEmail,
  InboxAnalysisResult,
  DomainCourse,
  DomainInbox,
} from '@/types';
import { Loader2 } from 'lucide-react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useCourse } from '@/hooks/use-courses';
import {
  useCreateInbox,
  useDeleteInbox,
  useInboxes,
} from '@/hooks/use-inboxes';
import { Course } from '@/lib/supabase/types/courses.types';
import { Inboxes } from '@/lib/supabase/types/inboxes.types';
import { useConnections } from '@/hooks/use-connections';
import { useGmailConnection } from '@/hooks/use-gmail-connection';
import { ConnectedInboxesCard } from '@/components/connected-inboxes-card';
import { ConnectionStatusCard } from '@/components/connection-status-card';
import { ErrorCard } from '@/components/error-card';
import { NoAccountsEmptyState } from '@/components/no-accounts-empty-state';
import { AddInboxSection } from '@/components/add-inbox-section';
import { ComposioConnectedAccount } from '@/app/api/connections/route';
import { InboxEmailSelect } from './inbox-email-select';

export default function CourseDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useCurrentUser();
  const courseId = params.id as string;

  const [currentInbox, setCurrentInbox] = useState<DomainInbox | null>(null);

  // Data fetching hooks
  const { data: courseData, isLoading: isLoadingCourse, isError: isErrorCourse } = useCourse(courseId);
  const { data: inboxes = [], isLoading: isLoadingInboxes } = useInboxes(courseId);
  const { mutateAsync: deleteInbox } = useDeleteInbox();
  const {
    mutateAsync: createInbox,
    isPending: isCreatingInbox,
    variables: createInboxVariables,
  } = useCreateInbox();

  const { data: composionGmailConnections, isLoading: isLoadingConnections } = useConnections(
    Array.isArray(inboxes) && inboxes.length > 0
  );

  // Gmail connection logic
  const gmailConnection = useGmailConnection({
    courseId,
    onConnectionSuccess: account => {
      inboxes?.length === 0 && composionGmailConnections?.length === 1
        ? handleAddInboxToCourse(account)
        : null;
    },
  });

  // Transform Supabase data to DomainCourse type
  const course: DomainCourse | null = courseData
    ? {
      id: courseData.id,
      name: courseData.name,
      year: courseData.year ?? '',
      description: courseData.description,
      context: courseData.context,
      inboxes: inboxes?.map(inbox => ({
        id: inbox.id,
        email: inbox.email,
        unreadCount: inbox.unread_count,
        connectedAccountId: inbox.connected_account_id,
        status: inbox.status,
        createdAt: new Date(inbox.created_at),
        updatedAt: new Date(inbox.updated_at),
      })),
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

  // Email state
  const [emails, setEmails] = useState<CategorizedEmail[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [replyingToEmailId, setReplyingToEmailId] = useState<string | null>(
    null
  );
  const [authError, setAuthError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    totalAnalyzed: number;
    courseRelated: number;
  } | null>(null);

  // Handlers
  const handleAnalyzeInbox = async () => {
    if (!course || !user) return;

    if (!course.inboxes || course.inboxes.length === 0) {
      setAuthError('Please connect a Gmail account first');
      return;
    }

    setIsChecking(true);
    setAuthError(null);

    try {
      const response = await fetch('/api/inbox/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connectedAccountId: currentInbox
            ? currentInbox.connectedAccountId
            : course.inboxes[0].connectedAccountId,
          courseId: course.id,
          reasoningLanguage: 'spanish',
        }),
      });

      const res: {
        success: boolean;
        data?: InboxAnalysisResult;
        authRequired?: boolean;
        error?: string;
      } = await response.json();

      if (response.status === 401) {
        setAuthError('Gmail connection required');
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
        'Ocurrió un error al analizar los correos. Por favor, inténtalo de nuevo.'
      );
    } finally {
      setIsChecking(false);
    }
  };

  const handleAddInboxToCourse = async (account: ComposioConnectedAccount) => {
    try {
      await createInbox([
        {
          course_id: courseId,
          email: account.email,
          connected_account_id: account.id,
          status: account.status,
        },
      ]);
    } catch (error) {
      console.error('Error adding account to course:', error);
      setAuthError('Failed to add account to course');
    }
  };

  const handleDisconnectInbox = async (inboxId: string) => {
    if (!confirm('Are you sure you want to disconnect this Gmail account?')) {
      return;
    }

    try {
      await deleteInbox({ id: inboxId });
    } catch (error) {
      console.error('Error disconnecting inbox:', error);
      setAuthError('Failed to disconnect inbox');
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
      const response = await fetch('/api/email/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        alert('Email reply sent successfully!');
      } else {
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

  const handleInboxSelect = (inbox: DomainInbox) => {
    setCurrentInbox(inbox);

  };

  // Redirect if course not found
  if (isErrorCourse) {
    router.push('/dashboard');
    return null;
  }

  if (isLoadingCourse || isLoadingInboxes || isLoadingConnections || !course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }


  const gmailAccounts = composionGmailConnections || [];
  const hasNoConnections = gmailAccounts.length === 0;
  const hasInboxes = course!.inboxes && course!.inboxes.length > 0;
  const addingAccountId = createInboxVariables
    ? createInboxVariables[0].connected_account_id
    : null;

  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto max-w-7xl w-full px-6 space-y-6">
        <CourseDetailsHeader
          course={course!}
          isChecking={isChecking}
          onAnalyze={handleAnalyzeInbox}
        />

        <ConnectionStatusCard
          status={gmailConnection.connectionStatus}
          onCancel={gmailConnection.cancelConnection}
        />

        {hasInboxes && (
          <div className="pb-2">
            <InboxEmailSelect
              onSelected={handleInboxSelect}
              inboxes={course.inboxes}
            />
          </div>
        )}
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
      ) : !hasInboxes ? (
        <AddInboxSection
          accounts={gmailAccounts}
          isDialogOpen={gmailConnection.isDialogOpen}
          onOpenDialog={gmailConnection.setIsDialogOpen}
          onConnect={gmailConnection.initiateConnection}
          onAddAccount={handleAddInboxToCourse}
          isAddingAccount={isCreatingInbox}
          addingAccountId={addingAccountId}
        />
      ) : (
        <div className="flex-1 overflow-hidden mx-auto max-w-7xl w-full px-6">
          <EmailListStates
            emails={emails}
            isChecking={isChecking}
            stats={stats}
            courseName={course.name}
            userId={user?.id}
            isSendingReply={isSendingReply}
            replyingToEmailId={replyingToEmailId}
            onAnalyze={handleAnalyzeInbox}
            onAutoReply={handleAutoReply}
          />
        </div>
      )}
    </div>
  );
}
