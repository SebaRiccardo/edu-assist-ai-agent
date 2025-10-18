import { DashboardNavBar } from '@/components/top-nav';
import { getCurrentUser } from '@/lib/supabase/server';

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-gradient-to-bl from-pink-100 to-blue-200">
      <DashboardNavBar user={user} />
      <main className="relative py-5">{children}</main>
    </div>
  );
}
