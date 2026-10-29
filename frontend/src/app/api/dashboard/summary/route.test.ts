import { describe, it, expect, vi, beforeEach } from "vitest"
import { GET } from "./route"
import * as serverModule from "@/features/dashboard/api/dashboard.server"
import type { DashboardSummary } from "@/features/dashboard/types"

vi.mock("@/env.server", () => ({
  serverEnv: {
    BACKEND_URL: "http://localhost:4000",
  },
}))

describe("GET /api/dashboard/summary (EMPTRACK-94)", () => {
  const dummySummary: DashboardSummary = {
    employees: {
      total: 50,
      active: 45,
      onLeave: 3,
      inactive: 2,
      departments: [{ department: "Engineering", count: 25, percentage: 50 }],
    },
    assets: {
      total: 100,
      assigned: 80,
      available: 15,
      maintenance: 3,
      retired: 2,
      allocationRate: 80,
      totalValue: 2000000000,
      categories: [{ category: "Laptop", count: 60, percentage: 60 }],
    },
    recentAssets: [],
  }

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("mengembalikan response 200 dengan summary data dan cache header", async () => {
    vi.spyOn(serverModule, "getDashboardSummaryServer").mockResolvedValue(dummySummary)

    const response = await GET()
    expect(response.status).toBe(200)
    expect(response.headers.get("Cache-Control")).toContain("public")

    const json = await response.json()
    expect(json.employees.total).toBe(50)
    expect(json.assets.total).toBe(100)
  })

  it("mengembalikan status 500 jika getDashboardSummaryServer melempar error", async () => {
    vi.spyOn(serverModule, "getDashboardSummaryServer").mockRejectedValue(
      new Error("Database failure"),
    )

    const response = await GET()
    expect(response.status).toBe(500)

    const json = await response.json()
    expect(json.error.code).toBe("DASHBOARD_ERROR")
  })
})
