'use client';

import * as React from 'react';
import {
  IconChartBar,
  IconDashboard,
  IconHelp,
  IconMessageChatbot,
  IconMail,
  IconSearch,
  IconSettings,
  IconUsers,
  IconBook,
  IconCalendar,
  IconFileText,
} from '@tabler/icons-react';

import { NavDocuments } from '@/components/nav-documents';
import { NavMain } from '@/components/nav-main';
import { NavSecondary } from '@/components/nav-secondary';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import WordmarkLogo from '@/components/wordmark-logo';
import { useCurrentUser, useUserDisplayName } from '@/hooks/use-current-user';
import type { User } from '@supabase/supabase-js';
import { signOut } from '@/auth/service';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const data = {
  navMain: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: IconDashboard,
    },
    {
      title: 'My Courses',
      url: '/dashboard/courses',
      icon: IconBook,
    },
    {
      title: 'Inbox Chat',
      url: '/chat',
      icon: IconMessageChatbot,
    },
  ],
  navSecondary: [
    {
      title: 'Settings',
      url: '/dashboard/settings',
      icon: IconSettings,
    },
    {
      title: 'Get Help',
      url: '/dashboard/help',
      icon: IconHelp,
    },
  ],
  documents: [
    {
      name: 'Assignments',
      url: '/dashboard/assignments',
      icon: IconFileText,
    },
    {
      name: 'Schedule',
      url: '/dashboard/schedule',
      icon: IconCalendar,
    },
  ],
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  serverUser?: User | null;
}

export function AppSidebar({ serverUser, ...props }: AppSidebarProps) {
  const router = useRouter();
  const { user: clientUser } = useCurrentUser(serverUser);
  const displayName = useUserDisplayName(clientUser);

  const user = {
    name: displayName || 'User',
    email: clientUser?.email,
    avatar: clientUser?.user_metadata?.avatar_url || '/avatars/default.jpg',
  };

  const handleLogout = async () => {
    await signOut();
    router.replace('/auth/login');
    router.refresh();
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <Link href="/dashboard">
            <WordmarkLogo className="gap-2.5" />
          </Link>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavDocuments items={data.documents} /> */}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} onLogout={handleLogout} />
      </SidebarFooter>
    </Sidebar>
  );
}
