'use client';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, MailPlus } from 'lucide-react';
import Image from 'next/image';
import outlookLogo from '@/assets/svg/outlook-logo.svg';
import gmailLogo from '@/assets/svg/gmail.svg';
import { Loader } from './ai-elements/loader';

type EmailProvider = 'GMAIL' | 'OUTLOOK';

interface ConnectGmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (provider: EmailProvider) => void;
  triggerButton?: React.ReactNode;
  type: EmailProvider;
  isLoading: boolean;
}

export function ConnectGmailDialog({ open, onOpenChange, onConnect, triggerButton, type, isLoading }: ConnectGmailDialogProps) {
  const handleConnect = () => {
    onConnect(type);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {triggerButton && <DialogTrigger asChild>{triggerButton}</DialogTrigger>}
      <DialogContent>
        <DialogHeader className="flex flex-row items-center gap-4">
          <div className="border p-2 rounded-lg">
            <Image src={type === 'GMAIL' ? gmailLogo : outlookLogo} width={60} height={60} alt="Email Logo" />
          </div>
          <div className="flex flex-col gap-1">
            <DialogTitle>Connect {type === 'GMAIL' ? 'Gmail' : 'Outlook'} Account</DialogTitle>
            <DialogDescription>
              To connect your {type === 'GMAIL' ? 'Gmail' : 'Outlook'} account, you need to authorize this application.
            </DialogDescription>
          </div>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Click the button below to proceed to {type === 'GMAIL' ? "Google's" : "Microsoft's"} authorization page. A new window will open where you
          can securely connect your account.
        </p>
        <DialogFooter>
          <Button type="button" onClick={handleConnect}>
            {isLoading ? (
              <Loader />
            ) : (
              <div className="flex gap-1 items-center">
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Authorization Page
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
