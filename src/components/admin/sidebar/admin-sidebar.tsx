import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { createClient } from '@/lib/supabase/server';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  Receipt,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';

const menuItems = [
  {
    title: 'Dashboard',
    url: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Users',
    url: '/admin/users',
    icon: Users,
  },
  {
    title: 'Subscription Plans',
    url: '/admin/plans',
    icon: CreditCard,
  },
  {
    title: 'Active Subscriptions',
    url: '/admin/subscriptions',
    icon: Receipt,
  },
  {
    title: 'Analytics',
    url: '/admin/analytics',
    icon: BarChart3,
  },
  {
    title: 'Settings',
    url: '/admin/settings',
    icon: Settings,
  },
];

export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <LayoutDashboard className="size-4" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-semibold">Admin Panel</span>
            <span className="text-muted-foreground text-xs">EduAssist AI</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{ email: user?.email!, name: user?.user_metadata.first_name }}
        />

        <div className="text-muted-foreground px-2 py-2 text-xs">
          © 2025 EduAssist AI
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
