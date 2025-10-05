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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Mail,
  MoreVertical,
  Tag,
  Archive,
  Trash2,
  ExternalLink,
  CheckCircle,
  Star,
  Sparkles,
  ChevronsUpDown,
} from 'lucide-react';

interface EmailCardProps {
  email: CategorizedEmail;
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

export function EmailCard({
  email,
  onMarkAsRead,
  onArchive,
  onDelete,
  onAutoReply,
}: EmailCardProps) {
  const categoryConfig = emailCategoryConfig[email.category as keyof typeof emailCategoryConfig];
  const confidencePercentage = Math.round(email.confidence * 100);

  return (
    <Card className=" hover:shadow-xl hover:scale-120 cursor-pointer 
                      transition-all duration-200 bg-background/80 
                      backdrop-blur supports-[backdrop-filter]:bg-background/60 
                      border-none shadow-none hover:bg-background/70
                      ">
      <CardHeader className="">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-1">
            <div className="flex items-end gap-2">
              <Mail className="text-red-500 size-6" />
              <CardTitle className="text-base font-semibold">
                {email.subject}
              </CardTitle>

              {categoryConfig &&
                <Badge variant={categoryConfig.variant}>
                  {categoryConfig.label}
                </Badge>
              }

              {email.isUnread && (
                <Badge variant="default">
                  New
                </Badge>
              )}


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
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {email.snippet}
        </p>

        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-1">
            <Tag className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Labels:</span>
          </div>
          <Badge variant="success">{email.suggestedLabel}</Badge>
        </div>
        <Collapsible className="w-full">
          <div className="flex items-center gap-2 pt-2">
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
            <Button variant="link" size="sm">
              <ExternalLink className="h-4 w-4 mr-1" />
              Open on Gmail
            </Button>
          </div>

          <CollapsibleContent className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden transition-all duration-300">
            <div className="mt-3 rounded-lg border bg-background/50 p-4">
              <div className="flex items-start gap-2">
                <div className="space-y-2">
                  <div className='flex items-center gap-2'>
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
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
