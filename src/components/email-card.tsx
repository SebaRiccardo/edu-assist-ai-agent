'use client';

import { useState } from 'react';
import { CategorizedEmail } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Mail,
  Tag,
  Sparkles,
  ChevronsUpDown,
  FileText,
  Loader2,
  RefreshCw,
} from 'lucide-react';

interface EmailCardProps {
  email: CategorizedEmail;
  courseName?: string;
  userId?: string;
  isSendingReply?: boolean;
  onMarkAsRead?: (emailId: string) => void;
  onArchive?: (emailId: string) => void;
  onDelete?: (emailId: string) => void;
  onAutoReply?: (emailId: string) => void;
}

const emailCategoryConfig = {
  course_related: {
    label: 'Course Related',
    variant: 'default' as const,
    icon: '�',
  },
  student_email: {
    label: 'Student Email',
    variant: 'info' as const,
    icon: '🎓',
  },
  staff_email: {
    label: 'Staff Email',
    variant: 'warning' as const,
    icon: '�‍🏫',
  },
  administrative: {
    label: 'Administrative',
    variant: 'secondary' as const,
    icon: '�',
  },
  assignment: {
    label: 'Assignment',
    variant: 'info' as const,
    icon: '�',
  },
  grade_inquiry: {
    label: 'Grade Inquiry',
    variant: 'warning' as const,
    icon: '�',
  },
  other: {
    label: 'Other',
    variant: 'outline' as const,
    icon: '📧',
  },
};

// Send button component
const SendButton = ({
  isSending,
  onClick,
  label = 'Auto Reply'
}: {
  isSending: boolean;
  onClick: () => void;
  label?: string;
}) => (
  <Button
    variant="default"

    onClick={onClick}
    disabled={isSending}
  // className="bg-blue-600 cursor-pointer hover:bg-blue-700"
  >
    {isSending ? (
      <>
        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
        Sending...
      </>
    ) : (
      <>
        <Mail className="size-5 mr-1" />
        {label}
      </>
    )}
  </Button>
);

// Email header component
const EmailHeader = ({
  email,
  categoryConfig,
}: {
  email: CategorizedEmail;
  categoryConfig: typeof emailCategoryConfig[keyof typeof emailCategoryConfig] | undefined;
}) => (
  <CardHeader>
    <div className="flex items-start justify-between">
      <div className="flex-1 space-y-1">
        <div className="flex items-end gap-2">
          <Mail className="text-red-500 size-6" />
          <CardTitle className="text-base font-semibold">
            {email.subject}
          </CardTitle>
          {categoryConfig && (
            <Badge variant={categoryConfig.variant}>
              {categoryConfig.label}
            </Badge>
          )}
          {email.isUnread && <Badge variant="default">New</Badge>}
        </div>
        <CardDescription className="text-sm">
          From: {email.from}
        </CardDescription>
      </div>
      <div className="text-sm text-muted-foreground">
        {new Date(email.receivedAt).toLocaleString()}
      </div>
    </div>
  </CardHeader>
);

// Email snippet component
const EmailSnippet = ({ snippet, suggestedLabel }: { snippet: string; suggestedLabel: string }) => (
  <>
    <p className="text-sm text-muted-foreground line-clamp-2">{snippet}</p>
    <div className="flex flex-wrap gap-2 items-center">
      <div className="flex items-center gap-1">
        <Tag className="h-3 w-3 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Labels:</span>
      </div>
      <Badge variant="success">{suggestedLabel}</Badge>
    </div>
  </>
);

// AI Reasoning collapsible component
const AIReasoningSection = ({
  reasoning,
  confidencePercentage,
}: {
  reasoning: string;
  confidencePercentage: number;
}) => (
  <Collapsible className="w-full">
    <CollapsibleTrigger asChild>
      <Button
        variant="ghost"
        size="sm"
        className="hover:text-blue-500 hover:bg-transparent"
      >
        <Sparkles className="size-4 mr-1" />
        Explain reasoning
        <ChevronsUpDown className="size-4 ml-1" />
      </Button>
    </CollapsibleTrigger>
    <CollapsibleContent className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden transition-all duration-300">
      <div className="mt-3 rounded-lg border bg-background/50 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground">AI Reasoning</p>
          <Badge variant="outline" className="text-xs">
            {confidencePercentage}% confidence
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{reasoning}</p>
      </div>
    </CollapsibleContent>
  </Collapsible>
);

// Draft response collapsible component
const DraftResponseSection = ({
  isDraftOpen,
  setIsDraftOpen,
  draftResponse,
  isGeneratingDraft,
  draftError,
  handleGenerateDraft,
  isSendingReply,
  onAutoReply,
  emailId,
}: {
  isDraftOpen: boolean;
  setIsDraftOpen: (open: boolean) => void;
  draftResponse: string | null;
  isGeneratingDraft: boolean;
  draftError: string | null;
  handleGenerateDraft: () => void;
  isSendingReply: boolean;
  onAutoReply?: (emailId: string) => void;
  emailId: string;
}) => (
  <Collapsible open={isDraftOpen} onOpenChange={setIsDraftOpen} className="w-full">
    <div className="flex items-center gap-2 flex-wrap">
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="hover:text-green-500 hover:bg-transparent"
          onClick={() => {
            if (!draftResponse && !isDraftOpen) {
              handleGenerateDraft();
            }
          }}
        >
          <FileText className="size-4 mr-1" />
          {draftResponse ? 'View Draft' : 'Generate Draft'}
          <ChevronsUpDown className="size-4 ml-1" />
        </Button>
      </CollapsibleTrigger>

      {draftResponse && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleGenerateDraft}
          disabled={isGeneratingDraft}
          className="hover:text-green-500 hover:bg-transparent"
        >
          {isGeneratingDraft ? (
            <>
              <Loader2 className="size-4 mr-1 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <RefreshCw className="size-4 mr-1" />
              Regenerate
            </>
          )}
        </Button>
      )}
    </div>

    <CollapsibleContent className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden transition-all duration-300">
      <div className="mt-3 rounded-lg border bg-green-50 dark:bg-green-950/20 p-4">
        {isGeneratingDraft && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-green-600" />
            <span className="ml-2 text-sm text-muted-foreground">
              Generating draft response...
            </span>
          </div>
        )}

        {draftError && (
          <div className="flex items-start gap-2 p-3 rounded-md bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">{draftError}</p>
          </div>
        )}

        {draftResponse && !isGeneratingDraft && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
              <p className="text-sm font-semibold text-foreground">Draft Response</p>
              <Badge variant="outline" className="text-xs bg-green-100 dark:bg-green-900/30">
                AI Generated
              </Badge>
            </div>
            <div className="rounded-md bg-background border p-3">
              <p className="text-sm text-foreground whitespace-pre-wrap">{draftResponse}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigator.clipboard.writeText(draftResponse)}
              >
                Copy to Clipboard
              </Button>
              {onAutoReply && (
                <SendButton
                  isSending={isSendingReply}
                  onClick={() => onAutoReply(emailId)}
                  label="Send This Draft"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </CollapsibleContent>
  </Collapsible>
);

export function EmailCard({
  email,
  courseName,
  userId,
  isSendingReply = false,
  onMarkAsRead,
  onArchive,
  onDelete,
  onAutoReply,
}: EmailCardProps) {
  const categoryConfig = emailCategoryConfig[email.category as keyof typeof emailCategoryConfig];
  const confidencePercentage = Math.round(email.confidence * 100);

  const [isDraftOpen, setIsDraftOpen] = useState(false);
  const [draftResponse, setDraftResponse] = useState<string | null>(null);
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);

  const handleGenerateDraft = async () => {
    if (!userId || !courseName) {
      setDraftError('Missing user or course information');
      return;
    }

    setIsGeneratingDraft(true);
    setDraftError(null);

    try {
      const draftPayload = {
        userId,
        email: {
          id: email.id,
          from: email.from,
          subject: email.subject,
          body: email.body,
          category: email.category,
          reasoning: email.reasoning,
        },
        priority: {
          priority: 'medium',
          responseDeadline: 'Within 24 hours',
          reasoning: 'Draft requested by professor',
        },
        courseName,
        professorName: 'Professor',
        language: 'Spanish',
      };

      const response = await fetch('/api/email/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draftPayload),
      });

      const result = await response.json();

      if (result.success) {
        setDraftResponse(result.data.draftResponse);
        setIsDraftOpen(true);
      } else {
        setDraftError(result.error || 'Failed to generate draft');
      }
    } catch (error) {
      console.error('Error generating draft:', error);
      setDraftError('An error occurred while generating the draft');
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  return (
    <Card className="hover:shadow-xl hover:scale-120 cursor-pointer transition-all duration-200 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-none shadow-none hover:bg-background/70">
      <EmailHeader email={email} categoryConfig={categoryConfig} />

      <CardContent className="space-y-3">
        <EmailSnippet snippet={email.snippet} suggestedLabel={email.suggestedLabel} />
        <div className='flex flex-col gap-2'>
          <AIReasoningSection
            reasoning={email.reasoning}
            confidencePercentage={confidencePercentage}
          />

          <DraftResponseSection
            isDraftOpen={isDraftOpen}
            setIsDraftOpen={setIsDraftOpen}
            draftResponse={draftResponse}
            isGeneratingDraft={isGeneratingDraft}
            draftError={draftError}
            handleGenerateDraft={handleGenerateDraft}
            isSendingReply={isSendingReply}
            onAutoReply={onAutoReply}
            emailId={email.id}
          />
        </div>

        {/* Auto Reply Button - Bottom Right */}
        {onAutoReply && (
          <div className="flex justify-end">
            <SendButton
              isSending={isSendingReply}
              onClick={() => onAutoReply(email.id)}
              label="Auto Reply"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
