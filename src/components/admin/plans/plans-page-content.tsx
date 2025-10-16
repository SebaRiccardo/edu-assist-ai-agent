'use client';

import { PlansDataTable } from '@/components/admin/plans/plans-data-table';
import { columns } from '@/components/admin/plans/plans-columns';
import { PlanTemplateCards } from '@/components/admin/plans/plan-template-cards';
import { usePlans } from '@/hooks/use-subscription-plans';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { PlanType } from '@/subscriptions/plans';

export function PlansPageContent() {
  const router = useRouter();
  const { data: plans, isLoading, error, refetch, isRefetching } = usePlans();

  const handleCreatePlan = (planType: PlanType) => {
    // Navigate to create page with plan type as query param
    router.push(`/admin/plans/create?template=${planType}`);
  };

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

  // MercadoPago plans data is already in the correct format
  const plansData = plans?.results || [];

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

      {/* Plans Table */}
      <div className="px-4 lg:px-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading plans...</p>
          </div>
        ) : (
          <PlansDataTable
            isRefresing={isRefetching}
            onRefresh={refetch}
            columns={columns}
            data={plansData}
          />
        )}
      </div>
      {/* Template Cards */}
      <div className="px-4 lg:px-6">
        <PlanTemplateCards onCreatePlan={handleCreatePlan} />
      </div>
    </div>
  );
}
