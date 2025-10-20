import { DashboardNavBar } from '@/components/top-nav';
import { getCurrentUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) return redirect('/auth/login');

  return (
    <div className="min-h-screen bg-gradient-to-bl from-pink-100 to-blue-200">
      <DashboardNavBar user={user} />
      <main className="relative md:py-5 lg:xl:py-5 xl:py-20">{children}</main>
    </div>
  );
}
