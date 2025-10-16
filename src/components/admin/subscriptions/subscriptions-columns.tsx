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
import {
  ArrowUpDown,
  MoreHorizontal,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Pause,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

// MercadoPago PreApproval type (subscription)
export type SubscriptionRow = {
  id?: string;
  version?: number;
  application_id?: number;
  collector_id?: number;
  preapproval_plan_id?: string;
  reason?: string;
  external_reference?: number;
  back_url?: string;
  init_point?: string;
  auto_recurring?: {
    frequency?: number;
    frequency_type?: string;
    transaction_amount?: number;
    currency_id?: string;
    free_trial?: {
      frequency?: number;
      frequency_type?: string;
    };
  };
  first_invoice_offset?: number;
  payer_id?: number;
  payer_first_name?: string;
  payer_last_name?: string;
  card_id?: number;
  payment_method_id?: number;
  next_payment_date?: number;
  date_created?: number;
  last_modified?: number;
  status?: string;
};

const getStatusBadge = (status?: string) => {
  const statusConfig: Record<string, { color: string; icon: React.ReactNode }> =
    {
      authorized: {
        color:
          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        icon: <CheckCircle className="mr-1 size-3" />,
      },
      pending: {
        color:
          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        icon: <Clock className="mr-1 size-3" />,
      },
      paused: {
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
        icon: <Pause className="mr-1 size-3" />,
      },
      cancelled: {
        color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        icon: <XCircle className="mr-1 size-3" />,
      },
    };

  const config = statusConfig[status || ''] || statusConfig.pending;

  return (
    <Badge variant="outline" className={config.color}>
      {config.icon}
      {status || 'unknown'}
    </Badge>
  );
};

export const columns: ColumnDef<SubscriptionRow>[] = [
  {
    accessorKey: 'payer_first_name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Payer
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const subscription = row.original;
      const firstName = subscription.payer_first_name || '';
      const lastName = subscription.payer_last_name || '';
      const fullName = `${firstName} ${lastName}`.trim() || 'N/A';

      return (
        <div className="flex flex-col">
          <span className="font-medium">{fullName}</span>
          <span className="text-muted-foreground text-xs">
            ID: {subscription.payer_id || 'N/A'}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'id',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Subscription ID
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const subscription = row.original;
      return (
        <Button variant="link" className="h-auto p-0">
          <Link
            target="_blank"
            className="flex flex-row items-center"
            href={`https://www.mercadopago.com.ar/subscriptions/${subscription.id}`}
          >
            <span className="font-mono text-xs">{subscription.id}</span>
            <ExternalLink className="ml-1 size-3" />
          </Link>
        </Button>
      );
    },
  },
  {
    accessorKey: 'reason',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Plan / Reason
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const subscription = row.original;
      const autoRecurring = subscription.auto_recurring;
      const price = autoRecurring?.transaction_amount || 0;
      const currency = autoRecurring?.currency_id || 'ARS';
      const frequency = autoRecurring?.frequency || 1;
      const frequencyType = autoRecurring?.frequency_type || 'months';

      const formatted = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: currency,
      }).format(price);

      const intervalText =
        frequency === 1
          ? frequencyType.slice(0, -1)
          : `${frequency} ${frequencyType}`;

      return (
        <div className="flex flex-col">
          <span className="font-medium">
            {subscription.reason || 'Unnamed Plan'}
          </span>
          <span className="text-muted-foreground text-xs">
            {formatted} / {intervalText}
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
      return getStatusBadge(status);
    },
  },
  {
    accessorKey: 'next_payment_date',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Next Payment
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const subscription = row.original;
      const nextPaymentDate = subscription.next_payment_date;
      const freeTrial = subscription.auto_recurring?.free_trial;

      if (freeTrial) {
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium">Free Trial</span>
            <span className="text-muted-foreground text-xs">
              {freeTrial.frequency} {freeTrial.frequency_type}
            </span>
          </div>
        );
      }

      return nextPaymentDate
        ? new Date(nextPaymentDate * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })
        : 'N/A';
    },
  },
  {
    accessorKey: 'date_created',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Created
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue('date_created') as string;
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
              onClick={() =>
                subscription.id &&
                navigator.clipboard.writeText(subscription.id)
              }
            >
              Copy subscription ID
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                subscription.preapproval_plan_id &&
                navigator.clipboard.writeText(subscription.preapproval_plan_id)
              }
            >
              Copy plan ID
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                subscription.init_point &&
                navigator.clipboard.writeText(subscription.init_point)
              }
            >
              Copy init point URL
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>View payment history</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              {subscription.status === 'authorized'
                ? 'Pause subscription'
                : 'Resume subscription'}
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Cancel subscription
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
