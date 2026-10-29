import * as React from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import type { EmployeeDashboardMetrics } from "../types"

export interface DepartmentDistributionProps {
  metrics: EmployeeDashboardMetrics
}

export function DepartmentDistribution({ metrics }: DepartmentDistributionProps) {
  const numberFormatter = React.useMemo(() => new Intl.NumberFormat("id-ID"), [])

  const sortedDepartments = React.useMemo(() => {
    return [...metrics.departments].sort((a, b) => b.count - a.count)
  }, [metrics.departments])

  return (
    <Card data-testid="department-distribution" className="flex flex-col justify-between">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-foreground">
          Distribusi Departemen
        </CardTitle>
        <CardDescription className="text-xs">
          Komposisi tenaga kerja pada tiap divisi dan departemen perusahaan.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {sortedDepartments.map((dept) => (
          <div
            key={dept.department}
            data-testid={`department-row-${dept.department.toLowerCase().replace(/\s+/g, "-")}`}
            className="space-y-1"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">{dept.department}</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">
                  {numberFormatter.format(dept.count)}
                </span>
                <span className="w-8 text-right text-[11px] text-muted-foreground">
                  {dept.percentage}%
                </span>
              </div>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60">
              <div
                style={{ width: `${Math.max(dept.percentage, dept.count > 0 ? 2 : 0)}%` }}
                className="h-full rounded-full bg-blue-500 transition-all duration-300"
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
