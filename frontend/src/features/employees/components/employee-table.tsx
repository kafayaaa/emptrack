"use client"

import * as React from "react"
import { DataTable, TableErrorBoundary } from "@/components/shared/data-table"
import { useEmployees, type UseEmployeesOptions } from "../hooks"
import {
  useDataTablePagination,
  useDataTableSorting,
  type UseDataTablePaginationOptions,
  type UseDataTableSortingOptions,
} from "../../../hooks"
import type { ColumnVisibilityState, OnChangeFn, RowSelectionState } from "@tanstack/react-table"
import { EMPLOYEE_SORT_FIELDS, type EmployeeSortField } from "../schema/employee.schema"
import { employeeColumns, getEmployeeColumnLabel } from "./columns"
import { EmployeeMobileCard } from "./employee-mobile-card"
import type { Employee, EmployeeListInputQuery } from "../types"

export interface EmployeeTableProps {
  /**
   * Additional filter/sorting parameters (e.g. search, department, status).
   */
  filters?: Omit<EmployeeListInputQuery, "page" | "pageSize">
  /**
   * Pagination options (e.g. defaultPageSize, syncToUrl).
   */
  paginationOptions?: UseDataTablePaginationOptions
  /**
   * Sorting options (e.g. validFields, syncToUrl).
   */
  sortingOptions?: UseDataTableSortingOptions<EmployeeSortField>
  /**
   * TanStack Query options passed to useEmployees hook.
   */
  queryOptions?: UseEmployeesOptions
  /**
   * Page size options shown in the pagination dropdown.
   */
  pageSizeOptions?: number[]
  /**
   * Column visibility state for controlled visibility.
   */
  columnVisibility?: ColumnVisibilityState
  /**
   * Callback fired when column visibility changes.
   */
  onColumnVisibilityChange?: OnChangeFn<ColumnVisibilityState>
  /**
   * Row selection state for controlled selection.
   */
  rowSelection?: RowSelectionState
  /**
   * Callback fired when row selection changes.
   */
  onRowSelectionChange?: OnChangeFn<RowSelectionState>
  /**
   * Whether to display the Column Visibility DropdownMenu above the table. Default: true.
   */
  showColumnVisibility?: boolean
}

/**
 * Connected Employee Table with server-side pagination, server-side sorting, skeleton loading,
 * error state handling, and empty state support.
 */
function BaseEmployeeTable({
  filters,
  paginationOptions,
  sortingOptions,
  queryOptions,
  pageSizeOptions = [10, 20, 30, 50, 100],
  columnVisibility,
  onColumnVisibilityChange,
  rowSelection,
  onRowSelectionChange,
  showColumnVisibility = true,
}: EmployeeTableProps) {
  const {
    pagination,
    onPaginationChange,
    queryParams: paginationParams,
  } = useDataTablePagination({
    defaultPageSize: 10,
    ...paginationOptions,
  })

  const {
    sorting,
    onSortingChange,
    queryParams: sortingParams,
  } = useDataTableSorting<EmployeeSortField>({
    validFields: EMPLOYEE_SORT_FIELDS,
    ...sortingOptions,
  })

  // Combine pagination & sorting params with additional filters
  const requestParams: EmployeeListInputQuery = React.useMemo(
    () => ({
      ...filters,
      page: paginationParams.page,
      pageSize: paginationParams.pageSize,
      sortBy: sortingParams.sortBy,
      sortOrder: sortingParams.sortOrder,
    }),
    [
      filters,
      paginationParams.page,
      paginationParams.pageSize,
      sortingParams.sortBy,
      sortingParams.sortOrder,
    ],
  )

  const { data, isLoading, isFetching, isPlaceholderData, isError, error, refetch } = useEmployees(
    requestParams,
    queryOptions,
  )

  const employees = React.useMemo(() => data?.data ?? [], [data?.data])
  const totalRows = data?.meta.total
  const totalPages = data?.meta.totalPages

  const handleRetry = React.useCallback(() => {
    void refetch()
  }, [refetch])

  return (
    <TableErrorBoundary
      title="Failed to load employees"
      description="An unexpected error occurred while rendering the employees table."
      onReset={handleRetry}
    >
      <DataTable
        columns={employeeColumns}
        data={employees}
        rowCount={totalRows}
        pageCount={totalPages}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        sorting={sorting}
        onSortingChange={onSortingChange}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={onColumnVisibilityChange}
        rowSelection={rowSelection}
        onRowSelectionChange={onRowSelectionChange}
        getRowId={(row) => row.id}
        showColumnVisibility={showColumnVisibility}
        getColumnLabel={getEmployeeColumnLabel}
        pageSizeOptions={pageSizeOptions}
        isLoading={isLoading}
        isFetching={isFetching}
        isPlaceholderData={isPlaceholderData}
        skeletonRowCount={pagination.pageSize}
        cellWidths={["w-10", "w-20", "w-44", "w-32", "w-36", "w-20", "w-28"]}
        isError={isError}
        errorTitle="Gagal memuat data karyawan"
        errorDescription="Terjadi kendala saat mengambil data karyawan dari server."
        errorMessage={error?.message}
        retryLabel="Coba Lagi"
        onRetry={handleRetry}
        emptyTitle="Tidak ada karyawan ditemukan"
        emptyDescription="Belum ada data karyawan yang cocok dengan kriteria pencarian atau filter yang dipilih."
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        renderMobileCard={(employee: Employee, _index: number, row?: any) => (
          <EmployeeMobileCard
            key={employee.id}
            employee={employee}
            isSelected={row?.getIsSelected?.()}
            onSelectChange={(val) => row?.toggleSelected?.(val)}
          />
        )}
      />
    </TableErrorBoundary>
  )
}

export const EmployeeTable = React.memo(BaseEmployeeTable)
