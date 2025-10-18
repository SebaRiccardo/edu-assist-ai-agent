'use client';

import {
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty';
import { Button } from '@/components/ui/button';
import { IconMailSpark } from '@tabler/icons-react';
import { MailPlus } from 'lucide-react';
import { EmailConnectedAccountCard } from './gmail-account-card';
import { ConnectGmailDialog } from './connect-gmail-dialog';
import { ComposioConnectedAccount } from '@/app/api/connections/route';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import Image from 'next/image';
import gmailLogo from '@/assets/gmail-logo.png';

interface AddInboxSectionProps {
  accounts: ComposioConnectedAccount[];
  isDialogOpen: boolean;
  onOpenDialog: (open: boolean) => void;
  onConnect: () => void;
  onAddAccount: (account: ComposioConnectedAccount) => void;
  isAddingAccount: boolean;
  addingAccountId?: string | null;
}

export function AddInboxSection({
  accounts,
  isDialogOpen,
  onOpenDialog,
  onConnect,
  onAddAccount,
  isAddingAccount,
  addingAccountId,
}: AddInboxSectionProps) {
  return (
    <div className="flex-1 overflow-hidden mx-auto max-w-7xl w-full px-6 pt-6">
      <div className="w-full flex flex-col justify-center items-center gap-6">
        <EmptyHeader>
          <EmptyTitle>Add an Inbox to the Course</EmptyTitle>
          <EmptyDescription>
            Select one of your connected Gmail accounts to add it to this
            course.
          </EmptyDescription>
        </EmptyHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {accounts.map(account => (
            <EmailConnectedAccountCard
              key={account.id}
              account={account}
              onAdd={onAddAccount}
              isAdding={isAddingAccount && addingAccountId === account.id}
            />
          ))}
          <ConnectGmailDialog
            open={isDialogOpen}
            onOpenChange={onOpenDialog}
            onConnect={onConnect}
            triggerButton={
              <Card className="min-w-[380px] max-w-[380px] gap-2 bg-blue-100 border-2 border-blue-500 border-dashed hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex flex-col items-center gap-4">
                    <div className="">
                      <Image
                        src={gmailLogo}
                        width={30}
                        height={30}
                        alt="Gmail Logo"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-base font-semibold">
                        Connect new Gmail Account
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-center text-muted-foreground text-sm">
                    Connect a new Gmail account to add an inbox to this course.
                  </p>
                </CardContent>
                <CardFooter className="border-t-0 bg-transparent hover:bg-transparent">
                  <Button
                    className="w-full"
                    size="sm"
                    variant="link"
                    disabled={!!addingAccountId}
                  >
                    <MailPlus className="mr-2 h-4 w-4" />
                    Connect Account
                  </Button>
                </CardFooter>
              </Card>
            }
          />
        </div>
      </div>
    </div>
  );
}
