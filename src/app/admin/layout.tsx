import { AdminDashboardLayout } from '@/components/admin/layout/admin-dashboard-layout';

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <AdminDashboardLayout>{children}</AdminDashboardLayout>;
}
