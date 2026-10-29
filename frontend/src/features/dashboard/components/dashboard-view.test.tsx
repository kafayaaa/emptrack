import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { DashboardView } from "./dashboard-view"
import * as hooksModule from "../hooks/use-dashboard-summary"
import type { DashboardSummary } from "../types"

vi.mock("@/features/employees", () => ({
  EmployeeCreateDialog: () => <button>Tambah Karyawan Mock</button>,
}))

vi.mock("@/features/assets", () => ({
  AssetCreateDialog: () => <button>Tambah Aset Mock</button>,
}))

describe("DashboardView component (EMPTRACK-94)", () => {
  const dummySummary: DashboardSummary = {
    employees: {
      total: 100,
      active: 85,
      onLeave: 10,
      inactive: 5,
      departments: [{ department: "Engineering", count: 100, percentage: 100 }],
    },
    assets: {
      total: 200,
      assigned: 150,
      available: 30,
      maintenance: 15,
      retired: 5,
      allocationRate: 75,
      totalValue: 5000000000,
      categories: [{ category: "Laptop", count: 200, percentage: 100 }],
    },
    recentAssets: [
      {
        id: "ast-1",
        assetTag: "AST-00001",
        name: "MacBook Pro 16",
        category: "Laptop",
        status: "assigned",
        purchaseDate: "2024-01-01",
      },
    ],
  }

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("merender tampilan lengkap dashboard saat data berhasil dimuat", () => {
    vi.spyOn(hooksModule, "useDashboardSummary").mockReturnValue({
      data: dummySummary,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof hooksModule.useDashboardSummary>)

    const html = renderToStaticMarkup(<DashboardView initialData={dummySummary} />)

    expect(html).toContain('data-testid="dashboard-view"')
    expect(html).toContain("Dashboard")
    expect(html).toContain("Overview of key organization metrics and operations.")

    // Quick Action buttons
    expect(html).toContain("Tambah Karyawan Mock")
    expect(html).toContain("Tambah Aset Mock")

    // Sub-components
    expect(html).toContain('data-testid="dashboard-stats-grid"')
    expect(html).toContain('data-testid="asset-status-chart"')
    expect(html).toContain('data-testid="category-distribution"')
    expect(html).toContain('data-testid="department-distribution"')
    expect(html).toContain('data-testid="recent-assets-card"')
  })

  it("merender skeleton saat status query sedang loading", () => {
    vi.spyOn(hooksModule, "useDashboardSummary").mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as unknown as ReturnType<typeof hooksModule.useDashboardSummary>)

    const html = renderToStaticMarkup(<DashboardView />)

    expect(html).toContain('data-testid="dashboard-skeleton"')
  })

  it("merender pesan error saat gagal memuat data", () => {
    vi.spyOn(hooksModule, "useDashboardSummary").mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as unknown as ReturnType<typeof hooksModule.useDashboardSummary>)

    const html = renderToStaticMarkup(<DashboardView />)

    expect(html).toContain('data-testid="dashboard-error-state"')
    expect(html).toContain("Terjadi kesalahan saat memuat data ringkasan dashboard.")
  })
})
