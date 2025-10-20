import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent, EmptyMedia } from '@/components/ui/empty';
import { EmailListItem } from '@/components/email-list-item';
import { EmailDetailsPanel } from '@/components/email-details-panel';
import { CategorizedEmail, CategorizedEmailWithPriority } from '@/types';
import { Loader2, Sparkles, CheckCircle, Inbox, Tags } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { IconMailSpark } from '@tabler/icons-react';
import { Loader } from './ai-elements/loader';
import { useCourseInbox } from '@/contexts/course-inbox-context';

interface EmailListStatesProps {
  emails: (CategorizedEmail | CategorizedEmailWithPriority)[];
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
  onAutoReply?: (accountId: string) => void;
  onAutoTagAll: (accountId: string) => void;
  isAutoTagging?: boolean;
  selectedAccountId: string;
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
  onAutoTagAll,
  isAutoTagging,
  selectedAccountId,
}: EmailListStatesProps) {
  const t = useTranslations('EmailList');
  const [selectedEmail, setSelectedEmail] = useState<CategorizedEmail | CategorizedEmailWithPriority | null>(null);

  const {
    isEmailReplying,
  } = useCourseInbox();

  // Loading State - Checking Emails
  if (isChecking) {
    return (
      <Empty className="min-h-[40vh] border-none rounded-3xl">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </EmptyMedia>
          <EmptyTitle>{t('analyzingTitle')}</EmptyTitle>
          <EmptyDescription>{t('analyzingDescription')}</EmptyDescription>
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
          <EmptyTitle>{t('noAnalysisTitle')}</EmptyTitle>
          <EmptyDescription>{t('noAnalysisDescription')}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={onAnalyze} size="lg" className="gap-2">
            <IconMailSpark className="size-5" />
            {t('analyzeButton')}
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
          <EmptyTitle>{t('cleanInboxTitle')}</EmptyTitle>
          <EmptyDescription>{t('cleanInboxDescription', { count: stats.totalAnalyzed })}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  // Email List - With Results
  if (emails.length > 0) {
    return (
      <div className=" h-full gap-0 grid grid-cols-12 overflow-hidden rounded-3xl ">
        {/* Email List - Left Side */}
        <div className="col-span-6 flex-col border-r">
          <div className="flex items-center justify-between p-2 px-4 border-b">
            <h2 className="text-sm font-semibold text-foreground">{t('courseEmails', { count: emails.length })}</h2>
            <div className="flex gap-2">
              <Button variant='outline' onClick={() => onAutoTagAll(selectedAccountId)} size="sm" disabled={isAutoTagging} className="gap-2 h-7">
                {isAutoTagging ? <Loader /> : <Tags />}
                {t('autoTagAll')}
              </Button>
              <Button onClick={onAnalyze} size="sm" className="gap-2 h-7">
                <Sparkles />
                {t('reAnalyze')}
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1 ">
            <div className="divide-y divide-border">
              {emails.map(email => (
                <EmailListItem
                  key={email.id}
                  email={email}
                  isSelected={selectedEmail?.id === email.id}
                  isSendingReply={!!isSendingReply && replyingToEmailId === email.id}
                  onClick={() => setSelectedEmail(email)}
                  onAutoReply={onAutoReply}
                />
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Email Details Panel - Desktop Right Side */}
        <div className="flex flex-1 col-span-6">
          {selectedEmail ? (
            <EmailDetailsPanel
              connectedAccountId={selectedAccountId}
              email={selectedEmail}
              courseName={courseName}
              userId={userId}
              isSendingReply={isSendingReply && isEmailReplying(selectedEmail.id)}
              onClose={() => setSelectedEmail(null)}
              onAutoReply={onAutoReply}
            />
          ) : (
            <div className="flex items-center justify-center w-full">
              <Empty className="border-none">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Inbox className="h-8 w-8 text-muted-foreground" />
                  </EmptyMedia>
                  <EmptyTitle>{t('selectEmailTitle')}</EmptyTitle>
                  <EmptyDescription>{t('selectEmailDescription')}</EmptyDescription>
                </EmptyHeader>
              </Empty>
            </div>
          )}
        </div>
      </div >
    );
  }

  return null;
}
