import { getCurrentUser } from '@/lib/supabase/server';
import DashboardPageContent from './dashboard-page-content';
import { redirect } from 'next/navigation';

export default async function Page() {
  const serverSideUser = await getCurrentUser();

  if (!serverSideUser) {
    return redirect('/auth/login');
  }

  return <DashboardPageContent serverSideUser={serverSideUser} />;
}
