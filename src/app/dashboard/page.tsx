import DashboardPageContent from "../../components/dashboard/dashboard-page"
import { getCurrentUser } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function Page() {

  const serverSideUser = await getCurrentUser();

  if (!serverSideUser) {
    return redirect('/auth/login');
  }

  return (
    <DashboardPageContent serverSideUser={serverSideUser} />
  )
}
