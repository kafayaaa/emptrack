"use client"

import * as React from "react"
import {
  flexRender,
  useTable,
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  type RowData,
  type SortingState,
} from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import { LucideIcon } from "lucide-react"

import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DataTablePagination } from "./data-table-pagination"
import { DataTableSkeleton } from "./data-table-skeleton"
import { DataTableEmptyState } from "./data-table-empty-state"
import { DataTableErrorState } from "./data-table-error-state"
import { dataTableFeatures } from "./data-table"

export interface VirtualizedDataTableProps<TData extends RowData> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<any, TData, any>[]
  data: TData[]

  /**
   * Approximate height in pixels for each table row. Default: 48px.
   */
  estimateRowHeight?: number

  /**
   * Number of items to render above and below the visible viewport window. Default: 10.
   */
  overscan?: number

  /**
   * Height of the virtual scrollable container (e.g. 500, "600px", "calc(100vh - 280px)"). Default: 500px.
   */
  height?: number | string

  /**
   * Optional CSS class for the scroll container.
   */
  containerClassName?: string

  // Server-side / controlled pagination & sorting options
  pageCount?: number
  rowCount?: number
  pagination?: PaginationState
  onPaginationChange?: OnChangeFn<PaginationState>
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  showPagination?: boolean

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

  /**
   * Infinite scroll callback invoked when user scrolls near the bottom of the virtual list.
   */
  onScrollToBottom?: () => void

  /**
   * Status indicating more pages are currently being fetched in infinite scroll mode.
   */
  isFetchingNextPage?: boolean

  /**
   * Distance in items from the bottom of the list to trigger onScrollToBottom. Default: 5.
   */
  scrollThreshold?: number

  /**
   * Optional custom card renderer for responsive mobile layout (< md screen).
   * If provided, cards will be rendered instead of the table on mobile viewports.
   */
  renderMobileCard?: (item: TData, index: number) => React.ReactNode
}

/**
 * VirtualizedDataTable provides high-performance rendering for large datasets
 * by only mounting table rows within and immediately around the scroll viewport.
 */
export function VirtualizedDataTable<TData extends RowData>({
  columns,
  data,
  estimateRowHeight = 48,
  overscan = 10,
  height = 500,
  containerClassName,
  pageCount,
  rowCount,
  pagination: controlledPagination,
  onPaginationChange,
  sorting: controlledSorting,
  onSortingChange,
  showPagination = false,
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
  onScrollToBottom,
  isFetchingNextPage = false,
  scrollThreshold = 5,
  renderMobileCard,
}: VirtualizedDataTableProps<TData>) {
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

  // Gunakan getSortedRowModel().rows agar virtualizer merender seluruh data yang sudah terurut sesuai sorting state
  const rows = table.getSortedRowModel().rows

  // Ref container untuk scrolling viewport virtualization
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Virtual returns methods managed outside React Compiler memoization
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => estimateRowHeight,
    overscan,
  })

  const virtualRows = rowVirtualizer.getVirtualItems()
  const totalVirtualSize = rowVirtualizer.getTotalSize()

  // Infinite scroll trigger: when the last visible virtual item is within scrollThreshold items from the end
  React.useEffect(() => {
    if (!onScrollToBottom || isFetchingNextPage || rows.length === 0) return

    const lastItem = virtualRows[virtualRows.length - 1]
    if (!lastItem) return

    if (lastItem.index >= rows.length - 1 - scrollThreshold) {
      onScrollToBottom()
    }
  }, [virtualRows, rows.length, onScrollToBottom, isFetchingNextPage, scrollThreshold])

  const paddingTop = virtualRows.length > 0 ? (virtualRows[0]?.start ?? 0) : 0
  const paddingBottom =
    virtualRows.length > 0 ? totalVirtualSize - (virtualRows[virtualRows.length - 1]?.end ?? 0) : 0

  const showTransitionFeedback = isPlaceholderData || (isFetching && !isLoading)
  const containerHeightStyle = typeof height === "number" ? `${height}px` : height

  // Mobile container ref and scroll handler for infinite scrolling
  const mobileContainerRef = React.useRef<HTMLDivElement>(null)
  const mobileSentinelRef = React.useRef<HTMLDivElement>(null)

  const handleMobileScroll = React.useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (!onScrollToBottom || isFetchingNextPage || rows.length === 0) return
      const target = e.currentTarget
      const distanceToBottom = target.scrollHeight - target.scrollTop - target.clientHeight
      // Trigger fetch when user is within 250px of the bottom
      if (distanceToBottom <= 250) {
        onScrollToBottom()
      }
    },
    [onScrollToBottom, isFetchingNextPage, rows.length],
  )

  // IntersectionObserver as fallback/supplement for mobile scroll trigger
  React.useEffect(() => {
    if (!onScrollToBottom || !mobileSentinelRef.current || isFetchingNextPage) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onScrollToBottom()
        }
      },
      {
        root: mobileContainerRef.current,
        rootMargin: "150px",
        threshold: 0.1,
      },
    )

    observer.observe(mobileSentinelRef.current)
    return () => observer.disconnect()
  }, [onScrollToBottom, isFetchingNextPage, rows.length])

  return (
    <div className="flex flex-col gap-3">
      <div className="relative overflow-hidden rounded-lg border border-border bg-card shadow-xs">
        {showTransitionFeedback && (
          <div
            data-testid="data-table-translucent-indicator"
            className="absolute inset-x-0 top-0 z-20 h-0.5 animate-pulse bg-primary/70"
          />
        )}

        {/* Mobile Card List View (rendered on < md when renderMobileCard is provided) */}
        {renderMobileCard && (
          <div
            ref={mobileContainerRef}
            onScroll={handleMobileScroll}
            data-slot="virtual-mobile-container"
            style={{ height: containerHeightStyle }}
            className={`block overflow-auto p-3 transition-opacity duration-200 md:hidden ${
              isPlaceholderData ? "pointer-events-none opacity-60" : "opacity-100"
            }`}
          >
            {isError ? (
              <div className="p-2">
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
              <div className="flex flex-col gap-3">
                {Array.from({ length: skeletonRowCount ?? 6 }).map((_, idx) => (
                  <div
                    key={`virtual-mobile-skeleton-${idx}`}
                    className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="h-5 w-32 animate-pulse rounded bg-muted" />
                      <div className="h-5 w-16 animate-pulse rounded bg-muted" />
                    </div>
                    <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                  </div>
                ))}
              </div>
            ) : rows.length === 0 ? (
              <div className="p-2">
                <DataTableEmptyState
                  colSpan={1}
                  icon={emptyIcon}
                  title={emptyTitle ?? (emptyMessage ? emptyMessage : undefined)}
                  description={emptyDescription}
                  action={emptyAction}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {rows.map((row, index) => (
                  <React.Fragment key={row.id}>
                    {renderMobileCard(row.original, index)}
                  </React.Fragment>
                ))}

                {/* Sentinel div to trigger loading before user hits absolute bottom */}
                <div ref={mobileSentinelRef} className="h-1 w-full" aria-hidden="true" />

                {isFetchingNextPage && (
                  <div
                    data-testid="data-table-loading-more-mobile"
                    className="py-3 text-center text-xs text-muted-foreground"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span className="size-2 animate-ping rounded-full bg-primary" />
                      <span>Memuat data selanjutnya...</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Desktop Virtualized Table (hidden on mobile if renderMobileCard is supplied) */}
        <div
          ref={scrollContainerRef}
          data-slot="virtual-scroll-container"
          style={{ height: containerHeightStyle }}
          className={`relative overflow-auto transition-opacity duration-200 ${
            renderMobileCard ? "hidden md:block" : "block"
          } ${containerClassName ?? ""} ${
            isPlaceholderData ? "pointer-events-none opacity-60" : "opacity-100"
          }`}
        >
          <table data-slot="table" className="w-full caption-bottom text-sm text-foreground">
            <TableHeader className="sticky top-0 z-10 bg-card shadow-xs">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="bg-card">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
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
                <DataTableSkeleton columnCount={columns.length} rowCount={skeletonRowCount ?? 10} />
              ) : rows.length === 0 ? (
                <DataTableEmptyState
                  colSpan={columns.length}
                  icon={emptyIcon}
                  title={emptyTitle ?? (emptyMessage ? emptyMessage : undefined)}
                  description={emptyDescription}
                  action={emptyAction}
                />
              ) : (
                <>
                  {paddingTop > 0 && (
                    <TableRow className="border-0 hover:bg-transparent">
                      <TableCell
                        colSpan={columns.length}
                        style={{ height: `${paddingTop}px`, padding: 0 }}
                        className="border-0"
                      />
                    </TableRow>
                  )}
                  {virtualRows.map((virtualRow) => {
                    const row = rows[virtualRow.index]
                    if (!row) return null

                    return (
                      <TableRow
                        key={row.id}
                        data-index={virtualRow.index}
                        data-state={row.getIsSelected?.() && "selected"}
                        ref={rowVirtualizer.measureElement}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    )
                  })}
                  {paddingBottom > 0 && (
                    <TableRow className="border-0 hover:bg-transparent">
                      <TableCell
                        colSpan={columns.length}
                        style={{ height: `${paddingBottom}px`, padding: 0 }}
                        className="border-0"
                      />
                    </TableRow>
                  )}
                  {isFetchingNextPage && (
                    <TableRow
                      data-testid="data-table-loading-more"
                      className="border-0 hover:bg-transparent"
                    >
                      <TableCell
                        colSpan={columns.length}
                        className="py-3 text-center text-xs text-muted-foreground"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <span className="size-2 animate-ping rounded-full bg-primary" />
                          <span>Memuat data selanjutnya...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              )}
            </TableBody>
          </table>
        </div>
      </div>

      {showPagination && (
        <DataTablePagination
          table={table}
          pageSizeOptions={pageSizeOptions}
          isDisabled={isPlaceholderData}
        />
      )}
    </div>
  )
}
