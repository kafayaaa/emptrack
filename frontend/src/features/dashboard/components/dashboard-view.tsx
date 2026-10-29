"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { useDashboardSummary } from "../hooks"
import { DashboardStatsGrid } from "./dashboard-stats-grid"
import { AssetStatusChart } from "./asset-status-chart"
import { CategoryDistribution } from "./category-distribution"
import { DepartmentDistribution } from "./department-distribution"
import { RecentAssetsCard } from "./recent-assets-card"
import { DashboardSkeleton } from "./dashboard-skeleton"
import type { DashboardSummary } from "../types"

const EmployeeCreateDialog = dynamic(() =>
  import("@/features/employees/components/employee-create-dialog").then(
    (m) => m.EmployeeCreateDialog,
  ),
)

const AssetCreateDialog = dynamic(() =>
  import("@/features/assets/components/asset-create-dialog").then((m) => m.AssetCreateDialog),
)

export interface DashboardViewProps {
  initialData?: DashboardSummary
}

export function DashboardView({ initialData }: DashboardViewProps) {
  const {
    data: summary,
    isLoading,
    isError,
  } = useDashboardSummary({
    initialData,
  })

  if (isLoading && !summary) {
    return <DashboardSkeleton />
  }

  // Jika data tidak dapat dimuat dan tidak ada initialData
  if (!summary || isError) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Overview of key organization metrics and operations.
          </p>
        </div>
        <div
          data-testid="dashboard-error-state"
          className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center text-sm text-destructive"
        >
          Terjadi kesalahan saat memuat data ringkasan dashboard. Silakan muat ulang halaman.
        </div>
      </div>
    )
  }

  return (
    <div data-testid="dashboard-view" className="flex flex-col gap-6">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Overview of key organization metrics and operations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <EmployeeCreateDialog />
          <AssetCreateDialog />
        </div>
      </div>

      {/* Primary KPI Stats Grid */}
      <DashboardStatsGrid summary={summary} />

      {/* Row 2: Visual Distribution of Assets */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AssetStatusChart metrics={summary.assets} />
        <CategoryDistribution metrics={summary.assets} />
      </div>

      {/* Row 3: Organizational Distribution & Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DepartmentDistribution metrics={summary.employees} />
        <RecentAssetsCard assets={summary.recentAssets} />
      </div>
    </div>
  )
}
