import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
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
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

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

// Mock data for testing purposes
const mockEmails: CategorizedEmailWithPriority[] = [
  {
    id: "email-1",
    subject: "Assignment Deadline Extension Request",
    from: "student.john@university.edu",
    to: "professor.smith@university.edu",
    receivedAt: "2024-01-15T10:30:00Z",
    body: "Dear Professor Smith, I hope this email finds you well. I am writing to request a 2-day extension for the final project submission due to unexpected family circumstances. I have completed 80% of the work and just need additional time to finalize the analysis section. Thank you for your understanding.",
    category: "assignment",
    isUnread: false,
    threadId: "thread-1",
    isRelated: true,
    suggestedLabel: "assignment",
    confidence: 0.92,
    reasoning: "The email discusses an assignment deadline extension request.",
    labels: ["urgent", "assignment"],
    attachments: [],
    priority: {
      level: "high",
      reasoning: "The student is requesting an extension due to unforeseen circumstances, indicating urgency.",
      responseDeadline: "2024-01-17T23:59:00Z"
    },
    snippet: "Request for assignment deadline extension due to family circumstances..."
  },
  {
    id: "email-2",
    subject: "Question about Chapter 5 Material",
    from: "maria.garcia@university.edu",
    to: "professor.smith@university.edu",
    receivedAt: "2024-01-14T14:22:00Z",
    body: "Hi Professor Smith, I'm having trouble understanding the concept of data normalization covered in Chapter 5. Could you please clarify the difference between 2NF and 3NF with some examples? I've read the textbook multiple times but still feel confused. Would it be possible to schedule office hours this week?",
    category: "question",
    isUnread: true,
    threadId: "thread-2",
    isRelated: true,
    suggestedLabel: "question",
    confidence: 0.88,
    reasoning: "Student asking for clarification on course material.",
    labels: ["question", "office-hours"],
    attachments: [],
    priority: {
      level: "high",
      reasoning: "The student is having trouble understanding the material and is requesting clarification.",
      responseDeadline: "2024-01-16T23:59:00Z"
    },
    snippet: "Student needs clarification on data normalization concepts from Chapter 5..."
  },
  {
    id: "email-3",
    subject: "Lab Report Submission Confirmation",
    from: "alex.chen@university.edu",
    to: "professor.smith@university.edu",
    receivedAt: "2024-01-13T16:45:00Z",
    body: "Dear Professor Smith, I have successfully submitted my Lab Report #3 through the course portal at 4:30 PM today, well before the 5:00 PM deadline. The report includes all required sections: methodology, results, analysis, and conclusions. Please confirm receipt when convenient. Thank you!",
    category: "submission",
    isUnread: false,
    threadId: "thread-3",
    isRelated: true,
    suggestedLabel: "submission",
    confidence: 0.95,
    reasoning: "Student confirming lab report submission.",
    labels: ["submission", "lab-report"],
    attachments: [],
    priority: {
      level: "medium",
      reasoning: "The email is a confirmation of submission, which is important but not urgent.",
      responseDeadline: "2024-01-20T23:59:00Z"
    },
    snippet: "Lab Report #3 submitted successfully before deadline, requesting confirmation..."
  },
  {
    id: "email-4",
    subject: "Absence Notice - Medical Appointment",
    from: "sarah.johnson@university.edu",
    to: "professor.smith@university.edu",
    receivedAt: "2024-01-12T09:15:00Z",
    body: "Dear Professor Smith, I wanted to inform you that I will be unable to attend tomorrow's lecture (January 13th) due to a scheduled medical appointment that I cannot reschedule. I will review the lecture materials posted online and reach out to classmates for notes. Is there anything specific I should focus on for next week's quiz?",
    category: "absence",
    isUnread: true,
    threadId: "thread-4",
    isRelated: true,
    suggestedLabel: "absence",
    confidence: 0.91,
    reasoning: "Student notifying about class absence due to medical appointment.",
    labels: ["absence", "medical"],
    attachments: [],
    snippet: "Student will miss lecture due to medical appointment, asking about quiz preparation..."
  },
  {
    id: "email-5",
    subject: "Grade Inquiry for Midterm Exam",
    from: "david.brown@university.edu",
    to: "professor.smith@university.edu",
    receivedAt: "2024-01-11T11:30:00Z",
    body: "Dear Professor Smith, I received my midterm exam grade and noticed some discrepancies in the scoring. Specifically, I believe questions 7 and 12 were marked incorrectly. Could we schedule a meeting to review my exam? I have my work clearly shown and would appreciate the opportunity to discuss these items. Thank you for your time.",
    category: "grade-inquiry",
    isUnread: false,
    threadId: "thread-5",
    isRelated: true,
    suggestedLabel: "grade-inquiry",
    confidence: 0.89,
    reasoning: "Student requesting grade review for midterm exam.",
    labels: ["grade-inquiry", "midterm"],
    attachments: [],
    snippet: "Student questioning midterm exam grades, requesting meeting to review questions 7 and 12..."
  },
  {
    id: "email-6",
    subject: "Research Project Proposal Submission",
    from: "emily.davis@university.edu",
    to: "professor.smith@university.edu",
    receivedAt: "2024-01-10T13:20:00Z",
    body: "Dear Professor Smith, Please find attached my research project proposal for the final semester project. The proposal outlines my plan to investigate machine learning applications in database optimization. I have included a detailed timeline, methodology, and preliminary literature review. I look forward to your feedback and approval to proceed.",
    category: "project",
    isUnread: true,
    threadId: "thread-6",
    isRelated: true,
    suggestedLabel: "project",
    confidence: 0.94,
    reasoning: "Student submitting research project proposal.",
    labels: ["project", "proposal"],
    attachments: ["proposal.pdf", "timeline.xlsx"],
    snippet: "Research project proposal on ML applications in database optimization submitted..."
  },
  {
    id: "email-7",
    subject: "Group Project Team Formation",
    from: "michael.wilson@university.edu",
    to: "professor.smith@university.edu",
    receivedAt: "2024-01-09T15:45:00Z",
    body: "Hi Professor Smith, I'm reaching out regarding the group project assignment. I'm having difficulty finding team members as most groups have already been formed. Would it be possible to either join an existing group that needs an additional member, or would you prefer to assign me to a group? I'm flexible and eager to contribute to any project. Thank you!",
    category: "group-work",
    isUnread: false,
    threadId: "thread-7",
    isRelated: true,
    suggestedLabel: "group-work",
    confidence: 0.87,
    reasoning: "Student seeking help with group project team formation.",
    labels: ["group-work", "team-formation"],
    attachments: [],
    snippet: "Student needs help finding a group for the project assignment..."
  },
  {
    id: "email-8",
    subject: "Technical Issue with Course Portal",
    from: "lisa.anderson@university.edu",
    to: "professor.smith@university.edu",
    receivedAt: "2024-01-08T12:10:00Z",
    body: "Dear Professor Smith, I'm experiencing technical difficulties accessing the course portal. When I try to log in, I receive an error message saying 'Access Denied.' I've tried clearing my browser cache and using different browsers, but the issue persists. Could you please help me resolve this or direct me to IT support? I need to download this week's assignments. Thank you!",
    category: "technical",
    isUnread: true,
    threadId: "thread-8",
    isRelated: true,
    suggestedLabel: "technical",
    confidence: 0.93,
    reasoning: "Student reporting technical issues with course portal access.",
    labels: ["technical", "portal-access"],
    attachments: [],
    snippet: "Student cannot access course portal, getting 'Access Denied' error message..."
  }
];

export function EmailListStates(props: EmailListStatesProps) {
  const {
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
  } = props
  const t = useTranslations('EmailList');
  const locale = useLocale();
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
  if (mockEmails.length === 0 && !stats) {
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
  if (mockEmails.length === 0 && stats && stats.courseRelated === 0) {
    return (
      <Empty className="min-h-[40vh] border-none bg-background/50 rounded-3xl">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CheckCircle className="h-6 w-6 text-green-500" />
          </EmptyMedia>
          <EmptyTitle>{t('cleanInboxTitle')}</EmptyTitle>
          <EmptyDescription>{t('cleanInboxDescription', { count: stats.totalAnalyzed })}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={onAnalyze} size="lg" className="gap-2">
            <IconMailSpark className="size-5" />
            {t('reAnalyze')}
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  // Email List - With Results
  if (mockEmails.length > 0) {
    return (
      <ResizablePanelGroup
        direction="horizontal"
        className="h-fit max-h-[520px] items-stretch"
      >
        <ResizablePanel defaultSize={50} minSize={40} maxSize={50}>
          <div className=" flex-col border-r">
            <div className="flex items-center justify-between p-4 border-b">
              {/* <h2 className="text-sm font-semibold text-foreground">{t('courseEmails', { count: emails.length })}</h2> */}
              <div className="flex gap-2 items-end">
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

            <ScrollArea className="flex-1 flex h-screen">
              <div className="flex flex-col gap-2 pt-4 pr-4">
                {mockEmails.map(email => (
                  <EmailListItem
                    key={email.id}
                    email={email}
                    isSelected={selectedEmail?.id === email.id}
                    isSendingReply={!!isSendingReply && replyingToEmailId === email.id}
                    onClick={() => setSelectedEmail(email)}
                    onAutoReply={onAutoReply}
                    locale={locale as 'es' | 'en'}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={75}>
          <div className="flex flex-1 ">
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
        </ResizablePanel>
      </ResizablePanelGroup>
    );
  }

  return null;
}

/**
     <ScrollArea className="h-screen">
      <div className="flex flex-col gap-2 p-4 pt-0">
        {items.map((item) => (
          <button
            key={item.id}
            className={cn(
              "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent",
              mail.selected === item.id && "bg-muted"
            )}
            onClick={() =>
              setMail({
                ...mail,
                selected: item.id,
              })
            }
          >
            <div className="flex w-full flex-col gap-1">
              <div className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className="font-semibold">{item.name}</div>
                  {!item.read && (
                    <span className="flex h-2 w-2 rounded-full bg-blue-600" />
                  )}
                </div>
                <div
                  className={cn(
                    "ml-auto text-xs",
                    mail.selected === item.id
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {formatDistanceToNow(new Date(item.date), {
                    addSuffix: true,
                  })}
                </div>
              </div>
              <div className="text-xs font-medium">{item.subject}</div>
            </div>
            <div className="line-clamp-2 text-xs text-muted-foreground">
              {item.text.substring(0, 300)}
            </div>
            {item.labels.length ? (
              <div className="flex items-center gap-2">
                {item.labels.map((label) => (
                  <Badge key={label} variant={getBadgeVariantFromLabel(label)}>
                    {label}
                  </Badge>
                ))}
              </div>
            ) : null}
          </button>
        ))}
      </div>
    </ScrollArea>
 */