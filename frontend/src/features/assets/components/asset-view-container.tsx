"use client"

import * as React from "react"
import { useQueryState, parseAsString, parseAsInteger } from "nuqs"
import { User, X } from "lucide-react"
import type { RowSelectionState } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { useDataTableVisibility } from "@/hooks"
import { AssetTable } from "./asset-table"
import { AssetSearchInput } from "./asset-search-input"
import { AssetFilters, type AssetFiltersState } from "./asset-filters"
import { AssetBulkDeleteDialog } from "./asset-bulk-delete-dialog"
import type { AssetCategory, AssetStatus } from "../types"

export interface AssetViewContainerProps {
  initialRowSelection?: RowSelectionState
}

export function AssetViewContainer({ initialRowSelection = {} }: AssetViewContainerProps = {}) {
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

  const [assignedToId, setAssignedToId] = useQueryState(
    "assignedToId",
    parseAsString.withDefault("").withOptions({
      shallow: true,
      clearOnDefault: true,
    }),
  )

  const { columnVisibility, onColumnVisibilityChange } = useDataTableVisibility({
    storageKey: "emptrack:assets:column-visibility",
  })

  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>(initialRowSelection)

  const selectedAssetIds = React.useMemo(
    () => Object.keys(rowSelection).filter((id) => rowSelection[id]),
    [rowSelection],
  )
  const selectedCount = selectedAssetIds.length

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
    void setAssignedToId("")
    if (page !== 1) {
      void setPage(1)
    }
  }, [page, setCategory, setStatus, setAssignedTo, setAssignedToId, setPage])

  const tableFilters = React.useMemo(() => {
    const filters: {
      search?: string
      category?: AssetCategory
      status?: AssetStatus
      assignedToId?: string
    } = {}

    if (search) filters.search = search
    if (category) filters.category = category as AssetCategory
    if (assignedToId) filters.assignedToId = assignedToId

    if (status) {
      filters.status = status as AssetStatus
    } else if (assignedTo === "assigned") {
      filters.status = "assigned"
    } else if (assignedTo === "unassigned") {
      filters.status = "available"
    }

    return Object.keys(filters).length > 0 ? filters : undefined
  }, [search, category, status, assignedTo, assignedToId])

  return (
    <div data-testid="asset-view-container" className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <AssetSearchInput containerClassName="w-full sm:max-w-xs" />
      </div>

      {assignedToId && (
        <div
          data-testid="assigned-to-filter-banner"
          className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5 text-xs text-foreground"
        >
          <div className="flex items-center gap-2">
            <User className="size-4 text-primary" />
            <span>
              Menampilkan aset yang ditugaskan ke Employee ID:{" "}
              <span className="font-mono font-semibold">{assignedToId}</span>
            </span>
          </div>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => void setAssignedToId("")}
            className="h-6 gap-1 px-2 text-muted-foreground hover:text-foreground"
            data-testid="clear-assigned-to-filter-button"
          >
            <X className="size-3.5" />
            <span>Hapus Filter</span>
          </Button>
        </div>
      )}

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

      {/* Floating Bulk Actions Bar (EMPTRACK-93) */}
      {selectedCount > 0 && (
        <div
          data-slot="bulk-actions-bar"
          data-testid="asset-bulk-actions-bar"
          className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 animate-in items-center gap-3 rounded-full border border-border/80 bg-background/95 px-4 py-2 shadow-2xl backdrop-blur-md transition-all duration-200 fade-in slide-in-from-bottom-4"
        >
          <div className="flex items-center gap-2">
            <span className="flex size-2 animate-pulse rounded-full bg-primary" />
            <span className="text-xs font-semibold text-foreground sm:text-sm">
              {selectedCount} aset dipilih
            </span>
          </div>
          <div className="h-4 w-px bg-border" />
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setRowSelection({})}
            data-testid="cancel-asset-selection-button"
          >
            Batal
          </Button>
          <AssetBulkDeleteDialog
            assetIds={selectedAssetIds}
            onSuccess={() => setRowSelection({})}
          />
        </div>
      )}
    </div>
  )
}
