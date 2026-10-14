import { keepPreviousData, useQuery, type UseQueryOptions } from "@tanstack/react-query"
import { employeeKeys, getEmployees } from "../api"
import type { EmployeeListInputQuery, EmployeeListResponse } from "../schema/employee.schema"

export type UseEmployeesOptions = Omit<
  UseQueryOptions<
    EmployeeListResponse,
    Error,
    EmployeeListResponse,
    ReturnType<typeof employeeKeys.list>
  >,
  "queryKey" | "queryFn"
>

/**
 * Default cache configuration for employees query.
 *
 * Page 1 receives a longer staleTime (5 minutes) because it is the primary landing
 * view and frequently revisited, ensuring instant back-navigation without refetching.
 * Subsequent pages receive a standard staleTime (1 minute).
 */
export const EMPLOYEE_CACHE_CONFIG = {
  PAGE_ONE_STALE_TIME: 5 * 60 * 1000, // 5 minutes
  DEFAULT_STALE_TIME: 60 * 1000, // 1 minute
  GC_TIME: 10 * 60 * 1000, // 10 minutes
} as const

/**
 * Hook to fetch paginated and filtered list of employees using TanStack Query.
 *
 * Keeps previous page data while loading new pages (`placeholderData: keepPreviousData`)
 * to avoid layout flickers during pagination/sorting/filtering transitions.
 *
 * Applies a deliberate staleTime strategy:
 * - Page 1 (default landing page): cached fresh for 5 minutes (`PAGE_ONE_STALE_TIME`).
 * - Page 2+: cached fresh for 1 minute (`DEFAULT_STALE_TIME`).
 */
export function useEmployees(params?: EmployeeListInputQuery, options?: UseEmployeesOptions) {
  const isPageOne = !params?.page || params.page === 1
  const defaultStaleTime = isPageOne
    ? EMPLOYEE_CACHE_CONFIG.PAGE_ONE_STALE_TIME
    : EMPLOYEE_CACHE_CONFIG.DEFAULT_STALE_TIME

  return useQuery({
    queryKey: employeeKeys.list(params),
    queryFn: () => getEmployees(params),
    placeholderData: keepPreviousData,
    staleTime: defaultStaleTime,
    gcTime: EMPLOYEE_CACHE_CONFIG.GC_TIME,
    ...options,
  })
}
