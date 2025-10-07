'use client';

import { PlansDataTable } from '@/components/admin/plans/plans-data-table';
import { columns } from '@/components/admin/plans/plans-columns';
import { usePlans } from '@/hooks/use-subscription-plans';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';

export function PlansPageContent() {
  const { data: plans, isLoading, error } = usePlans();

  if (error) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <h1 className="text-3xl font-bold">Subscription Plans</h1>
        <p className="text-destructive">
          Error loading plans. Please try again.
        </p>
      </div>
    );
  }

  // Transform data for the table
  const plansData = (plans || []).map(plan => ({
    id: plan.id,
    name: plan.name,
    description: plan.description || 'N/A',
    price: plan.price,
    currency: plan.currency || 'ARS',
    interval: plan.interval,
    interval_count: plan.interval_count || 1,
    trial_period_days: plan.trial_period_days,
    is_active: plan.is_active || false,
    features: plan.features as string[] | null,
    mercadopago_plan_id: plan.mercadopago_plan_id,
    created_at: plan.created_at,
    updated_at: plan.updated_at,
  }));

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Subscription Plans
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage subscription plans and pricing.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/plans/create">
            <Plus className="mr-2 size-4" />
            Create Plan
          </Link>
        </Button>
      </div>
      <div className="px-4 lg:px-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading plans...</p>
          </div>
        ) : (
          <PlansDataTable columns={columns} data={plansData} />
        )}
      </div>
    </div>
  );
}
