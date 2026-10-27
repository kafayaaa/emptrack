import { createQueryKeyFactory } from "@/lib/query-keys"
import type { EmployeeListInputQuery } from "../schema/employee.schema"

type InfiniteEmployeeParams = Omit<EmployeeListInputQuery, "page">

/**
 * Standardized Query Key Factory for Employee domain (EMPTRACK-79).
 *
 * Provides strictly typed, hierarchical query key tuples for cache access,
 * invalidations, optimistic updates, and prefetching across all employee views.
 *
 * Structure:
 * - employeeKeys.all -> ["employees"]
 * - employeeKeys.lists() -> ["employees", "list"]
 * - employeeKeys.list(params) -> ["employees", "list", params]
 * - employeeKeys.infiniteLists() -> ["employees", "infinite-list"]
 * - employeeKeys.infiniteList(params) -> ["employees", "infinite-list", params]
 * - employeeKeys.details() -> ["employees", "detail"]
 * - employeeKeys.detail(id) -> ["employees", "detail", id]
 * - employeeKeys.checkEmail(email, excludeId) -> ["employees", "check-email", email, excludeId]
 */
export const employeeKeys = createQueryKeyFactory<
  "employees",
  EmployeeListInputQuery,
  InfiniteEmployeeParams,
  string,
  {
    checkEmail: (
      email: string,
      excludeId?: string,
    ) => readonly ["employees", "check-email", string, string | undefined]
  }
>("employees", {
  checkEmail: (email: string, excludeId?: string) =>
    ["employees", "check-email", email.trim().toLowerCase(), excludeId] as const,
})
