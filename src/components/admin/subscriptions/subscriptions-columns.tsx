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
import { ArrowUpDown, MoreHorizontal, AlertCircle } from 'lucide-react';

export type SubscriptionRow = {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  plan_name: string;
  plan_price: number;
  plan_currency: string;
  plan_interval: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  trial_start: string | null;
  trial_end: string | null;
  cancel_at_period_end: boolean;
  cancelled_at: string | null;
  created_at: string | null;
  mercadopago_preapproval_id: string | null;
};

export const columns: ColumnDef<SubscriptionRow>[] = [
  {
    accessorKey: 'user_name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          User
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const subscription = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{subscription.user_name}</span>
          <span className="text-muted-foreground text-xs">
            {subscription.user_email}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'plan_name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Plan
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const subscription = row.original;
      const price = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: subscription.plan_currency,
      }).format(subscription.plan_price / 100);

      return (
        <div className="flex flex-col">
          <span className="font-medium">{subscription.plan_name}</span>
          <span className="text-muted-foreground text-xs">
            {price}/{subscription.plan_interval}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const cancelAtPeriodEnd = row.original.cancel_at_period_end;

      const statusColors: Record<string, string> = {
        authorized:
          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        pending:
          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        paused: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
      };

      return (
        <div className="flex flex-col gap-1">
          <Badge
            variant="outline"
            className={statusColors[status] || statusColors.pending}
          >
            {status}
          </Badge>
          {cancelAtPeriodEnd && (
            <span className="text-muted-foreground flex items-center gap-1 text-xs">
              <AlertCircle className="size-3" />
              Cancels at period end
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'current_period_end',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Next Billing
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue('current_period_end') as string | null;
      const trialEnd = row.original.trial_end;

      if (trialEnd) {
        return (
          <div className="flex flex-col">
            <span className="text-sm">Trial ends</span>
            <span className="text-muted-foreground text-xs">
              {new Date(trialEnd).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        );
      }

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
    accessorKey: 'created_at',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Started
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
      const subscription = row.original;

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
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(subscription.id)}
            >
              Copy subscription ID
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                navigator.clipboard.writeText(
                  subscription.mercadopago_preapproval_id || ''
                )
              }
            >
              Copy MercadoPago ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>View payments</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Pause subscription</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Cancel subscription
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
