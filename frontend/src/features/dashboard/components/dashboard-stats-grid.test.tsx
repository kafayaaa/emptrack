import React from "react"
import { describe, it, expect } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { DashboardStatsGrid } from "./dashboard-stats-grid"
import type { DashboardSummary } from "../types"

describe("DashboardStatsGrid component (EMPTRACK-94)", () => {
  const dummySummary: DashboardSummary = {
    employees: {
      total: 1500,
      active: 1400,
      onLeave: 70,
      inactive: 30,
      departments: [],
    },
    assets: {
      total: 2400,
      assigned: 1800,
      available: 500,
      maintenance: 70,
      retired: 30,
      allocationRate: 75,
      totalValue: 12500000000,
      categories: [],
    },
    recentAssets: [],
  }

  it("merender 4 kartu metrik utama dengan format angka dan mata uang yang tepat", () => {
    const html = renderToStaticMarkup(<DashboardStatsGrid summary={dummySummary} />)

    expect(html).toContain('data-testid="dashboard-stats-grid"')

    // Total Karyawan
    expect(html).toContain('data-testid="stat-card-total-employees"')
    expect(html).toContain("Total Karyawan")
    expect(html).toContain("1.500")

    // Total Aset
    expect(html).toContain('data-testid="stat-card-total-assets"')
    expect(html).toContain("Total Aset Inventaris")
    expect(html).toContain("2.400")

    // Tingkat Utilisasi
    expect(html).toContain('data-testid="stat-card-allocation-rate"')
    expect(html).toContain("Tingkat Utilisasi Aset")
    expect(html).toContain("75%")

    // Total Valuasi
    expect(html).toContain('data-testid="stat-card-total-valuation"')
    expect(html).toContain("Total Valuasi Pengadaan")
    expect(html).toContain("12.500.000.000")
  })
})
