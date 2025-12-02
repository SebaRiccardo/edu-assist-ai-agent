
import { getCurrentUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AppSidebar } from "@/components/dashboard/dashboard-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import DashboardHeader from "../../components/dashboard/dashboard-header"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) return redirect('/auth/login');

  return (
    <SidebarProvider>
      <AppSidebar user={user} variant='floating' className="bg-gradient-to-tl from-blue-200 to-pink-100" />
      <SidebarInset className='p-2 bg-gradient-to-bl from-pink-100 to-blue-200'>
        {/* max-h-[calc(100vh-6rem)] overflow-hidden */}
        <div className="w-full p-4 h-full rounded-md space-y-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <DashboardHeader user={user} />
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
