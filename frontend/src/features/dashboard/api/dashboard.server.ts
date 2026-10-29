import "server-only"
import { serverEnv } from "@/env.server"
import {
  dashboardSummarySchema,
  type DashboardSummary,
  type DashboardRecentAsset,
} from "../schema/dashboard.schema"
import { EMPLOYEE_DEPARTMENTS } from "@/features/employees/constants"
import { ASSET_CATEGORIES } from "@/features/assets/schema/asset.schema"

interface JsonServerPageResponse<T = unknown> {
  items: number
  pages: number
  data: T[]
}

async function fetchCount(url: URL): Promise<{ count: number; data: unknown[] }> {
  try {
    const res = await fetch(url, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) {
      return { count: 0, data: [] }
    }
    const json = (await res.json()) as JsonServerPageResponse
    return {
      count: typeof json.items === "number" ? json.items : 0,
      data: Array.isArray(json.data) ? json.data : [],
    }
  } catch {
    return { count: 0, data: [] }
  }
}

/**
 * Server-only fetcher untuk mengumpulkan dan menghitung seluruh ringkasan metrik dashboard (EMPTRACK-94).
 * Menggunakan query upstream paralel dengan caching Next.js revalidation.
 */
export async function getDashboardSummaryServer(): Promise<DashboardSummary> {
  const backendUrl = serverEnv.BACKEND_URL

  const employeeTotalUrl = new URL("/employees?_page=1&_per_page=1", backendUrl)
  const employeeActiveUrl = new URL("/employees?status=active&_page=1&_per_page=1", backendUrl)
  const employeeOnLeaveUrl = new URL("/employees?status=on_leave&_page=1&_per_page=1", backendUrl)
  const employeeInactiveUrl = new URL("/employees?status=inactive&_page=1&_per_page=1", backendUrl)

  const assetTotalUrl = new URL("/assets?_page=1&_per_page=1", backendUrl)
  const assetAssignedUrl = new URL("/assets?status=assigned&_page=1&_per_page=1", backendUrl)
  const assetAvailableUrl = new URL("/assets?status=available&_page=1&_per_page=1", backendUrl)
  const assetMaintenanceUrl = new URL("/assets?status=maintenance&_page=1&_per_page=1", backendUrl)
  const assetRetiredUrl = new URL("/assets?status=retired&_page=1&_per_page=1", backendUrl)

  const recentAssetsUrl = new URL("/assets?_page=1&_per_page=5", backendUrl)
  const assetSampleUrl = new URL("/assets?_page=1&_per_page=50", backendUrl)

  try {
    const [
      empTotalRes,
      empActiveRes,
      empOnLeaveRes,
      empInactiveRes,
      assetTotalRes,
      assetAssignedRes,
      assetAvailableRes,
      assetMaintenanceRes,
      assetRetiredRes,
      recentAssetsRes,
      assetSampleRes,
    ] = await Promise.all([
      fetchCount(employeeTotalUrl),
      fetchCount(employeeActiveUrl),
      fetchCount(employeeOnLeaveUrl),
      fetchCount(employeeInactiveUrl),
      fetchCount(assetTotalUrl),
      fetchCount(assetAssignedUrl),
      fetchCount(assetAvailableUrl),
      fetchCount(assetMaintenanceUrl),
      fetchCount(assetRetiredUrl),
      fetchCount(recentAssetsUrl),
      fetchCount(assetSampleUrl),
    ])

    const totalEmployees = empTotalRes.count
    const activeEmployees = empActiveRes.count
    const onLeaveEmployees = empOnLeaveRes.count
    const inactiveEmployees = empInactiveRes.count

    const totalAssets = assetTotalRes.count
    const assignedAssets = assetAssignedRes.count
    const availableAssets = assetAvailableRes.count
    const maintenanceAssets = assetMaintenanceRes.count
    const retiredAssets = assetRetiredRes.count

    // Hitung alokasi rate
    const allocationRate =
      totalAssets > 0 ? Math.min(100, Math.round((assignedAssets / totalAssets) * 100)) : 0

    // Hitung estimasi valuasi dari sample average jika data besar
    let totalValue = 0
    if (assetSampleRes.data.length > 0) {
      const sampleCostSum = (assetSampleRes.data as Array<{ purchaseCost?: unknown }>).reduce(
        (sum: number, item) => {
          const cost = Number(item.purchaseCost) || 0
          return sum + cost
        },
        0,
      )
      const avgCost = sampleCostSum / assetSampleRes.data.length
      totalValue = Math.round(avgCost * totalAssets)
    }

    // Hitung per departemen (secara paralel)
    const departmentResults = await Promise.all(
      EMPLOYEE_DEPARTMENTS.map(async (dept) => {
        const url = new URL(
          `/employees?department=${encodeURIComponent(dept)}&_page=1&_per_page=1`,
          backendUrl,
        )
        const res = await fetchCount(url)
        return {
          department: dept,
          count: res.count,
          percentage: totalEmployees > 0 ? Math.round((res.count / totalEmployees) * 100) : 0,
        }
      }),
    )

    // Hitung per kategori aset (secara paralel)
    const categoryResults = await Promise.all(
      ASSET_CATEGORIES.map(async (cat) => {
        const url = new URL(
          `/assets?category=${encodeURIComponent(cat)}&_page=1&_per_page=1`,
          backendUrl,
        )
        const res = await fetchCount(url)
        return {
          category: cat,
          count: res.count,
          percentage: totalAssets > 0 ? Math.round((res.count / totalAssets) * 100) : 0,
        }
      }),
    )

    const recentAssets: DashboardRecentAsset[] = (
      recentAssetsRes.data as Array<Record<string, unknown>>
    ).map((raw) => ({
      id: String(raw.id),
      assetTag: String(raw.assetTag || `AST-${String(raw.id)}`),
      name: String(raw.name || "Aset"),
      category: String(raw.category || "Other"),
      status: String(raw.status || "available"),
      purchaseDate: String(raw.purchaseDate || new Date().toISOString().split("T")[0]),
      purchaseCost: Number(raw.purchaseCost) || 0,
    }))

    const result: DashboardSummary = {
      employees: {
        total: totalEmployees,
        active: activeEmployees,
        onLeave: onLeaveEmployees,
        inactive: inactiveEmployees,
        departments: departmentResults,
      },
      assets: {
        total: totalAssets,
        assigned: assignedAssets,
        available: availableAssets,
        maintenance: maintenanceAssets,
        retired: retiredAssets,
        allocationRate,
        totalValue,
        categories: categoryResults,
      },
      recentAssets,
    }

    return dashboardSummarySchema.parse(result)
  } catch {
    // Graceful fallback jika terjadi error
    return {
      employees: {
        total: 0,
        active: 0,
        onLeave: 0,
        inactive: 0,
        departments: EMPLOYEE_DEPARTMENTS.map((d) => ({ department: d, count: 0, percentage: 0 })),
      },
      assets: {
        total: 0,
        assigned: 0,
        available: 0,
        maintenance: 0,
        retired: 0,
        allocationRate: 0,
        totalValue: 0,
        categories: ASSET_CATEGORIES.map((c) => ({ category: c, count: 0, percentage: 0 })),
      },
      recentAssets: [],
    }
  }
}
