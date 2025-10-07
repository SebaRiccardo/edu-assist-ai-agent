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
  CheckCircle,
  XCircle,
} from 'lucide-react';

export type PlanRow = {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: string;
  interval_count: number;
  trial_period_days: number | null;
  is_active: boolean;
  features: string[] | null;
  mercadopago_plan_id: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export const columns: ColumnDef<PlanRow>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Plan Name
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const plan = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{plan.name}</span>
          <span className="text-muted-foreground text-xs">
            {plan.description}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'price',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Price
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const price = row.getValue('price') as number;
      const currency = row.original.currency;
      const interval = row.original.interval;
      const intervalCount = row.original.interval_count;

      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
      }).format(price / 100);

      const intervalText =
        intervalCount === 1
          ? interval.slice(0, -1)
          : `${intervalCount} ${interval}`;

      return (
        <div className="flex flex-col">
          <span className="font-medium">{formatted}</span>
          <span className="text-muted-foreground text-xs">
            per {intervalText}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'trial_period_days',
    header: 'Free Trial',
    cell: ({ row }) => {
      const trialDays = row.getValue('trial_period_days') as number | null;
      return trialDays ? (
        <Badge variant="secondary">{trialDays} days</Badge>
      ) : (
        <span className="text-muted-foreground text-sm">No trial</span>
      );
    },
  },
  {
    accessorKey: 'is_active',
    header: 'Status',
    cell: ({ row }) => {
      const isActive = row.getValue('is_active') as boolean;
      return isActive ? (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
          <CheckCircle className="mr-1 size-3" />
          Active
        </Badge>
      ) : (
        <Badge variant="secondary" className="text-muted-foreground">
          <XCircle className="mr-1 size-3" />
          Inactive
        </Badge>
      );
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
          Created
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
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(plan.id)}
            >
              Copy plan ID
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                navigator.clipboard.writeText(plan.mercadopago_plan_id || '')
              }
            >
              Copy MercadoPago ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Edit plan</DropdownMenuItem>
            <DropdownMenuItem>View subscribers</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              {plan.is_active ? 'Deactivate' : 'Activate'}
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Delete plan
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
