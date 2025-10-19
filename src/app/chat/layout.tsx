import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { getCurrentUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function ChatLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) return redirect('/auth/login');

  return (
    <SidebarProvider>
      <AppSidebar serverUser={user} />
      <main className="w-full">{children}</main>
    </SidebarProvider>
  );
}
