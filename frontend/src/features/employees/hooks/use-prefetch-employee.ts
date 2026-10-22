import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"
import { employeeKeys, getEmployeeById } from "../api"
import { EMPLOYEE_DETAIL_CACHE_CONFIG } from "./use-employee"

/**
 * Hook to prefetch single employee detail data into TanStack Query cache.
 *
 * Typically invoked during mouse hover (`onMouseEnter`), keyboard focus (`onFocus`),
 * or touch start (`onTouchStart`) to warm up the cache before user navigation,
 * achieving near-instant page transitions (0ms perceived latency).
 */
export function usePrefetchEmployee() {
  const queryClient = useQueryClient()

  const prefetchEmployee = React.useCallback(
    (id: string | undefined | null) => {
      const normalizedId = id?.trim()
      if (!normalizedId) return

      queryClient.prefetchQuery({
        queryKey: employeeKeys.detail(normalizedId),
        queryFn: () => getEmployeeById(normalizedId),
        staleTime: EMPLOYEE_DETAIL_CACHE_CONFIG.STALE_TIME,
      })
    },
    [queryClient],
  )

  return { prefetchEmployee }
}
