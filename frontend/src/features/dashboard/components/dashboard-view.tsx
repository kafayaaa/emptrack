"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
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
    refetch,
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
          role="alert"
          aria-live="assertive"
          className="flex flex-col items-center justify-center gap-3.5 rounded-xl border border-destructive/20 bg-card p-8 text-center shadow-2xs"
        >
          <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-1 ring-destructive/20">
            <AlertCircle className="size-7 stroke-[1.75]" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              Gagal Memuat Ringkasan Dashboard
            </h2>
            <p className="max-w-md text-xs text-muted-foreground">
              Terjadi kesalahan saat memuat data ringkasan dashboard. Silakan muat ulang halaman.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            className="mt-2 gap-2"
          >
            <RefreshCw className="size-3.5" />
            <span>Coba Lagi</span>
          </Button>
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
