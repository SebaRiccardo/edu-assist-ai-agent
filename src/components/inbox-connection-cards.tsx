'use client';

import { cn } from '@/lib/utils';
import { CheckCircle2, Mail } from 'lucide-react';
import { Card } from '@/components/ui/card';
import Image from 'next/image';

interface ConnectedInbox {
  id: string;
  email: string;
  name?: string;
  status: string;
  avatarUrl?: string;
  createdAt: string;
}

interface InboxConnectionCardsProps {
  inboxes: ConnectedInbox[];
  selectedInbox?: string;
  onSelectInbox: (inboxId: string) => void;
}

export function InboxConnectionCards({ inboxes, selectedInbox, onSelectInbox }: InboxConnectionCardsProps) {
  return (
    <div className="w-full mb-6">
      <div className="flex items-center gap-2 mb-2">
        <Mail className="size-4 text-muted-foreground" />
        <h2 className="text-md font-semibold">Your accounts</h2>
        <span className="text-sm text-muted-foreground">({inboxes.length})</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {inboxes.map(inbox => {
          const isSelected = selectedInbox === inbox.id;
          const isActive = inbox.status === 'ACTIVE';
          const avatar = inbox.avatarUrl;
          return (
            <Card
              key={inbox.id}
              onClick={() => isActive && onSelectInbox(inbox.id)}
              className={cn(
                'relative cursor-pointer transition-all duration-300 group w-full',
                'border-2 p-4',
                isSelected
                  ? 'border-primary scale-105  ring-2 ring-primary/20 hover:shadow-xl'
                  : 'border-border hover:border-primary/50 hover:shadow-md hover:scale-[1.02]',
                !isActive && 'opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-none'
              )}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 z-10 animate-in zoom-in duration-300">
                  <CheckCircle2 className="h-6 w-6 text-primary fill-background" />
                </div>
              )}

              <div className="flex items-center gap-3">
                {/* Gmail Logo */}
                <div
                  className={cn(
                    'flex-shrink-0 border size-9 rounded-md flex items-center justify-center transition-all duration-300',
                    isSelected ? 'scale-110 bg-white' : 'bg-muted/50 group-hover:bg-muted group-hover:scale-105'
                  )}
                >
                  <Image
                    src="/assets/gmail-logo.svg"
                    alt="Gmail"
                    width={22}
                    height={22}
                    className={cn('transition-all duration-300', isSelected ? 'drop-shadow-md' : 'opacity-90 group-hover:opacity-100')}
                  />
                </div>

                {/* Account Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3
                      className={cn('font-semibold text-sm truncate transition-colors duration-300', isSelected ? 'text-primary' : 'text-foreground')}
                    >
                      {inbox.name || 'Gmail Account'}
                    </h3>
                  </div>
                  <p className={cn('text-xs truncate transition-colors duration-300', isSelected ? 'text-primary/80' : 'text-muted-foreground')}>
                    {inbox.email}
                  </p>
                </div>
                {/* status badge*/}
                {/* <div className="flex items-center gap-2">
                                    <span
                                        className={cn(
                                            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors duration-300',
                                            isActive
                                                ? isSelected
                                                    ? 'bg-primary/20 text-primary'
                                                    : 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                'w-1.5 h-1.5 rounded-full',
                                                isActive
                                                    ? 'bg-green-500 animate-pulse'
                                                    : 'bg-gray-400'
                                            )}
                                        />
                                        {isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div> */}
              </div>

              {/* Hover Effect Overlay */}
              <div
                className={cn(
                  'absolute inset-0 rounded-lg pointer-events-none transition-opacity duration-300',
                  isSelected ? 'bg-gradient-to-br from-primary/10 to-transparent opacity-100' : 'opacity-0'
                )}
              />
            </Card>
          );
        })}
      </div>
    </div>
  );
}
