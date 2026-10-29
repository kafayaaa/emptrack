"use client"

import { useQuery } from "@tanstack/react-query"
import { getDashboardSummary, dashboardKeys } from "../api"
import type { DashboardSummary } from "../types"

export interface UseDashboardSummaryOptions {
  initialData?: DashboardSummary
  enabled?: boolean
}

/**
 * React Query hook untuk memuat data ringkasan metrik dashboard (EMPTRACK-94).
 */
export function useDashboardSummary(options?: UseDashboardSummaryOptions) {
  return useQuery<DashboardSummary, Error>({
    queryKey: dashboardKeys.summary(),
    queryFn: ({ signal }) => getDashboardSummary({ signal }),
    initialData: options?.initialData,
    enabled: options?.enabled ?? true,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}
