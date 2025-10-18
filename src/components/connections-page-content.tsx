'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useConnections } from '@/hooks/use-connections';
import { EmailConnectedAccountCard } from '@/components/gmail-account-card';
import { ConnectGmailDialog } from '@/components/connect-gmail-dialog';
import { ComposioConnectedAccount } from '@/app/api/connections/route';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, MailPlus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import gmailLogo from '@/assets/gmail-logo.png';
import outlookLogo from '@/assets/svg/outlook-logo.svg';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function ConnectionsPageContent() {
  const router = useRouter();
  const { data: accounts = [], isLoading, refetch } = useConnections();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDialogOpen2, setIsDialogOpen2] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnectingOutlook, setIsConnectingOutlook] = useState(false);
  const [deletingAccountId, setDeletingAccountId] = useState<string | null>(
    null
  );
  const [accountToDelete, setAccountToDelete] =
    useState<ComposioConnectedAccount | null>(null);

  const handleConnect = async (provider: string) => {
    try {
      provider === 'OUTLOOK'
        ? setIsConnectingOutlook(true)
        : setIsConnecting(true);

      const response = await fetch('/api/connections/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailProvider: provider }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate connection');
      }
      console.log(data);
      if (data.redirectUrl) {
        window.open(data.redirectUrl, '_blank');
        toast.success('Opening email authorization...', {
          description: 'Complete the authorization to connect your account.',
        });
        provider === 'OUTLOOK'
          ? setIsDialogOpen2(false)
          : setIsDialogOpen(false);

        // Start polling for new connections
        const pollInterval = setInterval(async () => {
          const result = await refetch();
          const newAccounts = result.data || [];

          // Check if we have a new account
          if (newAccounts.length > accounts.length) {
            clearInterval(pollInterval);
            toast.success('Email account connected successfully!');
          }
        }, 3000);

        // Stop polling after 5 minutes
        setTimeout(() => clearInterval(pollInterval), 300000);
      }
    } catch (error) {
      console.error('Error connecting Email:', error);
      toast.error('Failed to connect Email account', {
        description:
          error instanceof Error ? error.message : 'Please try again later.',
      });
    } finally {
      setIsConnecting(false);
      setIsConnectingOutlook(false);
    }
  };

  const handleDeleteClick = (account: ComposioConnectedAccount) => {
    setAccountToDelete(account);
  };

  const handleDeleteConfirm = async () => {
    if (!accountToDelete) return;

    try {
      setDeletingAccountId(accountToDelete.id);

      const response = await fetch('/api/connections/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ connectionId: accountToDelete.id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete connection');
      }

      toast.success('Connection deleted successfully');
      await refetch();
    } catch (error) {
      console.error('Error deleting connection:', error);
      toast.error('Failed to delete connection', {
        description:
          error instanceof Error ? error.message : 'Please try again later.',
      });
    } finally {
      setDeletingAccountId(null);
      setAccountToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-hidden mx-auto max-w-7xl w-full px-6 pt-6">
        <div className="w-full flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold">Email Connections</h1>
            <p className="text-muted-foreground">
              Manage your connected Gmail accounts. Connect new accounts or
              remove existing ones.
            </p>
          </div>

          {/* Accounts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {accounts.map(account => (
              <EmailConnectedAccountCard
                key={account.id}
                type={account.toolkitSlug}
                account={account}
                disabled={!!deletingAccountId}
                onDelete={() => handleDeleteClick(account)}
                isDeleting={deletingAccountId === account.id}
              />
            ))}

            {/* Add New Connection Card */}
            <ConnectGmailDialog
              open={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              onConnect={handleConnect}
              isLoading={isConnectingOutlook}
              type="GMAIL"
              triggerButton={
                <Card className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 gap-2 transition-all duration-150 hover:bg-red-50 border-2 hover:border-red-500 hover:border-dashed hover:shadow-md cursor-pointer border-transparent">
                  <CardHeader>
                    <div className="flex flex-col items-center gap-2">
                      <div className="">
                        <Image
                          src={gmailLogo}
                          width={40}
                          height={40}
                          alt="Gmail Logo"
                        />
                      </div>
                      <div className="flex flex-col ">
                        <span className="text-base font-semibold">
                          Connect new Gmail Account
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-center text-muted-foreground text-sm">
                      Connect a new Gmail account to manage your emails across
                      multiple courses.
                    </p>
                  </CardContent>
                  <CardFooter className="border-t-0 bg-transparent hover:bg-transparent">
                    <Button
                      className="w-full text-red-500"
                      size="sm"
                      variant="link"
                      disabled={isConnecting || !!deletingAccountId}
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <MailPlus className="mr-2 h-4 w-4" />
                          Connect Account
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              }
            />
            <ConnectGmailDialog
              open={isDialogOpen2}
              onOpenChange={setIsDialogOpen2}
              onConnect={handleConnect}
              isLoading={isConnectingOutlook}
              type="OUTLOOK"
              triggerButton={
                <Card className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60  gap-2 transition-all duration-150 hover:bg-blue-100 border-2 hover:border-blue-500 hover:border-dashed hover:shadow-md cursor-pointer border-transparent">
                  <CardHeader>
                    <div className="flex flex-col items-center gap-2">
                      <div className="">
                        <Image
                          src={outlookLogo}
                          width={40}
                          height={40}
                          alt="outlook Logo"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-base font-semibold">
                          Connect new Outlook Account
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-center text-muted-foreground text-sm">
                      Connect a new Outlook account to manage your emails across
                      multiple courses.
                    </p>
                  </CardContent>
                  <CardFooter className="border-t-0 bg-transparent hover:bg-transparent">
                    <Button
                      className="w-full "
                      size="sm"
                      variant="link"
                      disabled={isConnectingOutlook || !!deletingAccountId}
                    >
                      {isConnectingOutlook ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <MailPlus className="mr-2 h-4 w-4" />
                          Connect Account
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              }
            />
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!accountToDelete}
        onOpenChange={(open: boolean) => !open && setAccountToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Email Connection?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the connection to{' '}
              <span className="font-semibold">{accountToDelete?.email}</span>?
              This action cannot be undone and will remove access to this
              account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setAccountToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={!!deletingAccountId}
            >
              {deletingAccountId ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Connection'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
