"use client"

import * as React from "react"
import { RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTableSelectFilter } from "@/components/shared/data-table"
import { ASSET_CATEGORIES, ASSET_STATUS_OPTIONS, ASSET_ASSIGNED_OPTIONS } from "../constants"

export interface AssetFiltersState {
  category?: string
  status?: string
  assignedTo?: string
}

export interface AssetFiltersProps {
  /**
   * Nilai state filter saat ini.
   */
  filters: AssetFiltersState
  /**
   * Callback ketika ada perubahan pada filter manapun.
   */
  onFiltersChange: (filters: AssetFiltersState) => void
  /**
   * Optional callback untuk mereset semua filter ke default.
   */
  onResetFilters?: () => void
  /**
   * Class name tambahan untuk wrapper container.
   */
  className?: string
}

/**
 * Filter dropdown bar khusus domain Asset (EMPTRACK-89)
 * Menyediakan filter Kategori, Status aset, dan Status Penugasan (Assigned-To).
 */
export function AssetFilters({
  filters,
  onFiltersChange,
  onResetFilters,
  className,
}: AssetFiltersProps) {
  const { category, status, assignedTo } = filters

  const handleCategoryChange = React.useCallback(
    (nextCategory: string) => {
      onFiltersChange({
        ...filters,
        category: nextCategory || undefined,
      })
    },
    [filters, onFiltersChange],
  )

  const handleStatusChange = React.useCallback(
    (nextStatus: string) => {
      onFiltersChange({
        ...filters,
        status: nextStatus || undefined,
      })
    },
    [filters, onFiltersChange],
  )

  const handleAssignedToChange = React.useCallback(
    (nextAssignedTo: string) => {
      onFiltersChange({
        ...filters,
        assignedTo: nextAssignedTo || undefined,
      })
    },
    [filters, onFiltersChange],
  )

  const hasActiveFilters = Boolean(category || status || assignedTo)

  const handleReset = React.useCallback(() => {
    if (onResetFilters) {
      onResetFilters()
    } else {
      onFiltersChange({
        category: undefined,
        status: undefined,
        assignedTo: undefined,
      })
    }
  }, [onResetFilters, onFiltersChange])

  return (
    <div
      data-testid="asset-filters-bar"
      className={`flex flex-wrap items-center gap-2 ${className ?? ""}`.trim()}
    >
      <DataTableSelectFilter
        title="Kategori"
        options={ASSET_CATEGORIES}
        value={category}
        onValueChange={handleCategoryChange}
        ariaLabel="Filter kategori aset"
      />

      <DataTableSelectFilter
        title="Status"
        options={ASSET_STATUS_OPTIONS}
        value={status}
        onValueChange={handleStatusChange}
        ariaLabel="Filter status aset"
      />

      <DataTableSelectFilter
        title="Penugasan"
        options={ASSET_ASSIGNED_OPTIONS}
        value={assignedTo}
        onValueChange={handleAssignedToChange}
        ariaLabel="Filter penugasan aset"
      />

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="h-8 gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-foreground"
          aria-label="Reset semua filter aset"
        >
          <RotateCcw className="size-3.5" />
          <span>Reset Filter</span>
        </Button>
      )}
    </div>
  )
}
