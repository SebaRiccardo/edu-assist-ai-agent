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
import gmailLogo from '@/assets/gmail-logo.png';
interface ConnectGmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: () => void;
  triggerButton?: React.ReactNode;
}

export function ConnectGmailDialog({
  open,
  onOpenChange,
  onConnect,
  triggerButton,
}: ConnectGmailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {triggerButton && <DialogTrigger asChild>{triggerButton}</DialogTrigger>}
      <DialogContent>
        <DialogHeader className="flex flex-row items-center gap-4">
          <div className="border p-2 rounded-lg">
            <Image src={gmailLogo} width={60} height={60} alt="Gmail Logo" />
          </div>
          <div className="flex flex-col gap-1">
            <DialogTitle>Connect Gmail Account</DialogTitle>
            <DialogDescription>
              To connect your Gmail account, you need to authorize this
              application.
            </DialogDescription>
          </div>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Click the button below to proceed to Google's authorization page. A
          new window will open where you can securely connect your account.
        </p>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={onConnect}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Open Authorization Page
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
