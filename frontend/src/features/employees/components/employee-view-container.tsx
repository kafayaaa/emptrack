"use client"

import * as React from "react"
import { useQueryState, parseAsStringLiteral, parseAsString } from "nuqs"
import {
  EmployeeTable,
  EmployeeInfiniteTable,
  EmployeeTableSkeleton,
  EmployeeViewToggle,
  EmployeeSearchInput,
  VIEW_MODES,
  type ViewMode,
} from "@/features/employees"

/**
 * Client view container for Employee List that manages switching between
 * Standard Pagination and Infinite Scroll mode with URL synchronization
 * and debounced search filtering.
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

  const [search] = useQueryState(
    "search",
    parseAsString.withDefault("").withOptions({
      shallow: true,
      clearOnDefault: true,
    }),
  )

  const isInfinite = viewMode === "infinite"

  const tableFilters = React.useMemo(() => (search ? { search } : undefined), [search])

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

      <React.Suspense fallback={<EmployeeTableSkeleton rowCount={10} />}>
        {isInfinite ? (
          <EmployeeInfiniteTable filters={tableFilters} height={580} />
        ) : (
          <EmployeeTable filters={tableFilters} />
        )}
      </React.Suspense>
    </div>
  )
}
