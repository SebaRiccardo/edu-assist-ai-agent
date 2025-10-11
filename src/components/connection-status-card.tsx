'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, X, MailWarning } from 'lucide-react';

type ConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'checking'
  | 'active'
  | 'failed'
  | 'expired';

interface ConnectionStatusCardProps {
  status: ConnectionStatus;
  onCancel: () => void;
}

const statusConfig = {
  connecting: {
    title: 'Connecting Gmail Account',
    description: 'Please complete the authorization in the popup window',
    tip: '💡 After authorizing, your Gmail account will be automatically connected.',
    icon: Loader2,
    variant: 'blue' as const,
  },
  checking: {
    title: 'Verifying Connection',
    description: 'Waiting for authorization...',
    tip: '💡 This may take a few seconds.',
    icon: Loader2,
    variant: 'blue' as const,
  },
  failed: {
    title: 'Connection Failed',
    description: 'Unable to connect to Gmail',
    tip: '⚠️ Please try again or check your permissions.',
    icon: MailWarning,
    variant: 'red' as const,
  },
  expired: {
    title: 'Connection Expired',
    description: 'Authorization session has expired',
    tip: '⚠️ Please start the connection process again.',
    icon: MailWarning,
    variant: 'amber' as const,
  },
} as const;

export function ConnectionStatusCard({
  status,
  onCancel,
}: ConnectionStatusCardProps) {
  if (status === 'idle' || status === 'active') {
    return null;
  }

  const config = statusConfig[status];
  const Icon = config.icon;

  const variantClasses = {
    blue: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20',
    red: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20',
    amber:
      'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20',
  };

  const iconClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400',
    red: 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400',
    amber:
      'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400',
  };

  const textClasses = {
    blue: 'text-blue-700 dark:text-blue-300',
    red: 'text-red-700 dark:text-red-300',
    amber: 'text-amber-700 dark:text-amber-300',
  };

  return (
    <Card className={variantClasses[config.variant]}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={`rounded-full p-2 ${iconClasses[config.variant]}`}>
            <Icon
              className={`h-5 w-5 ${status === 'connecting' || status === 'checking' ? 'animate-spin' : ''}`}
            />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">{config.title}</CardTitle>
            <CardDescription className={textClasses[config.variant]}>
              {config.description}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{config.tip}</p>
      </CardContent>
    </Card>
  );
}
