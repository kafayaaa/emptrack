import * as React from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import type { AssetDashboardMetrics } from "../types"

export interface CategoryDistributionProps {
  metrics: AssetDashboardMetrics
}

export function CategoryDistribution({ metrics }: CategoryDistributionProps) {
  const numberFormatter = React.useMemo(() => new Intl.NumberFormat("id-ID"), [])

  const sortedCategories = React.useMemo(() => {
    return [...metrics.categories].sort((a, b) => b.count - a.count)
  }, [metrics.categories])

  return (
    <Card data-testid="category-distribution" className="flex flex-col justify-between">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-foreground">
          Kategori Perangkat
        </CardTitle>
        <CardDescription className="text-xs">
          Sebaran aset berdasarkan tipe perangkat keras dan perlengkapan.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {sortedCategories.map((cat) => (
          <div
            key={cat.category}
            data-testid={`category-row-${cat.category.toLowerCase().replace(/\s+/g, "-")}`}
            className="space-y-1"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">{cat.category}</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">
                  {numberFormatter.format(cat.count)}
                </span>
                <span className="w-8 text-right text-[11px] text-muted-foreground">
                  {cat.percentage}%
                </span>
              </div>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60">
              <div
                style={{ width: `${Math.max(cat.percentage, cat.count > 0 ? 2 : 0)}%` }}
                className="h-full rounded-full bg-indigo-500 transition-all duration-300"
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
