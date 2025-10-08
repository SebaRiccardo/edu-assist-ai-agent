'use client';
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
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Receipt,
  ScrollText,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import { signOut } from '@/lib/auth/auth-service';
import { useRouter } from 'next/navigation';

const mainNav = [
  {
    title: 'Dashboard',
    url: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Analytics',
    url: '/admin/analytics',
    icon: BarChart3,
  },
];
const userNav = [
  {
    title: 'Users',
    url: '/admin/users',
    icon: Users,
  },
  {
    title: 'Active Subscriptions',
    url: '/admin/subscriptions',
    icon: Receipt,
  },
  {
    title: 'Courses',
    url: '/admin/courses',
    icon: ScrollText,
  },
];
const subscriptionNav = [
  {
    title: 'Plans',
    url: '/admin/plans',
    icon: CreditCard,
  },
];
const nav = {
  mainNav: mainNav,
  users: userNav,
  subscription: subscriptionNav,
};

type AdminSidebarProps = React.ComponentProps<typeof Sidebar> & { user: any };

export function AdminSidebar({ user, ...props }: AdminSidebarProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.refresh();
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <Link href="/admin">
          <div className="flex items-center gap-2 px-2 py-2">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <LayoutDashboard className="size-4" />
            </div>
            <div className="flex flex-col gap-0.5 leading-none">
              <span className="font-semibold">Admin Panel</span>
              <span className="text-muted-foreground text-xs">
                EduAssist AI
              </span>
            </div>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.mainNav.map(item => (
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
        <SidebarGroup>
          <SidebarGroupLabel>Users</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.users.map(item => (
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
        <SidebarGroup>
          <SidebarGroupLabel>Subscriptions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.subscription.map(item => (
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
          onLogout={handleSignOut}
          user={{ email: user?.email!, name: user?.user_metadata.first_name }}
        />

        <div className="text-muted-foreground px-2 py-2 text-xs">
          © 2025 EduAssist AI
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
