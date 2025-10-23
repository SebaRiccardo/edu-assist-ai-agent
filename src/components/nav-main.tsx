"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { type LucideIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export type NavProjectsItem = {
  label: string
  href: string
  icon: LucideIcon
  matcher?: (pathname: string) => boolean
}

export function NavMain({
  items,
  title,
}: {
  items: NavProjectsItem[]
  title: string
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = item.matcher ? item.matcher(pathname) : pathname === item.href

          return (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild tooltip={item.label} isActive={isActive}>
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
