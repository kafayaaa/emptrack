"use client"

import * as React from "react"
import { DataTable, TableErrorBoundary } from "@/components/shared/data-table"
import { useEmployees, type UseEmployeesOptions } from "../hooks"
import { useDataTablePagination, type UseDataTablePaginationOptions } from "../../../hooks"
import { employeeColumns } from "./columns"
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
   * TanStack Query options passed to useEmployees hook.
   */
  queryOptions?: UseEmployeesOptions
  /**
   * Page size options shown in the pagination dropdown.
   */
  pageSizeOptions?: number[]
}

/**
 * Connected Employee Table with server-side pagination, skeleton loading,
 * error state handling, and empty state support.
 */
function BaseEmployeeTable({
  filters,
  paginationOptions,
  queryOptions,
  pageSizeOptions = [10, 20, 30, 50, 100],
}: EmployeeTableProps) {
  const { pagination, onPaginationChange, queryParams } = useDataTablePagination({
    defaultPageSize: 10,
    ...paginationOptions,
  })

  // Combine pagination params (page, pageSize) with additional filters
  const requestParams: EmployeeListInputQuery = React.useMemo(
    () => ({
      ...filters,
      page: queryParams.page,
      pageSize: queryParams.pageSize,
    }),
    [filters, queryParams.page, queryParams.pageSize],
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
        pageSizeOptions={pageSizeOptions}
        isLoading={isLoading}
        isFetching={isFetching}
        isPlaceholderData={isPlaceholderData}
        skeletonRowCount={pagination.pageSize}
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
    </TableErrorBoundary>
  )
}

export const EmployeeTable = React.memo(BaseEmployeeTable)
