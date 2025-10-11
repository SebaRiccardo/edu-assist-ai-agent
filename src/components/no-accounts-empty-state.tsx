'use client';

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Button } from '@/components/ui/button';
import { MailWarning, Loader2, X, Check, MailPlus } from 'lucide-react';
import { ConnectGmailDialog } from './connect-gmail-dialog';

type ConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'checking'
  | 'active'
  | 'failed'
  | 'expired';

interface NoAccountsEmptyStateProps {
  connectionStatus: ConnectionStatus;
  isDialogOpen: boolean;
  onOpenDialog: (open: boolean) => void;
  onConnect: () => void;
  onCancel: () => void;
  onRetry: () => void;
}

export function NoAccountsEmptyState({
  connectionStatus,
  isDialogOpen,
  onOpenDialog,
  onConnect,
  onCancel,
  onRetry,
}: NoAccountsEmptyStateProps) {
  return (
    <div className="flex-1 overflow-hidden mx-auto max-w-7xl w-full px-6">
      <Empty className="min-h-[40vh] border-none rounded-3xl">
        <EmptyHeader>
          <EmptyMedia className="rounded-full" variant="icon">
            <MailWarning className="size-6 text-red-500" />
          </EmptyMedia>
          <EmptyTitle>No Gmail account connected yet</EmptyTitle>
          <EmptyDescription>
            Connect your Gmail account to start analyzing emails for this
            course.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          {connectionStatus === 'connecting' ||
          connectionStatus === 'checking' ? (
            <div className="flex gap-2">
              <Button size="lg" variant="outline" disabled className="gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {connectionStatus === 'connecting'
                  ? 'Connecting...'
                  : 'Verifying...'}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={onCancel}
                className="px-4"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : connectionStatus === 'active' ? (
            <Button size="lg" disabled className="gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-green-600">Connected</span>
            </Button>
          ) : connectionStatus === 'failed' ||
            connectionStatus === 'expired' ? (
            <div className="space-y-2">
              <p className="text-sm text-destructive text-center">
                {connectionStatus === 'failed'
                  ? 'Connection failed'
                  : 'Connection expired'}
              </p>
              <Button
                size="lg"
                variant="outline"
                onClick={onRetry}
                className="gap-2"
              >
                Try Again
              </Button>
            </div>
          ) : (
            <ConnectGmailDialog
              open={isDialogOpen}
              onOpenChange={onOpenDialog}
              onConnect={onConnect}
              triggerButton={
                <Button size="lg" className="gap-2">
                  <MailPlus className="h-4 w-4" />
                  Connect Gmail Account
                </Button>
              }
            />
          )}
        </EmptyContent>
      </Empty>
    </div>
  );
}
