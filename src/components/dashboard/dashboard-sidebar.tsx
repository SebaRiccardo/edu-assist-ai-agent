"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  BotMessageSquare,
  Command,
  GalleryVerticalEnd,
  LayoutDashboard,
  Mails,
  MessagesSquare,
  Plug,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain, type NavProjectsItem } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { signOut } from "@/auth/service"
import { useRouter } from "next/navigation"
import { User } from "@supabase/supabase-js"
import { useTranslations } from "next-intl"


export function AppSidebar({ user, ...props }: React.ComponentProps<typeof Sidebar> & { user: User | null }) {
  const router = useRouter();
  const tNav = useTranslations("DashboardNavigation");

  const navItems: NavProjectsItem[] = React.useMemo(
    () => [
      {
        label: tNav("overview"),
        href: "/dashboard",
        icon: LayoutDashboard,
        matcher: (pathname) => pathname === "/dashboard",
      },
      {
        label: tNav("courses"),
        href: "/dashboard/courses",
        icon: BookOpen,
        matcher: (pathname) => pathname.startsWith("/dashboard/courses"),
      },
      {
        label: tNav("chat"),
        href: "/dashboard/chat",
        icon: BotMessageSquare,
        matcher: (pathname) => pathname.startsWith("/dashboard/chat"),
      },
      {
        label: tNav("connections"),
        href: "/dashboard/connections",
        icon: Mails,
        matcher: (pathname) => pathname.startsWith("/dashboard/connections"),
      },
      {
        label: tNav("settings"),
        href: "/dashboard/settings",
        icon: Settings2,
        matcher: (pathname) => pathname.startsWith("/dashboard/settings"),
      },
    ],
    [tNav]
  );

  const handleSignOut = async () => {
    await signOut();
    router.refresh();
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavUser
          onLogout={handleSignOut}
          user={{
            email: user?.email ?? "",
            name: user?.user_metadata?.first_name ?? user?.email ?? "",
            avatar: user?.user_metadata?.avatar_url,
          }}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} title={tNav("section")} />
      </SidebarContent>
      <SidebarFooter>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
