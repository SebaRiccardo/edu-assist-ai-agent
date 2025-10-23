'use client';

import { CategorizedEmail, CategorizedEmailWithPriority } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Loader2, Tags, AlertCircle, AlertTriangle, Clock, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IconLabel, IconMailSpark } from '@tabler/icons-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { enUS } from 'date-fns/locale/en-US';

interface EmailListItemProps {
  email: CategorizedEmail | CategorizedEmailWithPriority;
  isSelected: boolean;
  isSendingReply: boolean;
  onClick: () => void;
  onAutoReply?: (emailId: string) => void;
  locale?: 'es' | 'en';
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

const priorityConfig = {
  critical: {
    icon: AlertCircle,
    className: 'text-red-600 dark:text-red-400',
  },
  high: {
    icon: AlertTriangle,
    className: 'text-orange-600 dark:text-orange-400',
  },
  medium: {
    icon: Clock,
    className: 'text-blue-600 dark:text-blue-400',
  },
  low: {
    icon: Info,
    className: 'text-gray-600 dark:text-gray-400',
  },
};

export function EmailListItem({ locale, email, isSelected, isSendingReply, onClick, onAutoReply }: EmailListItemProps) {
  const categoryConfig = emailCategoryConfig[email.category as keyof typeof emailCategoryConfig];
  const hasPriority = 'priority' in email && email.priority;
  const priorityInfo = hasPriority ? priorityConfig[email.priority.level as keyof typeof priorityConfig] : null;


  return (
    <button
      key={email.id}
      className={cn(
        "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent",
        isSelected && "bg-muted"
      )}
      onClick={onClick}
    >
      <div className="flex w-full flex-col gap-1">
        <div className="flex items-center">
          <div className="flex items-center gap-2">
            <div className="font-semibold">{email.from}</div>
            {!email.isUnread && (
              <span className="flex h-2 w-2 rounded-full bg-blue-600" />
            )}
          </div>
          <div
            className={cn(
              "ml-auto text-xs flex items-center gap-2",
              isSelected
                ? "text-foreground"
                : "text-muted-foreground"
            )}
          >

            {priorityInfo && (
              <priorityInfo.icon className={cn('h-4 w-4', priorityInfo.className)} />
            )}
            {formatDistanceToNow(new Date(email.receivedAt), {
              addSuffix: false,
              locale: locale === 'es' ? es : enUS,
            })}
          </div>
        </div>
        <div className="text-xs font-medium">{email.subject}</div>
      </div>
      <div className="line-clamp-2 text-xs text-muted-foreground">
        {email.snippet.substring(0, 300)}
      </div>
      {
        email.labels.length ? (
          <div className="flex items-center gap-2">
            {email.labels.map((label) => (
              <Badge key={label} >
                {label}
              </Badge>
            ))}
          </div>
        ) : null
      }
    </button >
  )
  // return (
  //   <div
  //     className={cn(
  //       'group relative flex flex-col gap-2 border-l-4 hover:border-l-primary border-l-trasparent border-b p-4 cursor-pointer transition-all hover:bg-muted/80',
  //       isSelected && 'bg-muted/70 border-l-primary'
  //     )}
  //     onClick={onClick}
  //   >
  //     {/* Header Row */}
  //     <div className="flex items-start justify-between gap-2">
  //       <div className="flex items-center gap-2 flex-1 min-w-0">
  //         {/* <Mail
  //           className={cn(
  //             'size-4 flex-shrink-0',
  //             email.isUnread ? 'text-red-500' : 'text-muted-foreground'
  //           )}
  //         /> */}
  //         <div className="flex flex-col gap-1 flex-1 min-w-0">
  //           <div className="flex items-center gap-2">
  //             <span className={cn('text-sm truncate', email.isUnread ? 'font-semibold' : 'font-medium')}>{email.from.split('<')[0]}</span>
  //             <span className={cn('text-xs text-muted-foreground truncate')}>{`<${email.from.split('<')[1]}`}</span>
  //             {/* {email.isUnread && (
  //               <Badge variant="default" className="text-xs px-1 py-0">
  //                 New
  //               </Badge>
  //             )} */}
  //             {categoryConfig && (
  //               <Badge variant={categoryConfig.variant} className="text-xs">
  //                 {categoryConfig.icon} {categoryConfig.label}
  //               </Badge>
  //             )}
  //           </div>
  //         </div>
  //       </div>

  //       <div className="flex flex-col items-end gap-1 flex-shrink-0">
  //         <div className="flex items-center gap-2">
  //           {priorityInfo && (
  //             <priorityInfo.icon className={cn('h-4 w-4', priorityInfo.className)} />
  //           )}
  //           <span className="text-xs text-muted-foreground whitespace-nowrap">
  //             {new Date(email.receivedAt).toLocaleDateString('en-US', {
  //               month: 'short',
  //               day: 'numeric',
  //             })}
  //           </span>
  //         </div>
  //       </div>
  //     </div>

  //     <div className="flex items-center gap-1">
  //       <span className={cn('text-xs truncate', email.isUnread ? 'font-semibold' : 'font-normal')}>{email.subject}</span>
  //       <span className="text-gray-200">-</span>
  //       <span className="text-xs text-muted-foreground max-w-sm truncate">{email.snippet}</span>
  //     </div>

  //     {/* Badges and Actions Row */}
  //     <div className="flex items-end justify-between gap-2">
  //       <div className="flex flex-col gap-1">
  //         <div className="flex items-center gap-1 flex-wrap">
  //           <Tags className="text-muted-foreground size-3" />
  //           <span className="text-xs text-muted-foreground italic">Etiquetas sugeridas:</span>
  //         </div>
  //         <Badge variant="success" className="text-xs">
  //           {email.suggestedLabel}
  //         </Badge>
  //       </div>
  //       {onAutoReply && (
  //         <Button
  //           size="sm"
  //           onClick={e => {
  //             e.stopPropagation();
  //             onAutoReply(email.id);
  //           }}
  //           disabled={isSendingReply}
  //           className="h-7 text-xs cursor-pointer shadow-none"
  //         >
  //           {isSendingReply ? (
  //             <>
  //               <Loader2 className="size-4 animate-spin" />
  //               Sending...
  //             </>
  //           ) : (
  //             <>
  //               <IconMailSpark className="size-5 " />
  //               Auto Reply
  //             </>
  //           )}
  //         </Button>
  //       )}
  //     </div>
  //   </div>
  // );
}
