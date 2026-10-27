import type { InfiniteData, QueryClient, QueryKey } from "@tanstack/react-query"
import { employeeKeys } from "../api/employees.api"
import type { EmployeeListResponse } from "../schema/employee.schema"

export type EmployeeListSnapshot = Array<[QueryKey, EmployeeListResponse | undefined]>
export type EmployeeInfiniteListSnapshot = Array<
  [QueryKey, InfiniteData<EmployeeListResponse> | undefined]
>

export interface EmployeeListsCacheSnapshot {
  previousLists?: EmployeeListSnapshot
  previousInfiniteLists?: EmployeeInfiniteListSnapshot
}

/**
 * Mengambil snapshot cache dari seluruh query list karyawan (paginated & infinite)
 * untuk keperluan rollback jika mutasi gagal (EMPTRACK-82).
 */
export function snapshotEmployeeLists(queryClient: QueryClient): EmployeeListsCacheSnapshot {
  return {
    previousLists: queryClient.getQueriesData<EmployeeListResponse>({
      queryKey: employeeKeys.lists(),
    }),
    previousInfiniteLists: queryClient.getQueriesData<InfiniteData<EmployeeListResponse>>({
      queryKey: employeeKeys.infiniteLists(),
    }),
  }
}

/**
 * Melakukan rollback cache list karyawan ke snapshot data sebelumnya jika mutasi error.
 */
export function rollbackEmployeeLists(
  queryClient: QueryClient,
  snapshot?: EmployeeListsCacheSnapshot,
): void {
  if (snapshot?.previousLists) {
    for (const [queryKey, data] of snapshot.previousLists) {
      queryClient.setQueryData(queryKey, data)
    }
  }

  if (snapshot?.previousInfiniteLists) {
    for (const [queryKey, data] of snapshot.previousInfiniteLists) {
      queryClient.setQueryData(queryKey, data)
    }
  }
}

/**
 * Menginvalidasi seluruh query list karyawan (paginated & infinite)
 * untuk sinkronisasi akhir dengan database backend.
 */
export async function invalidateEmployeeLists(queryClient: QueryClient): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: employeeKeys.lists() }),
    queryClient.invalidateQueries({ queryKey: employeeKeys.infiniteLists() }),
  ])
}

/**
 * Menghapus satu atau banyak karyawan dari cache list paginated & infinite secara instan (optimistic UI).
 * Mengupdate item data, total count, dan recalculate totalPages secara otomatis.
 */
export function optimisticallyRemoveEmployeesFromCache(
  queryClient: QueryClient,
  idsToRemove: string | string[],
): void {
  const ids = Array.isArray(idsToRemove) ? idsToRemove : [idsToRemove]
  if (ids.length === 0) return

  const idSet = new Set(ids)

  // 1. Optimistic remove dari paginated lists
  queryClient.setQueriesData<EmployeeListResponse>({ queryKey: employeeKeys.lists() }, (old) => {
    if (!old?.data) return old
    const nextData = old.data.filter((emp) => !idSet.has(emp.id))
    const removedCount = old.data.length - nextData.length
    if (removedCount === 0) return old
    const nextTotal = Math.max(0, old.meta.total - removedCount)
    const nextTotalPages = Math.ceil(nextTotal / old.meta.pageSize)
    return {
      ...old,
      data: nextData,
      meta: {
        ...old.meta,
        total: nextTotal,
        totalPages: nextTotalPages,
      },
    }
  })

  // 2. Optimistic remove dari infinite lists
  queryClient.setQueriesData<InfiniteData<EmployeeListResponse>>(
    { queryKey: employeeKeys.infiniteLists() },
    (old) => {
      if (!old?.pages) return old
      let totalRemoved = 0
      const newPages = old.pages.map((page) => {
        const filtered = page.data.filter((emp) => !idSet.has(emp.id))
        totalRemoved += page.data.length - filtered.length
        return {
          ...page,
          data: filtered,
        }
      })
      if (totalRemoved === 0) return old
      const baseTotal = old.pages[0]?.meta.total ?? 0
      const nextTotal = Math.max(0, baseTotal - totalRemoved)
      return {
        ...old,
        pages: newPages.map((page) => ({
          ...page,
          meta: {
            ...page.meta,
            total: nextTotal,
            totalPages: Math.ceil(nextTotal / page.meta.pageSize),
          },
        })),
      }
    },
  )
}
