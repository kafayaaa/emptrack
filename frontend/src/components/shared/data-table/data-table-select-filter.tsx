import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export interface DataTableSelectFilterOption {
  value: string
  label: string
}

export interface DataTableSelectFilterProps {
  /**
   * Title or label of the filter.
   */
  title: string
  /**
   * Available select options.
   */
  options: readonly (DataTableSelectFilterOption | string)[]
  /**
   * Current selected value. Empty string or undefined means all / unselected.
   */
  value?: string
  /**
   * Callback fired when value changes.
   */
  onValueChange: (value: string) => void
  /**
   * Label for clearing filter / selecting all. Defaults to "Semua {title}".
   */
  allLabel?: string
  /**
   * Additional trigger styling class names.
   */
  className?: string
  /**
   * Size variant for the trigger.
   */
  size?: "sm" | "default"
  /**
   * Accessible label.
   */
  ariaLabel?: string
}

const ALL_VALUE = "__ALL__"

/**
 * Reusable faceted single-select filter dropdown for DataTables.
 */
export function DataTableSelectFilter({
  title,
  options,
  value,
  onValueChange,
  allLabel,
  className,
  size = "sm",
  ariaLabel,
}: DataTableSelectFilterProps) {
  const normalizedOptions: DataTableSelectFilterOption[] = React.useMemo(() => {
    return options.map((opt) => (typeof opt === "string" ? { value: opt, label: opt } : opt))
  }, [options])

  const selectValue = value ?? ""
  const defaultAllLabel = allLabel ?? `Semua ${title}`

  const currentLabel = React.useMemo(() => {
    if (!selectValue || selectValue === ALL_VALUE) return defaultAllLabel
    const matched = normalizedOptions.find((o) => o.value === selectValue)
    return matched ? matched.label : selectValue
  }, [selectValue, defaultAllLabel, normalizedOptions])

  const effectiveAriaLabel = ariaLabel
    ? `${ariaLabel}, nilai terpilih: ${currentLabel}`
    : `Filter berdasarkan ${title}, nilai terpilih: ${currentLabel}`

  const handleValueChange = React.useCallback(
    (nextVal: string | null) => {
      if (!nextVal || nextVal === ALL_VALUE) {
        onValueChange("")
      } else {
        onValueChange(nextVal)
      }
    },
    [onValueChange],
  )

  return (
    <Select value={selectValue} onValueChange={handleValueChange}>
      <SelectTrigger
        size={size}
        aria-label={effectiveAriaLabel}
        className={cn(
          "h-8 rounded-md border border-input bg-background text-xs font-medium",
          className,
        )}
      >
        <span className="mr-1 text-muted-foreground">{title}:</span>
        <SelectValue placeholder={defaultAllLabel}>
          {(val) => {
            if (!val || val === ALL_VALUE) return defaultAllLabel
            const matched = normalizedOptions.find((o) => o.value === val)
            return matched ? matched.label : val
          }}
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="start" className="min-w-40 text-xs">
        <SelectItem value={ALL_VALUE}>{defaultAllLabel}</SelectItem>
        {normalizedOptions.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
