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
import { Plus, ExternalLink, Loader2, InfoIcon } from 'lucide-react';
import { ComposioConnectedAccount } from '@/app/api/connections/route';
import Image from 'next/image';
import gmailLoco from '@/assets/gmail-logo.png';

interface GmailAccountCardProps {
  account: ComposioConnectedAccount;
  onAdd?: (account: ComposioConnectedAccount) => void;
  isAdding?: boolean;
  disabled?: boolean;
}

export function GmailAccountCard({
  account,
  onAdd,
  isAdding,
  disabled,
}: GmailAccountCardProps) {
  const isActive = account.status === 'ACTIVE';
  const hasUserInfo = account.email;

  // Inactive account - needs authorization
  if (!isActive || !hasUserInfo) {
    return (
      <Card className="min-w-[350px] max-w-[350] hover:shadow-md transition-shadow gap-4">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="border p-1 rounded-lg">
                <Image
                  src={gmailLoco}
                  width={30}
                  height={30}
                  alt="Gmail Logo"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-base font-semibold">Gmail Account</span>
                <span className="text-sm truncate text-red-500">
                  Authorization required
                </span>
              </div>
            </div>
            <Badge variant="success">{account.status}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-1">
            {/* <div className='flex flex-row items-center gap-1'>
                            <InfoIcon className='size-4 text-red-500' />
                            <p className="text-base  truncate font-medium text-red-500">Authorization required</p>
                        </div> */}
            <p className="text-left text-muted-foreground text-sm ">
              Complete the authorization to activate this account.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            size="sm"
            variant="outline"
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
    <Card className="min-w-[380px] max-w-[380px] hover:shadow-md transition-shadow gap-4">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="border p-2 rounded-lg">
              <Image src={gmailLoco} width={30} height={30} alt="Gmail Logo" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-semibold">Gmail Account</span>
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
        <p className="text-left text-muted-foreground text-sm">
          Use this email account to analyze course emails.
        </p>
      </CardContent>
      <CardFooter className="">
        {onAdd ? (
          <Button
            className="w-full"
            size="sm"
            onClick={() => onAdd(account)}
            disabled={disabled || isAdding}
          >
            {isAdding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add to Course
              </>
            )}
          </Button>
        ) : (
          <div className="text-xs text-center w-full text-muted-foreground">
            Already added to this course
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
