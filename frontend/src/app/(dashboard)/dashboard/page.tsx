import * as React from "react"
import { Metadata } from "next"
import { DashboardView } from "@/features/dashboard/components/dashboard-view"
import { DashboardSkeleton } from "@/features/dashboard/components/dashboard-skeleton"
import { getDashboardSummaryServer } from "@/features/dashboard/api/dashboard.server"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Overview of key organization metrics and operations.",
}

export default async function DashboardPage() {
  const initialData = await getDashboardSummaryServer()

  return (
    <React.Suspense fallback={<DashboardSkeleton />}>
      <DashboardView initialData={initialData} />
    </React.Suspense>
  )
}
