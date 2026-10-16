"use client"

import * as React from "react"
import { useQueryState, parseAsStringLiteral } from "nuqs"
import { ListFilter, Rows3 } from "lucide-react"
import { Button } from "@/components/ui/button"

export const VIEW_MODES = ["paginated", "infinite"] as const
export type ViewMode = (typeof VIEW_MODES)[number]

export interface EmployeeViewToggleProps {
  viewMode?: ViewMode
  onViewModeChange?: (mode: ViewMode) => void
}

/**
 * Toggle between standard pagination mode and continuous infinite scroll mode.
 * Integrates with nuqs to sync with the `view` URL parameter.
 */
export function EmployeeViewToggle({
  viewMode: controlledMode,
  onViewModeChange,
}: EmployeeViewToggleProps) {
  const [urlMode, setUrlMode] = useQueryState(
    "view",
    parseAsStringLiteral(VIEW_MODES).withDefault("paginated").withOptions({
      shallow: true,
      clearOnDefault: true,
      history: "push",
    }),
  )

  const mode = controlledMode ?? urlMode

  const handleSelect = React.useCallback(
    (nextMode: ViewMode) => {
      if (onViewModeChange) {
        onViewModeChange(nextMode)
      } else {
        void setUrlMode(nextMode)
      }
    },
    [onViewModeChange, setUrlMode],
  )

  return (
    <div
      role="group"
      aria-label="Mode Tampilan Tabel"
      className="inline-flex items-center rounded-lg border border-border bg-muted/50 p-1 text-muted-foreground shadow-xs"
    >
      <Button
        type="button"
        size="xs"
        variant={mode === "paginated" ? "default" : "ghost"}
        onClick={() => handleSelect("paginated")}
        className={`gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
          mode === "paginated" ? "shadow-xs" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <ListFilter className="size-3.5" />
        <span>Pagination</span>
      </Button>

      <Button
        type="button"
        size="xs"
        variant={mode === "infinite" ? "default" : "ghost"}
        onClick={() => handleSelect("infinite")}
        className={`gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
          mode === "infinite" ? "shadow-xs" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Rows3 className="size-3.5" />
        <span>Infinite Scroll</span>
      </Button>
    </div>
  )
}
