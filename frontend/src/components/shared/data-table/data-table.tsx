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
  type ColumnVisibilityState,
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
import { DataTableColumnVisibility } from "./data-table-column-visibility"

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
  columnVisibility?: ColumnVisibilityState
  onColumnVisibilityChange?: OnChangeFn<ColumnVisibilityState>
  /**
   * Whether to display the column visibility toggle dropdown button above the table.
   */
  showColumnVisibility?: boolean
  /**
   * Optional custom column label mapping for the visibility dropdown.
   */
  getColumnLabel?: (columnId: string) => string
  /**
   * Optional custom toolbar element or function receiving the table instance.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toolbar?: React.ReactNode | ((table: any) => React.ReactNode)
  isLoading?: boolean
  isFetching?: boolean
  isPlaceholderData?: boolean
  skeletonRowCount?: number
  cellWidths?: string[]
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
  /**
   * Optional custom card renderer for responsive mobile layout (< md screen).
   * If provided, cards will be rendered instead of the table on mobile viewports.
   */
  renderMobileCard?: (item: TData, index: number) => React.ReactNode
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
  columnVisibility: controlledColumnVisibility,
  onColumnVisibilityChange,
  showColumnVisibility = false,
  getColumnLabel,
  toolbar,
  isLoading = false,
  isFetching = false,
  isPlaceholderData = false,
  skeletonRowCount,
  cellWidths,
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
  renderMobileCard,
}: DataTableProps<TData>) {
  // State lokal jika tabel beroperasi un-controlled / client-side
  const [internalSorting, setInternalSorting] = React.useState<SortingState>([])
  const [internalPagination, setInternalPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [internalColumnVisibility, setInternalColumnVisibility] =
    React.useState<ColumnVisibilityState>({})

  const isManualPagination = typeof pageCount !== "undefined" || typeof rowCount !== "undefined"
  const isManualSorting =
    typeof controlledSorting !== "undefined" && typeof onSortingChange === "function"

  const sorting = controlledSorting ?? internalSorting
  const setSorting = onSortingChange ?? setInternalSorting

  const pagination = controlledPagination ?? internalPagination
  const setPagination = onPaginationChange ?? setInternalPagination

  const columnVisibility = controlledColumnVisibility ?? internalColumnVisibility
  const setColumnVisibility = onColumnVisibilityChange ?? setInternalColumnVisibility

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
        columnVisibility,
      },
      onSortingChange: setSorting,
      onPaginationChange: setPagination,
      onColumnVisibilityChange: setColumnVisibility,
      manualPagination: isManualPagination,
      manualSorting: isManualSorting,
    },
    (state) => state,
  )

  const showTransitionFeedback = isPlaceholderData || (isFetching && !isLoading)
  const visibleColumnCount = table.getVisibleLeafColumns().length || columns.length

  return (
    <div className="flex flex-col gap-3">
      {(showColumnVisibility || toolbar) && (
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {typeof toolbar === "function" ? toolbar(table) : toolbar}
          </div>
          {showColumnVisibility && (
            <DataTableColumnVisibility table={table} getColumnLabel={getColumnLabel} />
          )}
        </div>
      )}

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
          {/* Mobile Card View (visible on < md when renderMobileCard is provided) */}
          {renderMobileCard && (
            <div className="block md:hidden">
              {isError ? (
                <div className="p-4">
                  <DataTableErrorState
                    colSpan={1}
                    title={errorTitle}
                    description={errorDescription}
                    errorMessage={errorMessage}
                    retryLabel={retryLabel}
                    onRetry={onRetry}
                  />
                </div>
              ) : isLoading ? (
                <div className="flex flex-col gap-3 p-4">
                  {Array.from({ length: skeletonRowCount ?? pagination.pageSize ?? 5 }).map(
                    (_, idx) => (
                      <div
                        key={`mobile-skeleton-${idx}`}
                        className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="h-5 w-32 animate-pulse rounded bg-muted" />
                          <div className="h-5 w-16 animate-pulse rounded bg-muted" />
                        </div>
                        <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                      </div>
                    ),
                  )}
                </div>
              ) : table.getRowModel().rows?.length ? (
                <div className="flex flex-col gap-3 p-3">
                  {table.getRowModel().rows.map((row, index) => (
                    <React.Fragment key={row.id}>
                      {renderMobileCard(row.original, index)}
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <div className="p-4">
                  <DataTableEmptyState
                    colSpan={1}
                    icon={emptyIcon}
                    title={emptyTitle ?? (emptyMessage ? emptyMessage : undefined)}
                    description={emptyDescription}
                    action={emptyAction}
                  />
                </div>
              )}
            </div>
          )}

          {/* Desktop Table View (always available on >= md, or on all viewports if renderMobileCard is omitted) */}
          <div className={renderMobileCard ? "hidden md:block" : "block"}>
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
                    colSpan={visibleColumnCount}
                    title={errorTitle}
                    description={errorDescription}
                    errorMessage={errorMessage}
                    retryLabel={retryLabel}
                    onRetry={onRetry}
                  />
                ) : isLoading ? (
                  <DataTableSkeleton
                    columnCount={visibleColumnCount}
                    rowCount={skeletonRowCount ?? pagination.pageSize ?? 5}
                    cellWidths={cellWidths}
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
                    colSpan={visibleColumnCount}
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
      </div>

      <DataTablePagination
        table={table}
        pageSizeOptions={pageSizeOptions}
        isDisabled={isPlaceholderData}
      />
    </div>
  )
}
