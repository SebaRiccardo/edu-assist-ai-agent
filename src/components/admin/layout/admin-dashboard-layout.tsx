import { AdminSidebar } from '@/components/admin/sidebar/admin-sidebar';
import { SiteHeader } from '@/components/admin/layout/admin-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { getCurrentUser } from '@/lib/supabase/server';

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
}

export async function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  const user = await getCurrentUser();
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AdminSidebar variant="inset" user={user} />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
