import * as React from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import type { AssetDashboardMetrics } from "../types"

export interface AssetStatusChartProps {
  metrics: AssetDashboardMetrics
}

interface StatusSegment {
  key: string
  label: string
  count: number
  percentage: number
  colorClass: string
  bgLightClass: string
  dotClass: string
}

export function AssetStatusChart({ metrics }: AssetStatusChartProps) {
  const numberFormatter = React.useMemo(() => new Intl.NumberFormat("id-ID"), [])

  const total = metrics.total || 1 // Mencegah division by zero

  const segments: StatusSegment[] = React.useMemo(
    () => [
      {
        key: "assigned",
        label: "Ditugaskan",
        count: metrics.assigned,
        percentage: Math.round((metrics.assigned / total) * 100),
        colorClass: "bg-blue-500",
        bgLightClass: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
        dotClass: "bg-blue-500",
      },
      {
        key: "available",
        label: "Tersedia",
        count: metrics.available,
        percentage: Math.round((metrics.available / total) * 100),
        colorClass: "bg-emerald-500",
        bgLightClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
        dotClass: "bg-emerald-500",
      },
      {
        key: "maintenance",
        label: "Perawatan / Servis",
        count: metrics.maintenance,
        percentage: Math.round((metrics.maintenance / total) * 100),
        colorClass: "bg-amber-500",
        bgLightClass: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
        dotClass: "bg-amber-500",
      },
      {
        key: "retired",
        label: "Afkir / Pensiun",
        count: metrics.retired,
        percentage: Math.round((metrics.retired / total) * 100),
        colorClass: "bg-slate-400 dark:bg-slate-500",
        bgLightClass: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
        dotClass: "bg-slate-400",
      },
    ],
    [metrics, total],
  )

  return (
    <Card data-testid="asset-status-chart" className="flex flex-col justify-between">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground">
            Distribusi Status Aset
          </CardTitle>
          <span className="text-xs font-medium text-muted-foreground">
            Total {numberFormatter.format(metrics.total)} Unit
          </span>
        </div>
        <CardDescription className="text-xs">
          Proporsi status kesiapan operasional hardware dan perangkat kantor.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Multi-segment distribution visual bar */}
        <div
          role="progressbar"
          aria-label="Distribusi status aset inventaris"
          aria-valuenow={metrics.allocationRate}
          aria-valuemin={0}
          aria-valuemax={100}
          className="flex h-3.5 w-full overflow-hidden rounded-full bg-muted/70 p-0.5 shadow-inner"
        >
          {segments.map((seg) => {
            if (seg.percentage <= 0 && seg.count === 0) return null
            // Minimal width 2% agar segmen kecil tetap terlihat proporsional
            const width = Math.max(seg.percentage, seg.count > 0 ? 3 : 0)
            return (
              <div
                key={seg.key}
                style={{ width: `${width}%` }}
                title={`${seg.label}: ${numberFormatter.format(seg.count)} (${seg.percentage}%)`}
                className={`${seg.colorClass} transition-all duration-300 first:rounded-l-full last:rounded-r-full hover:opacity-85`}
              />
            )
          })}
        </div>

        {/* Legend & Breakdown grid */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {segments.map((seg) => (
            <div
              key={seg.key}
              data-testid={`status-segment-${seg.key}`}
              className="flex flex-col rounded-lg border border-border/60 bg-muted/30 p-2.5 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className={`size-2 shrink-0 rounded-full ${seg.dotClass}`} />
                <span className="truncate font-medium">{seg.label}</span>
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-sm font-bold text-foreground">
                  {numberFormatter.format(seg.count)}
                </span>
                <span className="text-[11px] font-semibold text-muted-foreground">
                  {seg.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
