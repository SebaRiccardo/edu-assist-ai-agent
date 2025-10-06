import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from '@/components/ui/empty';
import { EmailListItem } from '@/components/email-list-item';
import { EmailDetailsPanel } from '@/components/email-details-panel';
import { CategorizedEmail } from '@/types';
import { Loader2, Sparkles, CheckCircle, Inbox } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EmailListStatesProps {
  emails: CategorizedEmail[];
  isChecking: boolean;
  stats: {
    totalAnalyzed: number;
    courseRelated: number;
  } | null;
  courseName?: string;
  userId?: string;
  isSendingReply?: boolean;
  replyingToEmailId?: string | null;
  onAnalyze: () => void;
  onAutoReply?: (emailId: string) => void;
}

export function EmailListStates({
  emails,
  isChecking,
  stats,
  courseName,
  userId,
  isSendingReply,
  replyingToEmailId,
  onAnalyze,
  onAutoReply,
}: EmailListStatesProps) {
  // Loading State - Checking Emails
  if (isChecking) {
    return (
      <Empty className="min-h-[40vh] border-none rounded-3xl">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </EmptyMedia>
          <EmptyTitle>Analyzing your inbox...</EmptyTitle>
          <EmptyDescription>
            Our AI is scanning your emails and categorizing them by course. This
            may take a few moments.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  // Initial Empty State - No Analysis Yet
  if (emails.length === 0 && !stats) {
    return (
      <Empty className="min-h-[40vh] border-none rounded-3xl">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Inbox className="h-6 w-6" />
          </EmptyMedia>
          <EmptyTitle>No emails analyzed yet</EmptyTitle>
          <EmptyDescription>
            Click the "Analyze Inbox" button to scan your inbox for
            course-related messages using AI
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={onAnalyze} size="lg" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Analyze Inbox
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  // Empty State - No Results After Analysis
  if (emails.length === 0 && stats && stats.courseRelated === 0) {
    return (
      <Empty className="min-h-[40vh] border-none bg-background/50 rounded-3xl">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CheckCircle className="h-6 w-6 text-green-500" />
          </EmptyMedia>
          <EmptyTitle>Inbox is clean!</EmptyTitle>
          <EmptyDescription>
            Analyzed {stats.totalAnalyzed} emails, but none are related to this
            course
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  // Email List - With Results
  if (emails.length > 0) {
    const [selectedEmail, setSelectedEmail] = useState<CategorizedEmail | null>(
      null
    );

    return (
      <div className="flex h-full gap-0 overflow-hidden rounded-lg border border-border bg-background">
        {/* Email List - Left Side */}
        <div className="w-full md:w-96 lg:w-[420px] flex flex-col border-r border-border bg-background/50">
          <div className="flex items-center justify-between p-4 border-b border-border bg-background/80">
            <h2 className="text-base font-semibold text-foreground">
              Course Emails ({emails.length})
            </h2>
          </div>

          <ScrollArea className="flex-1">
            <div className="divide-y divide-border">
              {emails.map(email => (
                <EmailListItem
                  key={email.id}
                  email={email}
                  isSelected={selectedEmail?.id === email.id}
                  isSendingReply={
                    !!isSendingReply && replyingToEmailId === email.id
                  }
                  onClick={() => setSelectedEmail(email)}
                  onAutoReply={onAutoReply || (() => {})}
                />
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Email Details Panel - Desktop Right Side */}
        <div className="flex flex-1 w-full">
          {selectedEmail ? (
            <EmailDetailsPanel
              email={selectedEmail}
              courseName={courseName}
              userId={userId}
              isSendingReply={
                isSendingReply && replyingToEmailId === selectedEmail.id
              }
              onClose={() => setSelectedEmail(null)}
              onAutoReply={onAutoReply || (() => {})}
            />
          ) : (
            <div className="flex items-center justify-center w-full bg-background/30">
              <Empty className="border-none">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Inbox className="h-8 w-8 text-muted-foreground" />
                  </EmptyMedia>
                  <EmptyTitle>Select an email</EmptyTitle>
                  <EmptyDescription>
                    Choose an email from the list to view its details and take
                    actions
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
