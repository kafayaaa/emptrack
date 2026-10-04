import type { Metadata } from "next"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { cookies } from "next/headers"
import { AppSidebar } from "@/components/shared/sidebar/app-sidebar"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false"

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset id="main-content">{children}</SidebarInset>
    </SidebarProvider>
  )
}
