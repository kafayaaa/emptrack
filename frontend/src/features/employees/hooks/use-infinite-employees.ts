import {
  useInfiniteQuery,
  type InfiniteData,
  type UseInfiniteQueryOptions,
} from "@tanstack/react-query"
import { employeeKeys, getEmployees } from "../api"
import type { EmployeeListInputQuery, EmployeeListResponse } from "../schema/employee.schema"
import { EMPLOYEE_CACHE_CONFIG } from "./use-employees"

export type InfiniteEmployeeParams = Omit<EmployeeListInputQuery, "page">

export type UseInfiniteEmployeesOptions = Omit<
  UseInfiniteQueryOptions<
    EmployeeListResponse,
    Error,
    InfiniteData<EmployeeListResponse, number>,
    ReturnType<typeof employeeKeys.infiniteList>,
    number
  >,
  "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam"
>

/**
 * Hook to fetch paginated employees continuously in an infinite-scroll mode using TanStack Query.
 *
 * It manages pageParam incrementally starting from page 1, and automatically computes
 * the next page until `page >= totalPages`.
 */
export function useInfiniteEmployees(
  params?: InfiniteEmployeeParams,
  options?: UseInfiniteEmployeesOptions,
) {
  return useInfiniteQuery({
    queryKey: employeeKeys.infiniteList(params),
    queryFn: ({ pageParam }) =>
      getEmployees({
        ...params,
        page: pageParam,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.meta.page
      const totalPages = lastPage.meta.totalPages
      return currentPage < totalPages ? currentPage + 1 : undefined
    },
    staleTime: EMPLOYEE_CACHE_CONFIG.PAGE_ONE_STALE_TIME,
    gcTime: EMPLOYEE_CACHE_CONFIG.GC_TIME,
    ...options,
  })
}
