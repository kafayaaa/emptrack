"use client"

import * as React from "react"

import { NavMain } from "@/components/shared/sidebar/nav-main"
import { NavUser } from "@/components/shared/sidebar/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { BookUser, Box, Home, TerminalIcon } from "lucide-react"
import Link from "next/link"

const data = {
  user: {
    name: "Empy",
    email: "empy@example.com",
    avatar: "",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <Home />,
    },
    {
      title: "Employees",
      url: "/employees",
      icon: <BookUser />,
    },
    {
      title: "Inventory",
      url: "/inventory",
      icon: <Box />,
    },
  ],
}
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="#" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <TerminalIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">EmpTrack</span>
                <span className="truncate text-xs">Manage your employees</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
