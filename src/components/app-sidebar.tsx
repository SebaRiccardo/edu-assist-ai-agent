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
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import WordmarkLogo from '@/components/wordmark-logo';
import { useCurrentUser, useUserDisplayName } from '@/hooks/use-current-user';
import type { User } from '@supabase/supabase-js';

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
      title: 'Email Management',
      url: '/dashboard/emails',
      icon: IconMail,
    },
    {
      title: 'Inbox Chat',
      url: '/chat',
      icon: IconMessageChatbot,
    },
    // {
    //   title: 'Students',
    //   url: '/dashboard/students',
    //   icon: IconUsers,
    // },
    // {
    //   title: 'Analytics',
    //   url: '/dashboard/analytics',
    //   icon: IconChartBar,
    // },
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
    {
      title: 'Search',
      url: '#',
      icon: IconSearch,
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
  const { user: clientUser } = useCurrentUser(serverUser);
  const displayName = useUserDisplayName(clientUser);

  const user = {
    name: displayName || 'User',
    email: clientUser?.email || 'user@example.com',
    avatar: clientUser?.user_metadata?.avatar_url || '/avatars/default.jpg',
  };

  const handleLogout = async () => {
    const supabase = (await import('@/lib/supabase/client')).createClient();
    await supabase.auth.signOut();
    window.location.href = '/auth/login';
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-2"
            >
              <a href="/dashboard">
                <WordmarkLogo className="gap-2.5" />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} onLogout={handleLogout} />
      </SidebarFooter>
    </Sidebar>
  );
}
