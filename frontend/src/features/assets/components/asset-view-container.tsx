"use client"

import * as React from "react"
import { useQueryState, parseAsString, parseAsInteger } from "nuqs"
import type { RowSelectionState } from "@tanstack/react-table"
import { useDataTableVisibility } from "@/hooks"
import { AssetTable } from "./asset-table"
import { AssetSearchInput } from "./asset-search-input"
import { AssetFilters, type AssetFiltersState } from "./asset-filters"
import type { AssetCategory, AssetStatus } from "../types"

export function AssetViewContainer() {
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

  const [category, setCategory] = useQueryState(
    "category",
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

  const [assignedTo, setAssignedTo] = useQueryState(
    "assignedTo",
    parseAsString.withDefault("").withOptions({
      shallow: true,
      clearOnDefault: true,
    }),
  )

  const { columnVisibility, onColumnVisibilityChange } = useDataTableVisibility({
    storageKey: "emptrack:assets:column-visibility",
  })

  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})

  const filterState: AssetFiltersState = React.useMemo(
    () => ({
      category: category || undefined,
      status: status || undefined,
      assignedTo: assignedTo || undefined,
    }),
    [category, status, assignedTo],
  )

  const handleFiltersChange = React.useCallback(
    (nextFilters: AssetFiltersState) => {
      void setCategory(nextFilters.category || "")
      void setStatus(nextFilters.status || "")
      void setAssignedTo(nextFilters.assignedTo || "")
      if (page !== 1) {
        void setPage(1)
      }
    },
    [page, setCategory, setStatus, setAssignedTo, setPage],
  )

  const handleResetFilters = React.useCallback(() => {
    void setCategory("")
    void setStatus("")
    void setAssignedTo("")
    if (page !== 1) {
      void setPage(1)
    }
  }, [page, setCategory, setStatus, setAssignedTo, setPage])

  const tableFilters = React.useMemo(() => {
    const filters: {
      search?: string
      category?: AssetCategory
      status?: AssetStatus
      assignedToId?: string
    } = {}

    if (search) filters.search = search
    if (category) filters.category = category as AssetCategory

    if (status) {
      filters.status = status as AssetStatus
    } else if (assignedTo === "assigned") {
      filters.status = "assigned"
    } else if (assignedTo === "unassigned") {
      filters.status = "available"
    }

    return Object.keys(filters).length > 0 ? filters : undefined
  }, [search, category, status, assignedTo])

  return (
    <div data-testid="asset-view-container" className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <AssetSearchInput containerClassName="w-full sm:max-w-xs" />
      </div>

      <AssetFilters
        filters={filterState}
        onFiltersChange={handleFiltersChange}
        onResetFilters={handleResetFilters}
      />

      <AssetTable
        filters={tableFilters}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={onColumnVisibilityChange}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      />
    </div>
  )
}
