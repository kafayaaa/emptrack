"use client"

import * as React from "react"
import { DataTable, TableErrorBoundary } from "@/components/shared/data-table"
import { useAssets, type UseAssetsOptions } from "../hooks"
import {
  useDataTablePagination,
  useDataTableSorting,
  type UseDataTablePaginationOptions,
  type UseDataTableSortingOptions,
} from "@/hooks"
import type { ColumnVisibilityState, OnChangeFn, RowSelectionState } from "@tanstack/react-table"
import { ASSET_SORT_FIELDS, type AssetSortField } from "../schema/asset.schema"
import { assetColumns, getAssetColumnLabel } from "./columns"
import { AssetMobileCard } from "./asset-mobile-card"
import type { Asset, AssetListInputQuery } from "../types"

export interface AssetTableProps {
  /**
   * Additional filter/sorting parameters (e.g. search, category, status).
   */
  filters?: Omit<AssetListInputQuery, "page" | "pageSize">
  /**
   * Pagination options (e.g. defaultPageSize, syncToUrl).
   */
  paginationOptions?: UseDataTablePaginationOptions
  /**
   * Sorting options (e.g. validFields, syncToUrl).
   */
  sortingOptions?: UseDataTableSortingOptions<AssetSortField>
  /**
   * TanStack Query options passed to useAssets hook.
   */
  queryOptions?: UseAssetsOptions
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
 * Connected Asset Table (EMPTRACK-87) reusing the generic DataTable component from shared/.
 * Provides server-side pagination, sorting, row selection, column visibility,
 * responsive mobile cards, error boundary, and skeleton loading states.
 */
function BaseAssetTable({
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
}: AssetTableProps) {
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
  } = useDataTableSorting<AssetSortField>({
    validFields: ASSET_SORT_FIELDS,
    ...sortingOptions,
  })

  const requestParams: AssetListInputQuery = React.useMemo(
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

  const { data, isLoading, isFetching, isPlaceholderData, isError, error, refetch } = useAssets(
    requestParams,
    queryOptions,
  )

  const assets = React.useMemo(() => data?.data ?? [], [data?.data])
  const totalRows = data?.meta.total
  const totalPages = data?.meta.totalPages

  const handleRetry = React.useCallback(() => {
    void refetch()
  }, [refetch])

  return (
    <TableErrorBoundary
      title="Gagal memuat data aset"
      description="Terjadi kendala saat merender tabel data aset."
      onReset={handleRetry}
    >
      <DataTable
        ariaLabel="Tabel Data Aset Inventaris"
        columns={assetColumns}
        data={assets}
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
        getColumnLabel={getAssetColumnLabel}
        pageSizeOptions={pageSizeOptions}
        isLoading={isLoading}
        isFetching={isFetching}
        isPlaceholderData={isPlaceholderData}
        skeletonRowCount={pagination.pageSize}
        cellWidths={["w-10", "w-24", "w-44", "w-28", "w-36", "w-24", "w-32", "w-28", "w-28"]}
        isError={isError}
        errorTitle="Gagal memuat data aset"
        errorDescription="Terjadi kendala saat mengambil data aset dari server."
        errorMessage={error?.message}
        retryLabel="Coba Lagi"
        onRetry={handleRetry}
        emptyTitle="Tidak ada aset ditemukan"
        emptyDescription="Belum ada data aset inventaris yang cocok dengan kriteria pencarian atau filter yang dipilih."
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        renderMobileCard={(asset: Asset, _index: number, row?: any) => (
          <AssetMobileCard
            key={asset.id}
            asset={asset}
            isSelected={row?.getIsSelected?.()}
            onSelectChange={(val) => row?.toggleSelected?.(val)}
          />
        )}
      />
    </TableErrorBoundary>
  )
}

export const AssetTable = React.memo(BaseAssetTable)
