'use client';

import { useState } from 'react';
import { CategorizedEmail } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
  Pencil,
  Check,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { generateEmailDraft } from '@/actions/email/email-draft';

interface EmailDetailsPanelProps {
  email: CategorizedEmail;
  courseName?: string;
  userId?: string;
  isSendingReply?: boolean;
  onClose: () => void;
  onAutoReply?: (emailId: string) => void;
  connectedAccountId?: string;
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

// Sub-component: Email Header
function EmailHeader({ email }: { email: CategorizedEmail }) {
  const categoryConfig =
    emailCategoryConfig[email.category as keyof typeof emailCategoryConfig];

  return (
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
  );
}

// Sub-component: Email Body
function EmailBody({ body }: { body: string }) {
  return (
    <div className="border-none shadow-none bg-background/30 p-3 rounded-3xl">
      <p className="text-sm whitespace-pre-wrap break-all">{body}</p>
    </div>
  );
}

// Sub-component: AI Reasoning
function AIReasoning({
  reasoning,
  confidence,
}: {
  reasoning: string;
  confidence: number;
}) {
  const confidencePercentage = Math.round(confidence * 100);

  return (
    <Collapsible className="w-full">
      <CollapsibleTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start shadow-none border-none"
        >
          <Sparkles className="size-4 mr-2" />
          View AI Reasoning
          <ChevronsUpDown className="size-4 ml-auto" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3 data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down flex flex-col gap-2 overflow-hidden transition-all duration-300">
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
            <p className="text-sm text-muted-foreground">{reasoning}</p>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
}

// Sub-component: Draft Editor
function DraftEditor({
  editedDraft,
  isEditingDraft,
  draftResponse,
  onEdit,
  onSave,
  onCancel,
  onChange,
}: {
  editedDraft: string;
  isEditingDraft: boolean;
  draftResponse: string;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-3 my-2">
      <div className="flex items-center justify-between gap-2">
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
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (isEditingDraft) {
              onSave();
              toast.success('Draft saved successfully');
            } else {
              onEdit();
            }
          }}
          className="h-8"
        >
          {isEditingDraft ? (
            <>
              <Check className="h-4 w-4 mr-1" />
              Save
            </>
          ) : (
            <>
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </>
          )}
        </Button>
      </div>

      {isEditingDraft ? (
        <Textarea
          value={editedDraft}
          onChange={e => onChange(e.target.value)}
          className="min-h-[200px] text-sm font-mono resize-y border-none shadow-none bg-background/30"
          placeholder="Edit your draft response..."
        />
      ) : (
        <div className="rounded-md bg-background border p-3 border-none shadow-none">
          <p className="text-sm text-foreground whitespace-pre-wrap">
            {editedDraft || draftResponse}
          </p>
        </div>
      )}
    </div>
  );
}

// Sub-component: Draft Actions
function DraftActions({
  editedDraft,
  draftResponse,
  isEditingDraft,
  isSendingReply,
  onCopy,
  onCancel,
  onSend,
}: {
  editedDraft: string;
  draftResponse: string;
  isEditingDraft: boolean;
  isSendingReply: boolean;
  onCopy: () => void;
  onCancel: () => void;
  onSend: () => void;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      <Button
        variant="outline"
        size="sm"
        className="border-none"
        onClick={() => {
          onCopy();
          toast.success('Draft copied to clipboard');
        }}
      >
        Copy to Clipboard
      </Button>
      {isEditingDraft && (
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      )}
      {!isEditingDraft && (
        <Button size="sm" onClick={onSend} disabled={isSendingReply}>
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
      )}
    </div>
  );
}

export function EmailDetailsPanel({
  email,
  courseName,
  userId,
  isSendingReply = false,
  onClose,
  onAutoReply,
  connectedAccountId,
}: EmailDetailsPanelProps) {
  const [isDraftOpen, setIsDraftOpen] = useState(false);
  const [draftResponse, setDraftResponse] = useState<string | null>(null);
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  const [editedDraft, setEditedDraft] = useState<string>('');

  const handleGenerateDraft = async () => {
    if (!userId || !courseName || !connectedAccountId) {
      const errorMsg = 'Missing user or course information';
      setDraftError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setIsGeneratingDraft(true);
    setDraftError(null);
    toast.loading('Generating draft response...', { id: 'draft-generation' });

    try {
      const result = await generateEmailDraft({
        connectedAccountId,
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
      });

      if (result.success && result.data) {
        setDraftResponse(result.data.draftResponse);
        setEditedDraft(result.data.draftResponse);
        setIsEditingDraft(false);
        setIsDraftOpen(true);
        toast.success('Draft generated successfully', {
          id: 'draft-generation',
        });
      } else {
        const errorMsg = result.error || 'Failed to generate draft';
        setDraftError(errorMsg);
        toast.error(errorMsg, { id: 'draft-generation' });
      }
    } catch (error) {
      console.error('Error generating draft:', error);
      const errorMsg = 'An error occurred while generating the draft';
      setDraftError(errorMsg);
      toast.error(errorMsg, { id: 'draft-generation' });
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  return (
    <div className="flex flex-col h-full border-l border-border w-full">
      {/* Scrollable Content */}
      <ScrollArea className="flex-1 w-full">
        <div className="p-6 space-y-6">
          {/* Email Header Info */}
          <EmailHeader email={email} />

          {/* Email Body */}
          <EmailBody body={email.body} />

          {/* AI Reasoning Section */}
          <AIReasoning
            reasoning={email.reasoning}
            confidence={email.confidence}
          />

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
                  className="flex-1 shadow-none border-none justify-start"
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

            <CollapsibleContent className="mt-2">
              <Card className="border-none shadow-none bg-green-50 dark:bg-green-950/20">
                <CardContent>
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
                    <>
                      <DraftEditor
                        editedDraft={editedDraft}
                        isEditingDraft={isEditingDraft}
                        draftResponse={draftResponse}
                        onEdit={() => {
                          setEditedDraft(draftResponse);
                          setIsEditingDraft(true);
                        }}
                        onSave={() => setIsEditingDraft(false)}
                        onCancel={() => {
                          setEditedDraft(draftResponse);
                          setIsEditingDraft(false);
                          toast.info('Edit cancelled');
                        }}
                        onChange={setEditedDraft}
                      />
                      <DraftActions
                        editedDraft={editedDraft}
                        draftResponse={draftResponse}
                        isEditingDraft={isEditingDraft}
                        isSendingReply={isSendingReply}
                        onCopy={() => {
                          navigator.clipboard.writeText(
                            editedDraft || draftResponse
                          );
                        }}
                        onCancel={() => {
                          setEditedDraft(draftResponse);
                          setIsEditingDraft(false);
                          toast.info('Edit cancelled');
                        }}
                        onSend={() => {
                          if (onAutoReply) {
                            onAutoReply(email.id);
                          }
                        }}
                      />
                    </>
                  )}
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ScrollArea>
      {/* Footer Actions */}
      {onAutoReply && (
        <div className="p-4 border-t border-border">
          <Button
            className="w-full"
            size="lg"
            onClick={() => {
              onAutoReply(email.id);
            }}
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
        </div>
      )}
    </div>
  );
}
