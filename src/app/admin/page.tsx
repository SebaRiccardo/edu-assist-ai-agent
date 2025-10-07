import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AdminDashboardLayout } from '@/components/admin/layout/admin-dashboard-layout';
import { AdminDashboardContent } from '@/components/admin/dashboard/admin-dashboard-content';

/**
 * Admin Dashboard Page
 * Protected route - only accessible to admin users
 */
export default async function AdminPage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  const { data: claims } = await supabase.auth.getClaims();

  if (authError || !user) {
    redirect('/auth/login');
  }
  console.log(claims, user);
  // TODO: Add admin role check here
  // For now, we'll allow any authenticated user
  // In production, check if user.role === 'admin' or similar

  return (
    <AdminDashboardLayout>
      <AdminDashboardContent />
    </AdminDashboardLayout>
  );
}
