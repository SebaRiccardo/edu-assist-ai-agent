'use client';

import { CategorizedEmail } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Loader2, Tags } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IconLabel, IconMailSpark } from '@tabler/icons-react';

interface EmailListItemProps {
  email: CategorizedEmail;
  isSelected: boolean;
  isSendingReply: boolean;
  onClick: () => void;
  onAutoReply?: (emailId: string) => void;
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

export function EmailListItem({ email, isSelected, isSendingReply, onClick, onAutoReply }: EmailListItemProps) {
  const categoryConfig = emailCategoryConfig[email.category as keyof typeof emailCategoryConfig];

  return (
    <div
      className={cn(
        'group relative flex flex-col gap-2 border-l-4 hover:border-l-primary border-l-trasparent border-b p-4 cursor-pointer transition-all hover:bg-muted/80',
        isSelected && 'bg-muted/70 border-l-primary'
      )}
      onClick={onClick}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* <Mail
            className={cn(
              'size-4 flex-shrink-0',
              email.isUnread ? 'text-red-500' : 'text-muted-foreground'
            )}
          /> */}
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={cn('text-sm truncate', email.isUnread ? 'font-semibold' : 'font-medium')}>{email.from.split('<')[0]}</span>
              <span className={cn('text-xs text-muted-foreground truncate')}>{`<${email.from.split('<')[1]}`}</span>
              {/* {email.isUnread && (
                <Badge variant="default" className="text-xs px-1 py-0">
                  New
                </Badge>
              )} */}
              {categoryConfig && (
                <Badge variant={categoryConfig.variant} className="text-xs">
                  {categoryConfig.icon} {categoryConfig.label}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {new Date(email.receivedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <span className={cn('text-xs truncate', email.isUnread ? 'font-semibold' : 'font-normal')}>{email.subject}</span>
        <span className="text-gray-200">-</span>
        <span className="text-xs text-muted-foreground max-w-sm truncate">{email.snippet}</span>
      </div>

      {/* Badges and Actions Row */}
      <div className="flex items-end justify-between gap-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 flex-wrap">
            <Tags className="text-muted-foreground size-3" />
            <span className="text-xs text-muted-foreground italic">Etiquetas sugeridas:</span>
          </div>
          <Badge variant="success" className="text-xs">
            {email.suggestedLabel}
          </Badge>
        </div>
        {onAutoReply && (
          <Button
            size="sm"
            onClick={e => {
              e.stopPropagation();
              onAutoReply(email.id);
            }}
            disabled={isSendingReply}
            className="h-7 text-xs cursor-pointer shadow-none"
          >
            {isSendingReply ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <IconMailSpark className="size-5 " />
                Auto Reply
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
