import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { getDashboardSummaryServer } from "./dashboard.server"

vi.mock("@/env.server", () => ({
  serverEnv: {
    BACKEND_URL: "http://localhost:4000",
  },
}))

describe("getDashboardSummaryServer (EMPTRACK-94)", () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it("berhasil mengumpulkan dan menghitung seluruh ringkasan metrik dashboard", async () => {
    globalThis.fetch = vi.fn().mockImplementation(async (url: URL | string) => {
      const urlStr = url.toString()

      // Endpoint employees count
      if (urlStr.includes("/employees?_page=1&_per_page=1")) {
        return { ok: true, json: async () => ({ items: 100, pages: 100, data: [] }) }
      }
      if (urlStr.includes("/employees?status=active")) {
        return { ok: true, json: async () => ({ items: 85, pages: 85, data: [] }) }
      }
      if (urlStr.includes("/employees?status=on_leave")) {
        return { ok: true, json: async () => ({ items: 10, pages: 10, data: [] }) }
      }
      if (urlStr.includes("/employees?status=inactive")) {
        return { ok: true, json: async () => ({ items: 5, pages: 5, data: [] }) }
      }
      if (urlStr.includes("/employees?department=")) {
        return { ok: true, json: async () => ({ items: 12, pages: 12, data: [] }) }
      }

      // Endpoint assets count
      if (urlStr.includes("/assets?_page=1&_per_page=1")) {
        return { ok: true, json: async () => ({ items: 200, pages: 200, data: [] }) }
      }
      if (urlStr.includes("/assets?status=assigned")) {
        return { ok: true, json: async () => ({ items: 150, pages: 150, data: [] }) }
      }
      if (urlStr.includes("/assets?status=available")) {
        return { ok: true, json: async () => ({ items: 30, pages: 30, data: [] }) }
      }
      if (urlStr.includes("/assets?status=maintenance")) {
        return { ok: true, json: async () => ({ items: 15, pages: 15, data: [] }) }
      }
      if (urlStr.includes("/assets?status=retired")) {
        return { ok: true, json: async () => ({ items: 5, pages: 5, data: [] }) }
      }
      if (urlStr.includes("/assets?category=")) {
        return { ok: true, json: async () => ({ items: 25, pages: 25, data: [] }) }
      }
      if (urlStr.includes("/assets?_page=1&_per_page=50")) {
        return {
          ok: true,
          json: async () => ({
            items: 200,
            pages: 4,
            data: [{ purchaseCost: 10000000 }, { purchaseCost: 20000000 }],
          }),
        }
      }
      if (urlStr.includes("/assets?_page=1&_per_page=5")) {
        return {
          ok: true,
          json: async () => ({
            items: 200,
            pages: 40,
            data: [
              {
                id: "1",
                assetTag: "AST-00001",
                name: "MacBook Pro",
                category: "Laptop",
                status: "assigned",
                purchaseDate: "2024-01-01",
                purchaseCost: 25000000,
              },
            ],
          }),
        }
      }

      return { ok: false, status: 404 }
    })

    const summary = await getDashboardSummaryServer()

    expect(summary.employees.total).toBe(100)
    expect(summary.employees.active).toBe(85)
    expect(summary.assets.total).toBe(200)
    expect(summary.assets.assigned).toBe(150)
    expect(summary.assets.allocationRate).toBe(75) // 150/200 = 75%
    expect(summary.assets.totalValue).toBe(3000000000) // avg 15M * 200 = 3B
    expect(summary.recentAssets).toHaveLength(1)
    expect(summary.recentAssets[0].assetTag).toBe("AST-00001")
  })

  it("mengembalikan nilai default yang aman jika terjadi kegagalan koneksi ke upstream", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network connection refused"))

    const summary = await getDashboardSummaryServer()

    expect(summary.employees.total).toBe(0)
    expect(summary.assets.total).toBe(0)
    expect(summary.assets.allocationRate).toBe(0)
    expect(summary.recentAssets).toEqual([])
  })
})
