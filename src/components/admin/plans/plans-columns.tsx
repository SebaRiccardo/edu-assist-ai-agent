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
import { ArrowUpDown, MoreHorizontal, CheckCircle, XCircle, ExternalLink, Clock, Pause } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { PreApprovalPlanResponse } from 'mercadopago/dist/clients/preApprovalPlan/commonTypes';

export type PlanRow = Omit<PreApprovalPlanResponse, 'api_response'>;

const getStatusBadge = (status?: string) => {
  switch (status) {
    case 'active':
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
          <CheckCircle className="mr-1 size-3" />
          Active
        </Badge>
      );
    case 'paused':
      return (
        <Badge variant="secondary">
          <Pause className="mr-1 size-3" />
          Paused
        </Badge>
      );
    case 'cancelled':
      return (
        <Badge variant="secondary" className="text-muted-foreground">
          <XCircle className="mr-1 size-3" />
          Cancelled
        </Badge>
      );
    default:
      return (
        <Badge variant="outline">
          <Clock className="mr-1 size-3" />
          {status || 'Unknown'}
        </Badge>
      );
  }
};

export const columns: ColumnDef<PlanRow>[] = [
  {
    accessorKey: 'reason',
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Plan Name
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const plan = row.original;
      const reason = plan.reason || 'Unnamed Plan';
      return (
        <div className="flex flex-row gap-2 max-w-xs">
          <Avatar className="border-2 size-9 border-primary">
            <AvatarFallback>{reason.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{reason}</span>
            <span className="text-muted-foreground text-xs truncate max-w-xs">ID: {plan.id}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'id',
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          MercadoPago ID
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const plan = row.original;
      return (
        <Button variant="link" className="has-[>svg]:px-0">
          <Link
            target="_blank"
            className="flex flex-row px-0 items-center"
            href={`https://www.mercadopago.com.ar/subscription-plans/subscription-details?id=${plan.id}`}
          >
            <span className="font-medium">{plan.id}</span>
            <ExternalLink className="size-4 ml-1" />
          </Link>
        </Button>
      );
    },
  },
  {
    accessorKey: 'auto_recurring',
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Price
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const autoRecurring = row.original.auto_recurring;
      const price = autoRecurring?.transaction_amount || 0;
      const currency = autoRecurring?.currency_id || 'ARS';
      const frequency = autoRecurring?.frequency || 1;
      const frequencyType = autoRecurring?.frequency_type || 'months';

      const formatted = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: currency,
      }).format(price);

      const intervalText = frequency === 1 ? frequencyType.slice(0, -1) : `${frequency} ${frequencyType}`;

      return (
        <div className="flex flex-col">
          <span className="font-medium">{formatted}</span>
          <span className="text-muted-foreground text-xs">per {intervalText}</span>
        </div>
      );
    },
  },
  {
    id: 'free_trial',
    header: 'Free Trial',
    cell: ({ row }) => {
      const freeTrial = row.original.auto_recurring?.free_trial;
      const frequency = freeTrial?.frequency;
      const frequencyType = freeTrial?.frequency_type;

      return frequency && frequencyType ? (
        <Badge variant="secondary">
          {frequency} {frequencyType}
        </Badge>
      ) : (
        <span className="text-muted-foreground text-sm">No trial</span>
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
    id: 'currency',
    header: 'Currency',
    cell: ({ row }) => {
      const currency = row.original.auto_recurring?.currency_id || 'ARS';
      return <Badge variant="outline">{currency}</Badge>;
    },
  },
  {
    accessorKey: 'date_created',
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Created
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue('date_created') as string | undefined;
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
      const plan = row.original;

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
            <DropdownMenuItem onClick={() => plan.id && navigator.clipboard.writeText(plan.id)}>Copy plan ID</DropdownMenuItem>
            <DropdownMenuItem onClick={() => plan.init_point && navigator.clipboard.writeText(plan.init_point)}>Copy checkout URL</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>View subscribers</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>{plan.status === 'active' ? 'Pause plan' : 'Activate plan'}</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Cancel plan</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
