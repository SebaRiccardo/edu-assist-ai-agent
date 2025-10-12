'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useConnections } from '@/hooks/use-connections';
import { GmailAccountCard } from '@/components/gmail-account-card';
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
    const [isConnecting, setIsConnecting] = useState(false);
    const [deletingAccountId, setDeletingAccountId] = useState<string | null>(
        null
    );
    const [accountToDelete, setAccountToDelete] =
        useState<ComposioConnectedAccount | null>(null);

    const handleConnect = async () => {
        try {
            setIsConnecting(true);

            const response = await fetch('/api/connections/initiate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ courseId: 'settings' }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to initiate connection');
            }

            if (data.redirectUrl) {
                window.open(data.redirectUrl, '_blank');
                toast.success('Opening Gmail authorization...', {
                    description: 'Complete the authorization to connect your account.',
                });
                setIsDialogOpen(false);

                // Start polling for new connections
                const pollInterval = setInterval(async () => {
                    const result = await refetch();
                    const newAccounts = result.data || [];

                    // Check if we have a new account
                    if (newAccounts.length > accounts.length) {
                        clearInterval(pollInterval);
                        toast.success('Gmail account connected successfully!');
                    }
                }, 3000);

                // Stop polling after 5 minutes
                setTimeout(() => clearInterval(pollInterval), 300000);
            }
        } catch (error) {
            console.error('Error connecting Gmail:', error);
            toast.error('Failed to connect Gmail account', {
                description:
                    error instanceof Error ? error.message : 'Please try again later.',
            });
        } finally {
            setIsConnecting(false);
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
                        <h1 className="text-3xl font-bold">Gmail Connections</h1>
                        <p className="text-muted-foreground">
                            Manage your connected Gmail accounts. Connect new accounts or
                            remove existing ones.
                        </p>
                    </div>

                    {/* Accounts Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {accounts.map(account => (
                            <div key={account.id} className="relative">
                                <GmailAccountCard
                                    account={account}
                                    disabled={!!deletingAccountId}
                                    onDelete={() => handleDeleteClick(account)}
                                    isDeleting={deletingAccountId === account.id}
                                />
                            </div>
                        ))}

                        {/* Add New Connection Card */}
                        <ConnectGmailDialog
                            open={isDialogOpen}
                            onOpenChange={setIsDialogOpen}
                            onConnect={handleConnect}
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
                                            Connect a new Gmail account to manage your emails across
                                            multiple accounts.
                                        </p>
                                    </CardContent>
                                    <CardFooter className="border-t-0 bg-transparent hover:bg-transparent">
                                        <Button
                                            className="w-full"
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
                    </div>

                    {/* Empty State */}
                    {accounts.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <div className="text-center">
                                <h3 className="text-lg font-semibold mb-2">
                                    No Gmail accounts connected
                                </h3>
                                <p className="text-muted-foreground mb-6">
                                    Connect your first Gmail account to get started with email
                                    management.
                                </p>
                                <Button onClick={() => setIsDialogOpen(true)}>
                                    <MailPlus className="mr-2 h-4 w-4" />
                                    Connect Gmail Account
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={!!accountToDelete}
                onOpenChange={(open: boolean) => !open && setAccountToDelete(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Gmail Connection?</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the connection to{' '}
                            <span className="font-semibold">{accountToDelete?.email}</span>?
                            This action cannot be undone and will remove access to this
                            account.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setAccountToDelete(null)}
                        >
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
