"use client"

import * as React from "react"
import { useQueryState, parseAsStringLiteral, parseAsString, parseAsInteger } from "nuqs"
import {
  EmployeeTable,
  EmployeeInfiniteTable,
  EmployeeTableSkeleton,
  EmployeeViewToggle,
  EmployeeSearchInput,
  EmployeeFilters,
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
    <div className="flex flex-col gap-4">
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
          />
        ) : (
          <EmployeeTable
            filters={tableFilters}
            columnVisibility={columnVisibility}
            onColumnVisibilityChange={onColumnVisibilityChange}
          />
        )}
      </React.Suspense>
    </div>
  )
}
