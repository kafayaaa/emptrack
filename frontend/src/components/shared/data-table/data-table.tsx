"use client"

import * as React from "react"
import {
  columnVisibilityFeature,
  createPaginatedRowModel,
  createSortedRowModel,
  flexRender,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_text,
  tableFeatures,
  useTable,
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  type RowData,
  type SortingState,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { LucideIcon } from "lucide-react"
import { DataTablePagination } from "./data-table-pagination"
import { DataTableSkeleton } from "./data-table-skeleton"
import { DataTableEmptyState } from "./data-table-empty-state"
import { DataTableErrorState } from "./data-table-error-state"

// Modern, tree-shakeable features configuration for generic data table in v9
export const dataTableFeatures = tableFeatures({
  columnVisibilityFeature,
  rowSelectionFeature,
  rowSortingFeature,
  rowPaginationFeature,
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    text: sortFn_text,
  },
})

export type DataTableFeatures = typeof dataTableFeatures

export interface DataTableProps<TData extends RowData> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<any, TData, any>[]
  data: TData[]
  // Server-side / controlled pagination & sorting options
  pageCount?: number
  rowCount?: number
  pagination?: PaginationState
  onPaginationChange?: OnChangeFn<PaginationState>
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  isLoading?: boolean
  isFetching?: boolean
  isPlaceholderData?: boolean
  skeletonRowCount?: number
  isError?: boolean
  errorTitle?: string
  errorDescription?: string
  errorMessage?: string
  retryLabel?: string
  onRetry?: () => void
  emptyMessage?: string
  emptyTitle?: string
  emptyDescription?: string
  emptyIcon?: LucideIcon
  emptyAction?: React.ReactNode
  pageSizeOptions?: number[]
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  pageCount,
  rowCount,
  pagination: controlledPagination,
  onPaginationChange,
  sorting: controlledSorting,
  onSortingChange,
  isLoading = false,
  isFetching = false,
  isPlaceholderData = false,
  skeletonRowCount,
  isError = false,
  errorTitle,
  errorDescription,
  errorMessage,
  retryLabel,
  onRetry,
  emptyMessage,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  emptyAction,
  pageSizeOptions,
}: DataTableProps<TData>) {
  // State lokal jika tabel beroperasi un-controlled / client-side
  const [internalSorting, setInternalSorting] = React.useState<SortingState>([])
  const [internalPagination, setInternalPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const isManualPagination = typeof pageCount !== "undefined" || typeof rowCount !== "undefined"
  const isManualSorting =
    typeof controlledSorting !== "undefined" && typeof onSortingChange === "function"

  const sorting = controlledSorting ?? internalSorting
  const setSorting = onSortingChange ?? setInternalSorting

  const pagination = controlledPagination ?? internalPagination
  const setPagination = onPaginationChange ?? setInternalPagination

  const table = useTable(
    {
      features: dataTableFeatures,
      data,
      columns: columns as never,
      pageCount,
      rowCount,
      state: {
        sorting,
        pagination,
      },
      onSortingChange: setSorting,
      onPaginationChange: setPagination,
      manualPagination: isManualPagination,
      manualSorting: isManualSorting,
    },
    (state) => state,
  )

  const showTransitionFeedback = isPlaceholderData || (isFetching && !isLoading)

  return (
    <div className="flex flex-col gap-3">
      <div className="relative overflow-hidden rounded-lg border border-border bg-card shadow-xs">
        {showTransitionFeedback && (
          <div
            data-testid="data-table-translucent-indicator"
            className="absolute inset-x-0 top-0 z-10 h-0.5 animate-pulse bg-primary/70"
          />
        )}
        <div
          className={`transition-opacity duration-200 ${
            isPlaceholderData ? "pointer-events-none opacity-60" : "opacity-100"
          }`}
        >
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isError ? (
                <DataTableErrorState
                  colSpan={columns.length}
                  title={errorTitle}
                  description={errorDescription}
                  errorMessage={errorMessage}
                  retryLabel={retryLabel}
                  onRetry={onRetry}
                />
              ) : isLoading ? (
                <DataTableSkeleton
                  columnCount={columns.length}
                  rowCount={skeletonRowCount ?? pagination.pageSize ?? 5}
                />
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected?.() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <DataTableEmptyState
                  colSpan={columns.length}
                  icon={emptyIcon}
                  title={emptyTitle ?? (emptyMessage ? emptyMessage : undefined)}
                  description={emptyDescription}
                  action={emptyAction}
                />
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <DataTablePagination
        table={table}
        pageSizeOptions={pageSizeOptions}
        isDisabled={isPlaceholderData}
      />
    </div>
  )
}
