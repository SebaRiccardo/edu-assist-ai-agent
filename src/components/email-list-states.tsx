import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from '@/components/ui/empty';
import { EmailCard } from '@/components/email-card';
import { CategorizedEmail } from '@/types';
import { Loader2, Sparkles, CheckCircle, Inbox } from 'lucide-react';

interface EmailListStatesProps {
  emails: CategorizedEmail[];
  isChecking: boolean;
  stats: {
    totalAnalyzed: number;
    courseRelated: number;
  } | null;
  onAnalyze: () => void;
}

export function EmailListStates({
  emails,
  isChecking,
  stats,
  onAnalyze,
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
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Unread Course Emails ({emails.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {emails.map(email => (
            <EmailCard key={email.id} email={email} />
          ))}
        </div>
      </div>
    );
  }

  return null;
}
