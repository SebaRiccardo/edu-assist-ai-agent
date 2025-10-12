'use client';

import { useState } from 'react';
import { CategorizedEmail } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Mail,
  Sparkles,
  ChevronsUpDown,
  FileText,
  Loader2,
  RefreshCw,
  X,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EmailDetailsPanelProps {
  email: CategorizedEmail;
  courseName?: string;
  userId?: string;
  isSendingReply?: boolean;
  onClose: () => void;
  onAutoReply: (emailId: string) => void;
}

const emailCategoryConfig = {
  course_related: {
    label: 'Course Related',
    variant: 'default' as const,
    icon: '📚',
  },
  student_email: {
    label: 'Student Email',
    variant: 'info' as const,
    icon: '🎓',
  },
  staff_email: {
    label: 'Staff Email',
    variant: 'warning' as const,
    icon: '👨‍🏫',
  },
  administrative: {
    label: 'Administrative',
    variant: 'secondary' as const,
    icon: '📋',
  },
  assignment: {
    label: 'Assignment',
    variant: 'info' as const,
    icon: '📝',
  },
  grade_inquiry: {
    label: 'Grade Inquiry',
    variant: 'warning' as const,
    icon: '📊',
  },
  other: {
    label: 'Other',
    variant: 'outline' as const,
    icon: '📧',
  },
};

export function EmailDetailsPanel({
  email,
  courseName,
  userId,
  isSendingReply = false,
  onClose,
  onAutoReply,
}: EmailDetailsPanelProps) {
  const categoryConfig =
    emailCategoryConfig[email.category as keyof typeof emailCategoryConfig];
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
    <div className="flex flex-col h-full border-l border-border w-full ">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Mail className="size-5 text-red-500" />
          <h2 className="font-semibold text-base">Email Details</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1 w-full">
        <div className="p-6 space-y-6">
          {/* Email Header Info */}
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-2 flex-1">
                <h3 className="text-xl font-semibold">{email.subject}</h3>
                <div className="flex flex-wrap gap-2">
                  {categoryConfig && (
                    <Badge variant={categoryConfig.variant}>
                      {categoryConfig.icon} {categoryConfig.label}
                    </Badge>
                  )}
                  <Badge variant="success">{email.suggestedLabel}</Badge>
                  {email.isUnread && <Badge variant="default">New</Badge>}
                </div>
              </div>
            </div>

            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium">From:</span>
                <span className="font-medium">{email.from}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium">Date:</span>
                <span>{new Date(email.receivedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Email Body */}
          <div className="border-none shadow-none bg-background/30 p-3 rounded-3xl">
            <p className="text-sm whitespace-pre-wrap">{email.body}</p>
          </div>

          {/* AI Reasoning Section */}
          <Collapsible className="w-full">
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <Sparkles className="size-4 mr-2" />
                View AI Reasoning
                <ChevronsUpDown className="size-4 ml-auto" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3">
              <Card className="border-none shadow-none bg-background/50">
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      AI Reasoning
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {confidencePercentage}% confidence
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {email.reasoning}
                  </p>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>

          {/* Draft Response Section */}
          <Collapsible
            open={isDraftOpen}
            onOpenChange={setIsDraftOpen}
            className="w-full"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    if (!draftResponse && !isDraftOpen) {
                      handleGenerateDraft();
                    }
                  }}
                >
                  <FileText className="size-4 mr-2" />
                  {draftResponse ? 'View Draft' : 'Generate Draft'}
                  <ChevronsUpDown className="size-4 ml-auto" />
                </Button>
              </CollapsibleTrigger>

              {draftResponse && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleGenerateDraft}
                  disabled={isGeneratingDraft}
                >
                  {isGeneratingDraft ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="size-4 mr-2" />
                      Regenerate
                    </>
                  )}
                </Button>
              )}
            </div>

            <CollapsibleContent className="mt-3">
              <Card className="border-none shadow-none bg-green-50 dark:bg-green-950/20">
                <CardContent className="pt-6">
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
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {draftError}
                      </p>
                    </div>
                  )}

                  {draftResponse && !isGeneratingDraft && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <p className="text-sm font-semibold text-foreground">
                          Draft Response
                        </p>
                        <Badge
                          variant="outline"
                          className="text-xs text-white border-none bg-green-500 dark:bg-green-900/30"
                        >
                          AI Generated
                        </Badge>
                      </div>
                      <div className="rounded-md bg-background border p-3">
                        <p className="text-sm text-foreground whitespace-pre-wrap">
                          {draftResponse}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigator.clipboard.writeText(draftResponse)
                          }
                        >
                          Copy to Clipboard
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => onAutoReply(email.id)}
                          disabled={isSendingReply}
                        >
                          {isSendingReply ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Mail className="size-4 mr-1" />
                              Send This Draft
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        </div >
      </ScrollArea >

      {/* Footer Actions */}
      < div className="p-4 border-t border-border" >
        <Button
          className="w-full"
          size="lg"
          onClick={() => onAutoReply(email.id)}
          disabled={isSendingReply}
        >
          {isSendingReply ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Sending Reply...
            </>
          ) : (
            <>
              <Mail className="size-5 mr-2" />
              Auto Reply to This Email
            </>
          )}
        </Button>
      </div >
    </div >
  );
}
