'use client';

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Mail,
  MoreVertical,
  Tag,
  Archive,
  Trash2,
  ExternalLink,
  CheckCircle,
} from 'lucide-react';

interface EmailCardProps {
  email: CategorizedEmail;
  onMarkAsRead?: (emailId: string) => void;
  onArchive?: (emailId: string) => void;
  onDelete?: (emailId: string) => void;
}

const emailTypeConfig = {
  student_question: {
    label: 'Student Question',
    variant: 'info' as const,
    icon: '❓',
  },
  professor_inquiry: {
    label: 'Professor Inquiry',
    variant: 'warning' as const,
    icon: '👨‍🏫',
  },
  general: {
    label: 'General',
    variant: 'secondary' as const,
    icon: '📧',
  },
  administrative: {
    label: 'Administrative',
    variant: 'outline' as const,
    icon: '📋',
  },
};

export function EmailCard({
  email,
  onMarkAsRead,
  onArchive,
  onDelete,
}: EmailCardProps) {
  const typeConfig = emailTypeConfig[email.emailType];
  const confidencePercentage = Math.round(email.confidence * 100);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base font-semibold">
                {email.subject}
              </CardTitle>
              {email.isUnread && (
                <Badge variant="default" className="ml-2">
                  New
                </Badge>
              )}
            </div>
            <CardDescription className="text-sm">
              From: {email.from}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">More actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {email.isUnread && onMarkAsRead && (
                <DropdownMenuItem onClick={() => onMarkAsRead(email.id)}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark as read
                </DropdownMenuItem>
              )}
              <DropdownMenuItem>
                <ExternalLink className="mr-2 h-4 w-4" />
                Open in Gmail
              </DropdownMenuItem>
              {onArchive && (
                <DropdownMenuItem onClick={() => onArchive(email.id)}>
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(email.id)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {email.snippet}
        </p>

        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-1">
            <Tag className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Labels:</span>
          </div>
          <Badge variant="success">{email.courseName}</Badge>
          <Badge variant={typeConfig.variant}>
            <span className="mr-1">{typeConfig.icon}</span>
            {typeConfig.label}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {confidencePercentage}% confidence
          </Badge>
        </div>

        <div className="pt-2 text-xs text-muted-foreground">
          {new Date(email.receivedAt).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}
