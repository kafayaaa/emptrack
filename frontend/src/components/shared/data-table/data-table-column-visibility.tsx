"use client"

import * as React from "react"
import { SlidersHorizontal, type LucideIcon } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

/**
 * Format column id into a human-readable title.
 * e.g. "employeeNumber" -> "Employee Number", "hire_date" -> "Hire Date".
 */
export function defaultFormatColumnId(id: string): string {
  return id
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim()
}

export interface ColumnVisibilityItem {
  id: string
  getCanHide: () => boolean
  getIsVisible: () => boolean
  toggleVisibility: (value?: boolean) => void
}

export interface TableWithColumnVisibility {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getAllLeafColumns: () => any[]
  toggleAllColumnsVisible?: (value?: boolean) => void
  resetColumnVisibility?: () => void
}

export interface DataTableColumnVisibilityProps {
  /**
   * TanStack Table instance with columnVisibilityFeature enabled.
   */
  table: TableWithColumnVisibility
  /**
   * Title shown at the top of the dropdown menu. Default: "Toggle columns".
   */
  title?: string
  /**
   * Button trigger label. Default: "Columns".
   */
  triggerLabel?: string
  /**
   * Optional custom icon for trigger button. Default: SlidersHorizontal.
   */
  triggerIcon?: LucideIcon
  /**
   * Alignment for the dropdown content popup. Default: "end".
   */
  align?: "start" | "center" | "end"
  /**
   * Optional function to customize column display titles.
   */
  getColumnLabel?: (columnId: string) => string
  /**
   * Whether to show "Show all" and "Reset" action buttons in dropdown footer. Default: true.
   */
  showActions?: boolean
  /**
   * Class name for the trigger button.
   */
  className?: string
  /**
   * Class name for the dropdown content popup.
   */
  contentClassName?: string
}

/**
 * Dropdown menu component allowing users to toggle column visibility on a TanStack Table.
 */
export function DataTableColumnVisibility({
  table,
  title = "Toggle columns",
  triggerLabel = "Columns",
  triggerIcon: TriggerIcon = SlidersHorizontal,
  align = "end",
  getColumnLabel,
  showActions = true,
  className,
  contentClassName,
}: DataTableColumnVisibilityProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns = React.useMemo<any[]>(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return table.getAllLeafColumns().filter((column: any) => column.getCanHide())
  }, [table])

  const hiddenCount = React.useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return columns.filter((col: any) => !col.getIsVisible()).length
  }, [columns])

  if (columns.length === 0) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className={cn("h-8 gap-1.5 text-xs font-medium", className)}
            aria-label={`${triggerLabel} - Sesuaikan visibilitas kolom tabel`}
            aria-haspopup="menu"
            data-testid="data-table-column-visibility-trigger"
          >
            <TriggerIcon className="size-3.5 text-muted-foreground" />
            <span>{triggerLabel}</span>
            {hiddenCount > 0 && (
              <span
                data-testid="data-table-hidden-column-badge"
                className="flex size-4 items-center justify-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary"
              >
                {hiddenCount}
              </span>
            )}
          </Button>
        }
      />
      <DropdownMenuContent
        align={align}
        className={cn("w-48 sm:w-56", contentClassName)}
        data-testid="data-table-column-visibility-content"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>{title}</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <div className="flex max-h-64 flex-col gap-0.5 overflow-y-auto">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {columns.map((column: any) => {
              const isVisible = column.getIsVisible()
              const label = getColumnLabel
                ? getColumnLabel(column.id)
                : defaultFormatColumnId(column.id)

              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={isVisible}
                  onCheckedChange={(checked) => column.toggleVisibility(checked)}
                  data-testid={`column-visibility-item-${column.id}`}
                >
                  <span className="truncate">{label}</span>
                </DropdownMenuCheckboxItem>
              )
            })}
          </div>
        </DropdownMenuGroup>

        {showActions && (
          <>
            <DropdownMenuSeparator />
            <div className="flex items-center justify-between px-1 py-1">
              <Button
                variant="ghost"
                size="xs"
                className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                onClick={() => table.toggleAllColumnsVisible?.(true)}
                data-testid="column-visibility-show-all"
              >
                Show all
              </Button>
              <Button
                variant="ghost"
                size="xs"
                className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                onClick={() => table.resetColumnVisibility?.()}
                data-testid="column-visibility-reset"
              >
                Reset
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
