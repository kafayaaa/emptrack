import { z } from "zod"
import { ASSET_CATEGORIES, ASSET_STATUSES } from "@/features/assets/schema/asset.schema"
import { EMPLOYEE_DEPARTMENTS } from "@/features/employees/constants"

/**
 * Schema untuk ringkasan metrik karyawan pada dashboard.
 */
export const employeeDashboardMetricsSchema = z.object({
  total: z.number().int().nonnegative(),
  active: z.number().int().nonnegative(),
  onLeave: z.number().int().nonnegative(),
  inactive: z.number().int().nonnegative(),
  departments: z.array(
    z.object({
      department: z.string(),
      count: z.number().int().nonnegative(),
      percentage: z.number().min(0).max(100),
    }),
  ),
})

export type EmployeeDashboardMetrics = z.infer<typeof employeeDashboardMetricsSchema>

/**
 * Schema untuk ringkasan metrik aset inventaris pada dashboard.
 */
export const assetDashboardMetricsSchema = z.object({
  total: z.number().int().nonnegative(),
  assigned: z.number().int().nonnegative(),
  available: z.number().int().nonnegative(),
  maintenance: z.number().int().nonnegative(),
  retired: z.number().int().nonnegative(),
  allocationRate: z.number().min(0).max(100),
  totalValue: z.number().nonnegative(),
  categories: z.array(
    z.object({
      category: z.string(),
      count: z.number().int().nonnegative(),
      percentage: z.number().min(0).max(100),
    }),
  ),
})

export type AssetDashboardMetrics = z.infer<typeof assetDashboardMetricsSchema>

/**
 * Schema untuk data aset terbaru pada dashboard.
 */
export const dashboardRecentAssetSchema = z.object({
  id: z.string(),
  assetTag: z.string(),
  name: z.string(),
  category: z.string(),
  status: z.string(),
  purchaseDate: z.string(),
  purchaseCost: z.number().nonnegative().optional(),
})

export type DashboardRecentAsset = z.infer<typeof dashboardRecentAssetSchema>

/**
 * Schema utama agregasi ringkasan dashboard (EMPTRACK-94).
 */
export const dashboardSummarySchema = z.object({
  employees: employeeDashboardMetricsSchema,
  assets: assetDashboardMetricsSchema,
  recentAssets: z.array(dashboardRecentAssetSchema),
})

export type DashboardSummary = z.infer<typeof dashboardSummarySchema>

export { ASSET_CATEGORIES, ASSET_STATUSES, EMPLOYEE_DEPARTMENTS }
