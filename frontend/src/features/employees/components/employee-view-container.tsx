"use client"

import * as React from "react"
import { useQueryState, parseAsStringLiteral } from "nuqs"
import {
  EmployeeTable,
  EmployeeInfiniteTable,
  EmployeeTableSkeleton,
  EmployeeViewToggle,
  VIEW_MODES,
  type ViewMode,
} from "@/features/employees"

/**
 * Client view container for Employee List that manages switching between
 * Standard Pagination and Infinite Scroll mode with URL synchronization.
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

  const isInfinite = viewMode === "infinite"

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <EmployeeViewToggle
          viewMode={viewMode as ViewMode}
          onViewModeChange={(mode) => void setViewMode(mode)}
        />
      </div>

      <React.Suspense fallback={<EmployeeTableSkeleton rowCount={10} />}>
        {isInfinite ? <EmployeeInfiniteTable height={580} /> : <EmployeeTable />}
      </React.Suspense>
    </div>
  )
}
