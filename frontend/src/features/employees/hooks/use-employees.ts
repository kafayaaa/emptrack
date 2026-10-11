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
 * Hook to fetch paginated and filtered list of employees using TanStack Query.
 *
 * Keeps previous page data while loading new pages (`placeholderData: keepPreviousData`)
 * to avoid layout flickers during pagination/sorting/filtering transitions.
 */
export function useEmployees(params?: EmployeeListInputQuery, options?: UseEmployeesOptions) {
  return useQuery({
    queryKey: employeeKeys.list(params),
    queryFn: () => getEmployees(params),
    placeholderData: keepPreviousData,
    ...options,
  })
}
