'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useConnections } from '@/hooks/use-connections';
import { useInitiateConnection, useDeleteConnection } from '@/hooks/mutations/use-connection-mutations';
import { EmailConnectedAccountCard } from '@/components/gmail-account-card';
import { ConnectEmailDialog } from '@/components/connect-email-dialog';
import { AddConnectionCard } from '@/components/add-connection-card';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';
import { ComposioConnectedAccount } from '@/app/api/connections/route';
import { Loader2 } from 'lucide-react';
import gmailLogo from '@/assets/gmail-logo.png';
import outlookLogo from '@/assets/svg/outlook-logo.svg';

type EmailProvider = 'GMAIL' | 'OUTLOOK';

interface ConnectionDialogState {
  gmail: boolean;
  outlook: boolean;
}

export function ConnectionsPageContent() {
  const t = useTranslations('Connections');
  const { data: accounts = [], isLoading } = useConnections();
  const initiateConnection = useInitiateConnection();
  const deleteConnection = useDeleteConnection();

  const [dialogOpen, setDialogOpen] = useState<ConnectionDialogState>({
    gmail: false,
    outlook: false,
  });
  const [accountToDelete, setAccountToDelete] = useState<ComposioConnectedAccount | null>(null);

  const handleConnect = async (provider: EmailProvider) => {
    initiateConnection.mutate(
      { emailProvider: provider },
      {
        onSuccess: () => {
          setDialogOpen(prev => ({
            ...prev,
            [provider.toLowerCase() as keyof ConnectionDialogState]: false,
          }));
        },
      }
    );
  };

  const handleDeleteClick = (account: ComposioConnectedAccount) => {
    setAccountToDelete(account);
  };

  const handleDeleteConfirm = () => {
    if (!accountToDelete) return;

    deleteConnection.mutate(
      { connectionId: accountToDelete.id },
      {
        onSuccess: () => {
          setAccountToDelete(null);
        },
      }
    );
  };

  const toggleDialog = (provider: keyof ConnectionDialogState) => {
    setDialogOpen(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isAnyMutating = initiateConnection.isPending || deleteConnection.isPending;

  return (
    <>
      <div className="flex-1 overflow-hidden w-full">
        <div className="w-full flex flex-col gap-6">

          {/* Accounts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {accounts.map(account => (
              <EmailConnectedAccountCard
                key={account.id}
                type={account.toolkitSlug}
                account={account}
                disabled={isAnyMutating}
                onDelete={handleDeleteClick}
                isDeleting={deleteConnection.isPending && accountToDelete?.id === account.id}
              />
            ))}

            {/* Gmail Connection Card */}
            <ConnectEmailDialog
              open={dialogOpen.gmail}
              onOpenChange={() => toggleDialog('gmail')}
              onConnect={handleConnect}
              isLoading={initiateConnection.isPending}
              type="GMAIL"
              triggerButton={
                <AddConnectionCard
                  logo={gmailLogo}
                  title={t('connectGmailTitle')}
                  description={t('connectGmailDescription')}
                  isLoading={initiateConnection.isPending && initiateConnection.variables?.emailProvider === 'GMAIL'}
                  disabled={isAnyMutating}
                  onClick={() => toggleDialog('gmail')}
                  hoverColor="red"
                />
              }
            />

            {/* Outlook Connection Card */}
            <ConnectEmailDialog
              open={dialogOpen.outlook}
              onOpenChange={() => toggleDialog('outlook')}
              onConnect={handleConnect}
              isLoading={initiateConnection.isPending}
              type="OUTLOOK"
              triggerButton={
                <AddConnectionCard
                  logo={outlookLogo}
                  title={t('connectOutlookTitle')}
                  description={t('connectOutlookDescription')}
                  isLoading={initiateConnection.isPending && initiateConnection.variables?.emailProvider === 'OUTLOOK'}
                  disabled={isAnyMutating}
                  onClick={() => toggleDialog('outlook')}
                  hoverColor="blue"
                />
              }
            />
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={!!accountToDelete}
        onOpenChange={open => !open && setAccountToDelete(null)}
        email={accountToDelete?.email}
        isDeleting={deleteConnection.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
