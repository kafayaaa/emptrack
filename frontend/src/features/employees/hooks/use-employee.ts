import { useQuery, type UseQueryOptions } from "@tanstack/react-query"
import { employeeKeys, getEmployeeById } from "../api"
import type { Employee } from "../schema/employee.schema"

export type UseEmployeeOptions = Omit<
  UseQueryOptions<Employee, Error, Employee, ReturnType<typeof employeeKeys.detail>>,
  "queryKey" | "queryFn"
>

export const EMPLOYEE_DETAIL_CACHE_CONFIG = {
  STALE_TIME: 5 * 60 * 1000, // 5 minutes fresh cache
  GC_TIME: 10 * 60 * 1000, // 10 minutes garbage collection time
} as const

/**
 * Hook to fetch a single employee by ID using TanStack Query.
 *
 * Caches employee details fresh for 5 minutes (STALE_TIME) and keeps in memory
 * for 10 minutes (GC_TIME), providing instant back-and-forth navigation.
 */
export function useEmployee(id: string, options?: UseEmployeeOptions) {
  return useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: ({ signal }) => getEmployeeById(id, { signal }),
    enabled: Boolean(id && id.trim().length > 0),
    staleTime: EMPLOYEE_DETAIL_CACHE_CONFIG.STALE_TIME,
    gcTime: EMPLOYEE_DETAIL_CACHE_CONFIG.GC_TIME,
    ...options,
  })
}
