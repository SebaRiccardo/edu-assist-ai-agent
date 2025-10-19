'use client';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Loader2, Trash2, Unlink } from 'lucide-react';
import { ComposioConnectedAccount } from '@/app/api/connections/route';
import Image from 'next/image';
import gmailLogo from '@/assets/svg/gmail.svg';
import outlookLogo from '@/assets/svg/outlook-logo.svg';

interface EmailConnectedAccountCardProps {
  account: ComposioConnectedAccount;
  onAdd?: (account: ComposioConnectedAccount) => void;
  isAdding?: boolean;
  disabled?: boolean;
  isDeleting?: boolean;
  onDelete?: (account: ComposioConnectedAccount) => void;
  type: string;
}

const CARD_STYLES =
  'h-full min-h-[150px] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-150 hover:shadow-md cursor-pointer border-transparent';

const getProviderLogo = (type: string) => (type === 'gmail' ? gmailLogo : outlookLogo);

const getAccountTitle = (type: string) => (type === 'GMAIL' ? 'Gmail Account' : 'Outlook Account');

const getBadgeVariant = (status: string) => {
  if (status === 'ACTIVE') return 'success';
  if (status === 'INITIATED') return 'warning';
  return 'outline';
};

export function EmailConnectedAccountCard({ account, isDeleting, onDelete, type }: EmailConnectedAccountCardProps) {
  const isActive = account.status === 'ACTIVE';
  const providerLogo = getProviderLogo(type);

  const handleDelete = () => onDelete?.(account);
  const handleAuthorize = () => account.redirectUrl && window.open(account.redirectUrl, '_blank');

  if (!isActive) {
    return (
      <Card className={CARD_STYLES}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="border p-1 rounded-lg">
                <Image src={providerLogo} width={40} height={40} alt="Provider Logo" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-base font-semibold">Email Account</span>
                <span className="text-sm truncate text-red-500">Authorization required</span>
              </div>
            </div>
            <Badge variant={getBadgeVariant(account.status)}>{account.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-1">
          <p className="text-left text-muted-foreground text-base">Complete the authorization to activate this account.</p>
        </CardContent>
        <CardFooter className="flex-1 gap-2">
          <Button size="sm" variant="destructive" disabled={!account.redirectUrl} onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
          <Button size="sm" className="flex-1" disabled={!account.redirectUrl} onClick={handleAuthorize}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Complete Authorization
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className={CARD_STYLES}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="border p-1 rounded-lg">
              <Image src={providerLogo} width={40} height={40} alt={`${type} Logo`} />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-semibold">{getAccountTitle(type)}</span>
              <span className="text-sm truncate text-muted-foreground max-w-[230px]">{account.email}</span>
            </div>
          </div>
          <Badge variant={getBadgeVariant(account.status)}>{account.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-left text-muted-foreground text-base">Use this email account to analyze course emails.</p>
      </CardContent>
      <CardFooter className="flex-1">
        {onDelete && (
          <Button variant="link" className="w-full text-red-500" size="sm" onClick={handleDelete}>
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlink className="h-4 w-4" />}
            Desconectar cuenta
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
