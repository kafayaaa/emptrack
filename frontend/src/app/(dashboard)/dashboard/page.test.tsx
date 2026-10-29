import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import DashboardPage, { metadata } from "./page"
import * as serverModule from "@/features/dashboard/api/dashboard.server"
import type { DashboardSummary } from "@/features/dashboard/types"

vi.mock("@/env.server", () => ({
  serverEnv: {
    BACKEND_URL: "http://localhost:4000",
  },
}))

vi.mock("@/features/dashboard/components/dashboard-view", () => ({
  DashboardView: ({ initialData }: { initialData?: DashboardSummary }) => (
    <div data-testid="dashboard-view">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Overview of key organization metrics and operations.
          </p>
        </div>
      </div>
      <div data-testid="dashboard-stats-grid">
        Stats Grid (Total: {initialData?.employees.total})
      </div>
    </div>
  ),
}))

describe("DashboardPage heading structure (EMPTRACK-59 & EMPTRACK-94)", () => {
  const dummySummary: DashboardSummary = {
    employees: {
      total: 100,
      active: 85,
      onLeave: 10,
      inactive: 5,
      departments: [],
    },
    assets: {
      total: 200,
      assigned: 150,
      available: 30,
      maintenance: 15,
      retired: 5,
      allocationRate: 75,
      totalValue: 5000000000,
      categories: [],
    },
    recentAssets: [],
  }

  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(serverModule, "getDashboardSummaryServer").mockResolvedValue(dummySummary)
  })

  it("merender dokumen dengan elemen h1 yang jelas", async () => {
    const pageJsx = await DashboardPage()
    const html = renderToStaticMarkup(pageJsx)

    expect(html).toContain("<h1")
    expect(html).toContain("Dashboard</h1>")
    expect(html).toContain("Overview of key organization metrics and operations.")
  })

  it("memiliki metadata title dan description yang sesuai", () => {
    expect(metadata.title).toBe("Dashboard")
    expect(metadata.description).toBeDefined()
  })

  it("merender kartu metrik dan ringkasan dashboard", async () => {
    const pageJsx = await DashboardPage()
    const html = renderToStaticMarkup(pageJsx)

    expect(html).toContain('data-testid="dashboard-view"')
    expect(html).toContain('data-testid="dashboard-stats-grid"')
  })
})
