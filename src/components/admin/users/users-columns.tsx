'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowUpDown, MoreHorizontal, Mail, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export type UserRow = {
  id: string;
  email: string;
  full_name: string;
  username: string | null;
  avatar_url: string | null;
  created_at: string | null;
  updated_at: string | null;
  subscription_status: string;
  subscription_plan: string;
};

export const columns: ColumnDef<UserRow>[] = [
  {
    accessorKey: 'full_name',
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          User
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const user = row.original;
      const initials =
        user.full_name
          ?.split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase() || 'U';

      return (
        <div className="flex items-center gap-3">
          <Avatar className="size-8">
            <AvatarImage src={user.avatar_url || undefined} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{user.full_name}</span>
            {user.username && <span className="text-muted-foreground text-xs">@{user.username}</span>}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'email',
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Email
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Mail className="text-muted-foreground size-4" />
          <span>{row.getValue('email')}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'subscription_status',
    header: 'Subscription',
    cell: ({ row }) => {
      const status = row.getValue('subscription_status') as string;
      const plan = row.original.subscription_plan;

      const statusColors: Record<string, string> = {
        authorized: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        paused: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
        none: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
      };

      return (
        <div className="flex flex-col gap-1">
          <Badge variant="outline" className={statusColors[status] || statusColors.none}>
            {status === 'none' ? 'No subscription' : status}
          </Badge>
          {plan !== 'None' && <span className="text-muted-foreground text-xs">{plan}</span>}
        </div>
      );
    },
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Joined
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue('created_at') as string | null;
      return date
        ? new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })
        : 'N/A';
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const user = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="size-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>Copy user ID</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.email)}>Copy email</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>View subscriptions</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Suspend user</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
