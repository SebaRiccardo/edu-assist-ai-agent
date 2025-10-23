
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
      <AppSidebar user={user} variant="floating" className="bg-gradient-to-tl from-blue-200 to-pink-100" />
      <SidebarInset className='p-2 bg-gradient-to-bl from-pink-100 to-blue-200'>
        <DashboardHeader user={user} />
        {/* max-h-[calc(100vh-6rem)] overflow-hidden */}
        <main className="flex flex-col flex-1 gap-4 p-4 border rounded-b-md bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
