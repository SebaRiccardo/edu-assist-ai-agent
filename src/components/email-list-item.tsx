'use client';

import { CategorizedEmail } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmailListItemProps {
  email: CategorizedEmail;
  isSelected: boolean;
  isSendingReply: boolean;
  onClick: () => void;
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

export function EmailListItem({
  email,
  isSelected,
  isSendingReply,
  onClick,
  onAutoReply,
}: EmailListItemProps) {
  const categoryConfig =
    emailCategoryConfig[email.category as keyof typeof emailCategoryConfig];

  return (
    <div
      className={cn(
        'bg-red-300 group relative flex flex-col gap-2 border-b border-border p-4 cursor-pointer transition-all hover:bg-muted/80',
        isSelected && 'bg-muted/70 border-l-4 border-l-primary'
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
              <span
                className={cn(
                  'text-sm truncate',
                  email.isUnread ? 'font-semibold' : 'font-medium'
                )}
              >
                {email.from}
              </span>
              {email.isUnread && (
                <Badge variant="default" className="text-xs px-1 py-0">
                  New
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


      <div className='flex items-center gap-2'>
        <span
          className={cn(
            'text-sm truncate',
            email.isUnread ? 'font-medium' : 'font-normal'
          )}
        >
          {email.subject}
        </span>

        <span className="text-xs text-muted-foreground line-clamp-2">
          {email.snippet}
        </span>
      </div>

      {/* Badges and Actions Row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {categoryConfig && (
            <Badge variant={categoryConfig.variant} className="text-xs">
              {categoryConfig.icon} {categoryConfig.label}
            </Badge>
          )}
          <Badge variant="success" className="text-xs">
            {email.suggestedLabel}
          </Badge>
        </div>
        <Button
          size="sm"
          onClick={e => {
            e.stopPropagation();
            onAutoReply(email.id);
          }}
          disabled={isSendingReply}
          className="h-7 text-xs"
        >
          {isSendingReply ? (
            <>
              <Loader2 className="size-3 mr-1 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Mail className="size-3 mr-1" />
              Auto Reply
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
