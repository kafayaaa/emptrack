import { describe, it, expect } from "vitest"
import {
  dashboardSummarySchema,
  employeeDashboardMetricsSchema,
  assetDashboardMetricsSchema,
  dashboardRecentAssetSchema,
} from "./dashboard.schema"

describe("Dashboard Schema Validation (EMPTRACK-94)", () => {
  const validSummary = {
    employees: {
      total: 100,
      active: 85,
      onLeave: 10,
      inactive: 5,
      departments: [
        { department: "Engineering", count: 40, percentage: 40 },
        { department: "Finance", count: 60, percentage: 60 },
      ],
    },
    assets: {
      total: 50,
      assigned: 35,
      available: 10,
      maintenance: 3,
      retired: 2,
      allocationRate: 70,
      totalValue: 1500000000,
      categories: [
        { category: "Laptop", count: 30, percentage: 60 },
        { category: "Monitor", count: 20, percentage: 40 },
      ],
    },
    recentAssets: [
      {
        id: "ast-1",
        assetTag: "AST-00001",
        name: "ThinkPad X1 Carbon",
        category: "Laptop",
        status: "available",
        purchaseDate: "2024-01-10",
        purchaseCost: 25000000,
      },
    ],
  }

  it("berhasil memvalidasi data ringkasan dashboard yang valid", () => {
    const result = dashboardSummarySchema.safeParse(validSummary)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.employees.total).toBe(100)
      expect(result.data.assets.allocationRate).toBe(70)
      expect(result.data.recentAssets).toHaveLength(1)
    }
  })

  it("menolak nilai negatif pada metrik karyawan", () => {
    const invalid = {
      ...validSummary.employees,
      total: -5,
    }
    const result = employeeDashboardMetricsSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it("menolak persentase yang melebihi 100", () => {
    const invalid = {
      ...validSummary.assets,
      allocationRate: 150,
    }
    const result = assetDashboardMetricsSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it("berhasil memvalidasi recent asset tanpa purchaseCost", () => {
    const assetWithoutCost = {
      id: "ast-2",
      assetTag: "AST-00002",
      name: "Logitech MX Master",
      category: "Peripheral",
      status: "assigned",
      purchaseDate: "2024-02-15",
    }
    const result = dashboardRecentAssetSchema.safeParse(assetWithoutCost)
    expect(result.success).toBe(true)
  })
})
