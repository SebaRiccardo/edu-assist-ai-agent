import { AdminDashboardLayout } from '@/components/admin/layout/admin-dashboard-layout';
import { createClient } from '@/lib/supabase/client';

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AdminDashboardLayout>{children}</AdminDashboardLayout>;
}
