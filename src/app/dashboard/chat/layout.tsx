import { getCurrentUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function ChatLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) return redirect('/auth/login');

  return (
    <main className="w-full">{children}</main>
  );
}
