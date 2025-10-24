import { getCurrentUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { InboxChat } from '@/components/inbox-chat';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Inbox Chat | Edu Assist',
  description: 'Chat with your connected Gmail inboxes using AI',
};

export default async function ChatPage() {
  const user = await getCurrentUser();

  if (!user) {
    return redirect('/auth/login');
  }

  return (
    <div className="max-w-full mx-auto relative size-full h-full bg-background rounded-md">
      <InboxChat userId={user.id} />
    </div>
  );
}
