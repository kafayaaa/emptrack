"use client"

import * as React from "react"
import { VirtualizedDataTable, TableErrorBoundary } from "@/components/shared/data-table"
import { useInfiniteEmployees, type UseInfiniteEmployeesOptions } from "../hooks"
import { useDataTableSorting, type UseDataTableSortingOptions } from "../../../hooks"
import { EMPLOYEE_SORT_FIELDS, type EmployeeSortField } from "../schema/employee.schema"
import { employeeColumns } from "./columns"
import { EmployeeMobileCard } from "./employee-mobile-card"
import type { Employee, EmployeeListInputQuery } from "../types"

export interface EmployeeInfiniteTableProps {
  /**
   * Additional filter/sorting parameters (e.g. search, department, status, sortBy, sortOrder).
   */
  filters?: Omit<EmployeeListInputQuery, "page">
  /**
   * Sorting options (e.g. validFields, syncToUrl).
   */
  sortingOptions?: UseDataTableSortingOptions<EmployeeSortField>
  /**
   * TanStack Query options passed to useInfiniteEmployees hook.
   */
  queryOptions?: UseInfiniteEmployeesOptions
  /**
   * Height of the virtualized scroll viewport container. Default: 560px.
   */
  height?: number | string
}

/**
 * Connected Employee Table with Infinite Scroll, Virtualized Rows, and Server-Side Sorting.
 *
 * Automatically fetches subsequent pages as user scrolls through tens of thousands of rows,
 * rendering only elements in the current viewport for optimal 60fps performance.
 */
function BaseEmployeeInfiniteTable({
  filters,
  sortingOptions,
  queryOptions,
  height = 560,
}: EmployeeInfiniteTableProps) {
  const {
    sorting,
    onSortingChange,
    queryParams: sortingParams,
  } = useDataTableSorting<EmployeeSortField>({
    validFields: EMPLOYEE_SORT_FIELDS,
    ...sortingOptions,
  })

  const combinedFilters = React.useMemo(
    () => ({
      ...filters,
      sortBy: sortingParams.sortBy,
      sortOrder: sortingParams.sortOrder,
    }),
    [filters, sortingParams.sortBy, sortingParams.sortOrder],
  )

  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isError,
    error,
    refetch,
  } = useInfiniteEmployees(combinedFilters, queryOptions)

  // Flatten all fetched pages into a single continuous list
  const employees = React.useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? []
  }, [data?.pages])

  const totalRows = data?.pages[0]?.meta.total

  const handleRetry = React.useCallback(() => {
    void refetch()
  }, [refetch])

  const handleScrollToBottom = React.useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  return (
    <TableErrorBoundary
      title="Failed to load employees"
      description="An unexpected error occurred while rendering the employees infinite table."
      onReset={handleRetry}
    >
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1 px-1 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>
            Menampilkan <strong className="text-foreground">{employees.length}</strong>
            {totalRows ? ` dari ${totalRows.toLocaleString()}` : ""} data karyawan
          </span>
          {hasNextPage ? (
            <span className="text-[11px] text-muted-foreground/80 italic">
              Gulir ke bawah untuk memuat lebih banyak
            </span>
          ) : employees.length > 0 ? (
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              Semua data telah dimuat
            </span>
          ) : null}
        </div>

        <VirtualizedDataTable
          columns={employeeColumns}
          data={employees}
          height={height}
          estimateRowHeight={48}
          overscan={10}
          rowCount={totalRows}
          sorting={sorting}
          onSortingChange={onSortingChange}
          isLoading={isLoading}
          cellWidths={["w-20", "w-44", "w-32", "w-36", "w-20", "w-28"]}
          isFetching={isFetching}
          isFetchingNextPage={isFetchingNextPage}
          onScrollToBottom={handleScrollToBottom}
          isError={isError}
          errorTitle="Gagal memuat data karyawan"
          errorDescription="Terjadi kendala saat mengambil data karyawan dari server."
          errorMessage={error?.message}
          retryLabel="Coba Lagi"
          onRetry={handleRetry}
          emptyTitle="Tidak ada karyawan ditemukan"
          emptyDescription="Belum ada data karyawan yang cocok dengan kriteria pencarian atau filter yang dipilih."
          renderMobileCard={(employee: Employee) => (
            <EmployeeMobileCard key={employee.id} employee={employee} />
          )}
        />
      </div>
    </TableErrorBoundary>
  )
}

export const EmployeeInfiniteTable = React.memo(BaseEmployeeInfiniteTable)
