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
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export type PlanRow = {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'days' | 'months' | 'years';
  is_active: boolean;
  trial_period_days: number | null;
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
        <div className="flex flex-row gap-2 max-w-xs">
          <Avatar className="border-2 size-9 border-primary">
            <AvatarFallback>{plan.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{plan.name}</span>
            <span className="text-muted-foreground text-xs truncate max-w-xs ">
              {plan.description}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'mercadopago_plan_id',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Mercadopago ID
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
            href={`https://www.mercadopago.com.ar/subscription-plans/subscription-details?id=${plan.mercadopago_plan_id}`}
          >
            <span className="font-medium">{plan.mercadopago_plan_id}</span>
            <ExternalLink className="size-4 ml-1" />
          </Link>
        </Button>
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
      const intervalCount = 1; //row.original.interval_count;

      const formatted = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: currency,
      }).format(price);

      const intervalText =
        intervalCount === 1
          ? interval.slice(0, -1)
          : `${intervalCount} ${interval}`;
      console.log(formatted);
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
    accessorKey: 'currency',
    header: 'Currency',
    cell: ({ row }) => {
      const currency = row.getValue('currency') as string;

      return <Badge>{currency}</Badge>;
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
