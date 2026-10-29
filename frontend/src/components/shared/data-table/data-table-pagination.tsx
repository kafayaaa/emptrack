import * as React from "react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface TablePaginatable {
  state: {
    pagination: {
      pageIndex: number
      pageSize: number
    }
    rowSelection?: Record<string, boolean>
  }
  getPageCount: () => number
  getRowCount: () => number
  getFilteredSelectedRowModel?: () => { rows: unknown[] }
  getSelectedRowModel?: () => { rows: unknown[] }
  setPageSize: (size: number) => void
  setPageIndex: (index: number) => void
  previousPage: () => void
  nextPage: () => void
  firstPage?: () => void
  lastPage?: () => void
  getCanPreviousPage: () => boolean
  getCanNextPage: () => boolean
  getCanLastPage?: () => boolean
}

interface DataTablePaginationProps {
  table: TablePaginatable
  pageSizeOptions?: number[]
  isDisabled?: boolean
}

function BaseDataTablePagination({
  table,
  pageSizeOptions = [10, 20, 30, 50, 100],
  isDisabled = false,
}: DataTablePaginationProps) {
  const pageIndex = table.state.pagination.pageIndex
  const pageSize = table.state.pagination.pageSize
  const pageCount = table.getPageCount()
  const totalRows = table.getRowCount()

  const handleFirstPage = React.useCallback(() => {
    if (typeof table.firstPage === "function") {
      table.firstPage()
    } else {
      table.setPageIndex(0)
    }
  }, [table])

  const handleLastPage = React.useCallback(() => {
    if (typeof table.lastPage === "function") {
      table.lastPage()
    } else {
      table.setPageIndex(pageCount - 1)
    }
  }, [pageCount, table])

  const handlePreviousPage = React.useCallback(() => {
    table.previousPage()
  }, [table])

  const handleNextPage = React.useCallback(() => {
    table.nextPage()
  }, [table])

  const handlePageSizeChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      table.setPageSize(Number(e.target.value))
    },
    [table],
  )

  const canLastPage =
    typeof table.getCanLastPage === "function" ? table.getCanLastPage() : table.getCanNextPage()

  const selectedRowsCount =
    typeof table.getFilteredSelectedRowModel === "function"
      ? table.getFilteredSelectedRowModel().rows.length
      : typeof table.getSelectedRowModel === "function"
        ? table.getSelectedRowModel().rows.length
        : Object.keys(table.state.rowSelection ?? {}).length

  return (
    <div className="flex flex-col items-center justify-between gap-4 px-2 py-3 sm:flex-row">
      <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        {selectedRowsCount > 0 && (
          <span data-testid="data-table-selected-count" className="font-medium text-foreground">
            {selectedRowsCount} of {totalRows} row(s) selected •
          </span>
        )}
        <span>
          Showing{" "}
          <span className="font-medium text-foreground">
            {totalRows === 0 ? 0 : pageIndex * pageSize + 1}
          </span>{" "}
          to{" "}
          <span className="font-medium text-foreground">
            {Math.min((pageIndex + 1) * pageSize, totalRows)}
          </span>{" "}
          of <span className="font-medium text-foreground">{totalRows}</span> entries
        </span>
      </div>

      <nav
        aria-label="Navigasi halaman tabel"
        className="flex w-full flex-wrap items-center justify-between gap-3 sm:w-auto sm:justify-end sm:gap-6"
      >
        <div className="flex items-center gap-2">
          <label
            htmlFor="rows-per-page-select"
            className="text-xs font-medium whitespace-nowrap text-muted-foreground"
          >
            Rows per page
          </label>
          <select
            id="rows-per-page-select"
            className="h-8 rounded-md border border-input bg-background px-2 py-1 text-xs font-medium text-foreground shadow-xs transition-colors outline-none hover:bg-muted focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50"
            value={pageSize}
            disabled={isDisabled}
            onChange={handlePageSizeChange}
            aria-label="Select number of rows per page"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center text-xs font-medium whitespace-nowrap text-muted-foreground">
          Page {pageIndex + 1} of {Math.max(pageCount, 1)}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={handleFirstPage}
            disabled={isDisabled || !table.getCanPreviousPage()}
            aria-label="Go to first page"
          >
            <ChevronsLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={handlePreviousPage}
            disabled={isDisabled || !table.getCanPreviousPage()}
            aria-label="Go to previous page"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={handleNextPage}
            disabled={isDisabled || !table.getCanNextPage()}
            aria-label="Go to next page"
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={handleLastPage}
            disabled={isDisabled || !canLastPage}
            aria-label="Go to last page"
          >
            <ChevronsRight className="size-4" />
          </Button>
        </div>
      </nav>
    </div>
  )
}

export const DataTablePagination = React.memo(BaseDataTablePagination)
