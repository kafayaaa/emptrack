"use client"

import * as React from "react"
import { useQueryState, parseAsStringLiteral, parseAsString, parseAsInteger } from "nuqs"
import type { RowSelectionState } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import {
  EmployeeTable,
  EmployeeInfiniteTable,
  EmployeeTableSkeleton,
  EmployeeViewToggle,
  EmployeeSearchInput,
  EmployeeFilters,
  EmployeeBulkDeleteDialog,
  VIEW_MODES,
  type ViewMode,
  type EmployeeFiltersState,
} from "@/features/employees"
import { useDataTableVisibility } from "@/hooks"

/**
 * Client view container for Employee List that manages switching between
 * Standard Pagination and Infinite Scroll mode with URL synchronization
 * and debounced search & dropdown filtering.
 */
export function EmployeeViewContainer() {
  const [viewMode, setViewMode] = useQueryState(
    "view",
    parseAsStringLiteral(VIEW_MODES).withDefault("paginated").withOptions({
      shallow: true,
      clearOnDefault: true,
      history: "push",
    }),
  )

  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({
      shallow: true,
      clearOnDefault: true,
      history: "push",
    }),
  )

  const [search] = useQueryState(
    "search",
    parseAsString.withDefault("").withOptions({
      shallow: true,
      clearOnDefault: true,
    }),
  )

  const [department, setDepartment] = useQueryState(
    "department",
    parseAsString.withDefault("").withOptions({
      shallow: true,
      clearOnDefault: true,
    }),
  )

  const [position, setPosition] = useQueryState(
    "position",
    parseAsString.withDefault("").withOptions({
      shallow: true,
      clearOnDefault: true,
    }),
  )

  const [status, setStatus] = useQueryState(
    "status",
    parseAsString.withDefault("").withOptions({
      shallow: true,
      clearOnDefault: true,
    }),
  )

  const isInfinite = viewMode === "infinite"

  const { columnVisibility, onColumnVisibilityChange } = useDataTableVisibility({
    storageKey: "emptrack:employees:column-visibility",
  })

  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})

  const selectedEmployeeIds = React.useMemo(
    () => Object.keys(rowSelection).filter((id) => rowSelection[id]),
    [rowSelection],
  )
  const selectedCount = selectedEmployeeIds.length

  const filterState: EmployeeFiltersState = React.useMemo(
    () => ({
      department: department || undefined,
      position: position || undefined,
      status: status || undefined,
    }),
    [department, position, status],
  )

  const handleFiltersChange = React.useCallback(
    (nextFilters: EmployeeFiltersState) => {
      void setDepartment(nextFilters.department || "")
      void setPosition(nextFilters.position || "")
      void setStatus(nextFilters.status || "")
      if (page !== 1) {
        void setPage(1)
      }
    },
    [page, setDepartment, setPosition, setStatus, setPage],
  )

  const tableFilters = React.useMemo(() => {
    const filters: Record<string, string> = {}
    if (search) filters.search = search
    if (department) filters.department = department
    if (position) filters.position = position
    if (status) filters.status = status
    return Object.keys(filters).length > 0 ? filters : undefined
  }, [search, department, position, status])

  return (
    <div className="relative flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <EmployeeSearchInput containerClassName="w-full sm:max-w-xs" />
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <EmployeeViewToggle
            viewMode={viewMode as ViewMode}
            onViewModeChange={(mode) => void setViewMode(mode)}
          />
        </div>
      </div>

      <EmployeeFilters filters={filterState} onFiltersChange={handleFiltersChange} />

      <React.Suspense fallback={<EmployeeTableSkeleton rowCount={10} />}>
        {isInfinite ? (
          <EmployeeInfiniteTable
            filters={tableFilters}
            height={580}
            columnVisibility={columnVisibility}
            onColumnVisibilityChange={onColumnVisibilityChange}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
          />
        ) : (
          <EmployeeTable
            filters={tableFilters}
            columnVisibility={columnVisibility}
            onColumnVisibilityChange={onColumnVisibilityChange}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
          />
        )}
      </React.Suspense>

      {/* Floating Bulk Actions Bar (EMPTRACK-78) */}
      {selectedCount > 0 && (
        <div
          data-slot="bulk-actions-bar"
          className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 animate-in items-center gap-3 rounded-full border border-border/80 bg-background/95 px-4 py-2 shadow-2xl backdrop-blur-md transition-all duration-200 fade-in slide-in-from-bottom-4"
        >
          <div className="flex items-center gap-2">
            <span className="flex size-2 animate-pulse rounded-full bg-primary" />
            <span className="text-xs font-semibold text-foreground sm:text-sm">
              {selectedCount} karyawan dipilih
            </span>
          </div>
          <div className="h-4 w-px bg-border" />
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setRowSelection({})}
          >
            Batal
          </Button>
          <EmployeeBulkDeleteDialog
            employeeIds={selectedEmployeeIds}
            onSuccess={() => setRowSelection({})}
          />
        </div>
      )}
    </div>
  )
}
