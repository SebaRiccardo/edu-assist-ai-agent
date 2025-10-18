'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  ExternalLink,
  Loader2,
  InfoIcon,
  Trash2,
  Unlink,
} from 'lucide-react';
import { ComposioConnectedAccount } from '@/app/api/connections/route';
import Image from 'next/image';
import gmailLogo from '@/assets/gmail-logo.png';
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

export function EmailConnectedAccountCard({
  account,
  onAdd,
  isAdding,
  isDeleting,
  onDelete,
  disabled,
  type,
}: EmailConnectedAccountCardProps) {
  const isActive = account.status === 'ACTIVE';
  const hasUserInfo = account.email;

  // Inactive account - needs authorization
  if (!isActive) {
    return (
      <Card
        className="h-full min-h-[150px] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 
                   transition-all duration-150 hover:shadow-md cursor-pointer border-transparent"
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="border p-1 rounded-lg">
                <Image
                  src={type === 'GMAIL' ? gmailLogo : outlookLogo}
                  width={40}
                  height={40}
                  alt="provider Logo"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-base font-semibold">Email Account</span>
                <span className="text-sm truncate text-red-500">
                  Authorization required
                </span>
              </div>
            </div>
            <Badge
              variant={account.status === 'INITIATED' ? 'warning' : 'outline'}
            >
              {account.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-1 ">
          <div className="flex flex-1 flex-col gap-1">
            {/* <div className='flex flex-row items-center gap-1'>
                            <InfoIcon className='size-4 text-red-500' />
                            <p className="text-base  truncate font-medium text-red-500">Authorization required</p>
                        </div> */}
            <p className="text-left text-muted-foreground text-base">
              Complete the authorization to activate this account.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex-1 gap-2 ">
          <Button
            size="sm"
            variant="destructive"
            disabled={!account.redirectUrl}
            onClick={onDelete && (() => onDelete(account))}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
          <Button
            size="sm"
            className="flex-1"
            disabled={!account.redirectUrl}
            onClick={() => window.open(account.redirectUrl, '_blank')}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Complete Authorization
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Active account with user info
  return (
    <Card
      className="h-full min-h-[150px] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 
                 transition-all duration-150 hover:shadow-md cursor-pointer border-transparent"
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="border p-1 rounded-lg">
              <Image
                src={type === 'GMAIL' ? gmailLogo : outlookLogo}
                width={40}
                height={40}
                alt="Gmail Logo"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-semibold">
                {type === 'GMAIL' ? 'Gmail Account' : 'Outlook Account'}
              </span>
              <span className="text-sm truncate text-muted-foreground max-w-[230px]">
                {account.email}
              </span>
            </div>
          </div>
          <Badge variant="success">{account.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        {/* <Avatar className="h-12 w-12 border-2 border-border">
                    <AvatarImage src={account.avatarUrl} alt={account.name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {account.name?.charAt(0)?.toUpperCase() || account.email?.charAt(0)?.toUpperCase() || '?'}
                    </AvatarFallback>
                </Avatar> */}
        <p className="text-left text-muted-foreground text-base">
          Use this email account to analyze course emails.
        </p>
      </CardContent>
      <CardFooter className="flex-1">
        {onDelete && (
          <Button
            variant="link"
            className="w-full text-red-500"
            size="sm"
            onClick={onDelete ? () => onDelete(account) : undefined}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Unlink className="h-4 w-4" />
            )}
            Desconectar cuenta
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
