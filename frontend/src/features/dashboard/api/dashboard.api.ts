import { apiClient } from "@/lib/api-client"
import { dashboardSummarySchema, type DashboardSummary } from "../schema/dashboard.schema"
export { dashboardKeys } from "./dashboard-keys"

export interface RequestSignalOptions {
  signal?: AbortSignal
}

/**
 * Mengambil ringkasan data metrik dashboard dari endpoint Next.js /api/dashboard/summary.
 */
export async function getDashboardSummary(
  options?: RequestSignalOptions,
): Promise<DashboardSummary> {
  return apiClient.get<DashboardSummary>("/api/dashboard/summary", {
    schema: dashboardSummarySchema,
    signal: options?.signal,
  })
}
