'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CategorizedEmail } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Mail, Sparkles, ChevronsUpDown, FileText, Loader2, RefreshCw, X, Pencil, Check } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { generateEmailDraft } from '@/actions/inbox/email-draft';

interface EmailDetailsPanelProps {
  email: CategorizedEmail;
  courseName?: string;
  userId?: string;
  isSendingReply?: boolean;
  onClose: () => void;
  onAutoReply?: (emailId: string) => void;
  connectedAccountId?: string;
}

// Sub-component: Email Header
function EmailHeader({ email }: { email: CategorizedEmail }) {
  const t = useTranslations('EmailDetails');

  const emailCategoryConfig = {
    course_related: {
      label: t('categoryLabels.course_related'),
      variant: 'default' as const,
      icon: '📚',
    },
    student_email: {
      label: t('categoryLabels.student_email'),
      variant: 'info' as const,
      icon: '🎓',
    },
    staff_email: {
      label: t('categoryLabels.staff_email'),
      variant: 'warning' as const,
      icon: '👨‍🏫',
    },
    administrative: {
      label: t('categoryLabels.administrative'),
      variant: 'secondary' as const,
      icon: '📋',
    },
    assignment: {
      label: t('categoryLabels.assignment'),
      variant: 'info' as const,
      icon: '📝',
    },
    grade_inquiry: {
      label: t('categoryLabels.grade_inquiry'),
      variant: 'warning' as const,
      icon: '📊',
    },
    other: {
      label: t('categoryLabels.other'),
      variant: 'outline' as const,
      icon: '📧',
    },
  };

  const categoryConfig = emailCategoryConfig[email.category as keyof typeof emailCategoryConfig];

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
            {email.isUnread && <Badge variant="default">{t('new')}</Badge>}
          </div>
        </div>
      </div>

      <div className="space-y-1 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground font-medium">{t('from')}:</span>
          <span className="font-medium">{email.from}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground font-medium">{t('date')}:</span>
          <span>{new Date(email.receivedAt).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

// Sub-component: Email Body
function EmailBody({ body }: { body: string }) {
  return (
    <div className="border-none shadow-none bg-background/80 p-3 rounded-lg">
      <p className="text-sm whitespace-pre-wrap break-all">{body}</p>
    </div>
  );
}

// Sub-component: AI Reasoning
function AIReasoning({ reasoning, confidence }: { reasoning: string; confidence: number }) {
  const t = useTranslations('EmailDetails');
  const confidencePercentage = Math.round(confidence * 100);

  return (
    <Collapsible className="w-full">
      <CollapsibleTrigger asChild>
        <Button variant="outline" size="sm" className="w-full justify-start shadow-none border-none">
          <Sparkles className="size-4 mr-2" />
          {t('viewAiReasoning')}
          <ChevronsUpDown className="size-4 ml-auto" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3 data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down flex flex-col gap-2 overflow-hidden transition-all duration-300">
        <Card className="border-none shadow-none bg-background/50">
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground">{t('aiReasoning')}</p>
              <Badge variant="outline" className="text-xs">
                {t('confidence', { percentage: confidencePercentage })}
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
  const t = useTranslations('EmailDetails');

  return (
    <div className="space-y-3 my-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
          <p className="text-sm font-semibold text-foreground">{t('draftResponse')}</p>
          <Badge variant="outline" className="text-xs text-white border-none bg-green-500 dark:bg-green-900/30">
            {t('aiGenerated')}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (isEditingDraft) {
              onSave();
              toast.success(t('draftSaved'));
            } else {
              onEdit();
            }
          }}
          className="h-8"
        >
          {isEditingDraft ? (
            <>
              <Check className="h-4 w-4 mr-1" />
              {t('save')}
            </>
          ) : (
            <>
              <Pencil className="h-4 w-4 mr-1" />
              {t('edit')}
            </>
          )}
        </Button>
      </div>

      {isEditingDraft ? (
        <Textarea
          value={editedDraft}
          onChange={e => onChange(e.target.value)}
          className="min-h-[200px] text-sm font-mono resize-y border-none shadow-none bg-background/30"
          placeholder={t('editPlaceholder')}
        />
      ) : (
        <div className="rounded-md bg-background border p-3 border-none shadow-none">
          <p className="text-sm text-foreground whitespace-pre-wrap">{editedDraft || draftResponse}</p>
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
  const t = useTranslations('EmailDetails');

  return (
    <div className="flex gap-2 flex-wrap">
      <Button
        variant="outline"
        size="sm"
        className="border-none"
        onClick={() => {
          onCopy();
          toast.success(t('draftCopied'));
        }}
      >
        {t('copyToClipboard')}
      </Button>
      {isEditingDraft && (
        <Button variant="ghost" size="sm" onClick={onCancel}>
          {t('cancel')}
        </Button>
      )}
      {!isEditingDraft && (
        <Button size="sm" onClick={onSend} disabled={isSendingReply}>
          {isSendingReply ? (
            <>
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              {t('sending')}
            </>
          ) : (
            <>
              <Mail className="size-4 mr-1" />
              {t('sendThisDraft')}
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
  const t = useTranslations('EmailDetails');
  const [isDraftOpen, setIsDraftOpen] = useState(false);
  const [draftResponse, setDraftResponse] = useState<string | null>(null);
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  const [editedDraft, setEditedDraft] = useState<string>('');

  const handleGenerateDraft = async () => {
    if (!userId || !courseName || !connectedAccountId) {
      const errorMsg = t('missingInfo');
      setDraftError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setIsGeneratingDraft(true);
    setDraftError(null);
    toast.loading(t('generatingDraftToast'), { id: 'draft-generation' });

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
        toast.success(t('draftGeneratedSuccess'), {
          id: 'draft-generation',
        });
      } else {
        const errorMsg = result.error || t('failedToGenerateDraft');
        setDraftError(errorMsg);
        toast.error(errorMsg, { id: 'draft-generation' });
      }
    } catch (error) {
      console.error('Error generating draft:', error);
      const errorMsg = t('errorGeneratingDraft');
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
          <AIReasoning reasoning={email.reasoning} confidence={email.confidence} />

          {/* Draft Response Section */}
          <Collapsible open={isDraftOpen} onOpenChange={setIsDraftOpen} className="w-full">
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
                  {draftResponse ? t('viewDraft') : t('generateDraft')}
                  <ChevronsUpDown className="size-4 ml-auto" />
                </Button>
              </CollapsibleTrigger>

              {draftResponse && (
                <Button variant="ghost" size="sm" onClick={handleGenerateDraft} disabled={isGeneratingDraft}>
                  {isGeneratingDraft ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      {t('generating')}
                    </>
                  ) : (
                    <>
                      <RefreshCw className="size-4 mr-2" />
                      {t('regenerate')}
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
                      <span className="ml-2 text-sm text-muted-foreground">{t('generatingDraft')}</span>
                    </div>
                  )}

                  {draftError && (
                    <div className="flex items-start gap-2 p-3 rounded-md bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                      <p className="text-sm text-red-600 dark:text-red-400">{draftError}</p>
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
                          toast.info(t('editCancelled'));
                        }}
                        onChange={setEditedDraft}
                      />
                      <DraftActions
                        editedDraft={editedDraft}
                        draftResponse={draftResponse}
                        isEditingDraft={isEditingDraft}
                        isSendingReply={isSendingReply}
                        onCopy={() => {
                          navigator.clipboard.writeText(editedDraft || draftResponse);
                        }}
                        onCancel={() => {
                          setEditedDraft(draftResponse);
                          setIsEditingDraft(false);
                          toast.info(t('editCancelled'));
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
                {t('sendingReply')}
              </>
            ) : (
              <>
                <Mail className="size-5 mr-2" />
                {t('autoReplyToEmail')}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
