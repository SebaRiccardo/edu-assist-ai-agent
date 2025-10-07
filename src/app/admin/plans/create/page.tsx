import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AdminDashboardLayout } from '@/components/admin/layout/admin-dashboard-layout';
import { CreatePlanForm } from '@/components/admin/plans/create-plan-form';

export default async function CreatePlanPage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/auth/login');
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Create Subscription Plan
        </h1>
        <p className="text-muted-foreground mt-2">
          Create a new subscription plan in MercadoPago and save it to the
          database.
        </p>
      </div>
      <div className="px-4 lg:px-6">
        <CreatePlanForm />
      </div>
    </div>
  );
}
