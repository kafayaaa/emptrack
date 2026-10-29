import React from "react"
import { describe, it, expect } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { CategoryDistribution } from "./category-distribution"
import type { AssetDashboardMetrics } from "../types"

describe("CategoryDistribution component (EMPTRACK-94)", () => {
  const dummyMetrics: AssetDashboardMetrics = {
    total: 100,
    assigned: 70,
    available: 30,
    maintenance: 0,
    retired: 0,
    allocationRate: 70,
    totalValue: 500000000,
    categories: [
      { category: "Laptop", count: 60, percentage: 60 },
      { category: "Monitor", count: 30, percentage: 30 },
      { category: "Peripheral", count: 10, percentage: 10 },
    ],
  }

  it("merender daftar kategori yang terurut berdasarkan jumlah", () => {
    const html = renderToStaticMarkup(<CategoryDistribution metrics={dummyMetrics} />)

    expect(html).toContain('data-testid="category-distribution"')
    expect(html).toContain("Kategori Perangkat")
    expect(html).toContain('data-testid="category-row-laptop"')
    expect(html).toContain("Laptop")
    expect(html).toContain("60")
    expect(html).toContain("60%")
    expect(html).toContain('data-testid="category-row-monitor"')
    expect(html).toContain("Monitor")
    expect(html).toContain("30%")
  })
})
