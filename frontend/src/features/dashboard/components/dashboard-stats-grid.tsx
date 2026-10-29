import * as React from "react"
import { Users, Laptop, Activity, Coins } from "lucide-react"
import { DashboardStatCard } from "./dashboard-stat-card"
import type { DashboardSummary } from "../types"
import { Badge } from "@/components/ui/badge"

export interface DashboardStatsGridProps {
  summary: DashboardSummary
}

export function DashboardStatsGrid({ summary }: DashboardStatsGridProps) {
  const numberFormatter = React.useMemo(() => new Intl.NumberFormat("id-ID"), [])

  const currencyFormatter = React.useMemo(
    () =>
      new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }),
    [],
  )

  const { employees, assets } = summary

  return (
    <div
      data-testid="dashboard-stats-grid"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {/* 1. Total Employees */}
      <DashboardStatCard
        title="Total Karyawan"
        value={numberFormatter.format(employees.total)}
        description={`${numberFormatter.format(employees.active)} aktif • ${numberFormatter.format(employees.onLeave + employees.inactive)} cuti/nonaktif`}
        icon={Users}
        iconBgClass="bg-blue-500/10 dark:bg-blue-500/20"
        iconColorClass="text-blue-600 dark:text-blue-400"
        href="/employees"
        badge={
          <Badge variant="outline" className="text-[10px] text-blue-600 dark:text-blue-400">
            {employees.total > 0
              ? `${Math.round((employees.active / employees.total) * 100)}% Aktif`
              : "0%"}
          </Badge>
        }
        data-testid="stat-card-total-employees"
      />

      {/* 2. Total Assets */}
      <DashboardStatCard
        title="Total Aset Inventaris"
        value={numberFormatter.format(assets.total)}
        description={`${numberFormatter.format(assets.available)} tersedia • ${numberFormatter.format(assets.assigned)} ditugaskan`}
        icon={Laptop}
        iconBgClass="bg-indigo-500/10 dark:bg-indigo-500/20"
        iconColorClass="text-indigo-600 dark:text-indigo-400"
        href="/assets"
        badge={
          <Badge variant="outline" className="text-[10px] text-indigo-600 dark:text-indigo-400">
            {assets.total > 0
              ? `${Math.round((assets.available / assets.total) * 100)}% Siap Pakai`
              : "0%"}
          </Badge>
        }
        data-testid="stat-card-total-assets"
      />

      {/* 3. Asset Allocation Rate */}
      <DashboardStatCard
        title="Tingkat Utilisasi Aset"
        value={`${assets.allocationRate}%`}
        description={`${numberFormatter.format(assets.assigned)} dari ${numberFormatter.format(assets.total)} aset terpakai`}
        icon={Activity}
        iconBgClass="bg-emerald-500/10 dark:bg-emerald-500/20"
        iconColorClass="text-emerald-600 dark:text-emerald-400"
        badge={
          <Badge
            variant="outline"
            className={
              assets.allocationRate >= 70
                ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                : "border-amber-500/30 text-amber-600 dark:text-amber-400"
            }
          >
            {assets.allocationRate >= 70 ? "Optimal" : "Wajar"}
          </Badge>
        }
        data-testid="stat-card-allocation-rate"
      />

      {/* 4. Estimated Valuation */}
      <DashboardStatCard
        title="Total Valuasi Pengadaan"
        value={currencyFormatter.format(assets.totalValue)}
        description="Akumulasi estimasi nilai inventaris hardware"
        icon={Coins}
        iconBgClass="bg-amber-500/10 dark:bg-amber-500/20"
        iconColorClass="text-amber-600 dark:text-amber-400"
        data-testid="stat-card-total-valuation"
      />
    </div>
  )
}
