"use client"

import * as React from "react"
import { parseAsInteger, parseAsString, useQueryState } from "nuqs"
import { DataTableSearchInput } from "@/components/shared/data-table"

export interface EmployeeSearchInputProps {
  /**
   * Controlled search query. If omitted, syncs with URL parameter `search`.
   */
  search?: string
  /**
   * Callback fired with debounced search query.
   */
  onSearchChange?: (value: string) => void
  /**
   * Placeholder text for search input.
   */
  placeholder?: string
  /**
   * Debounce delay in milliseconds. Defaults to 300ms.
   */
  debounceMs?: number
  /**
   * Additional input styling.
   */
  className?: string
  /**
   * Container styling.
   */
  containerClassName?: string
}

/**
 * Domain-specific Search Input for Employees that synchronizes the `search`
 * parameter to the URL via `nuqs`, automatically debouncing input keystrokes
 * and resetting pagination (`page=1`) on new queries.
 */
export function EmployeeSearchInput({
  search: controlledSearch,
  onSearchChange,
  placeholder = "Cari nama karyawan...",
  debounceMs = 300,
  className,
  containerClassName,
}: EmployeeSearchInputProps) {
  const [urlSearch, setUrlSearch] = useQueryState(
    "search",
    parseAsString.withDefault("").withOptions({
      shallow: true,
      clearOnDefault: true,
      history: "replace",
    }),
  )

  const [, setUrlPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({
      shallow: true,
      clearOnDefault: true,
      history: "push",
    }),
  )

  const currentSearch = controlledSearch ?? urlSearch

  const handleDebouncedChange = React.useCallback(
    (value: string) => {
      const sanitized = value.trim()
      if (onSearchChange) {
        onSearchChange(sanitized)
      } else {
        void setUrlSearch(sanitized)
        // Reset page to 1 on query changes to avoid out-of-range pagination
        void setUrlPage(1)
      }
    },
    [onSearchChange, setUrlSearch, setUrlPage],
  )

  return (
    <DataTableSearchInput
      value={currentSearch}
      onDebouncedChange={handleDebouncedChange}
      placeholder={placeholder}
      debounceMs={debounceMs}
      ariaLabel="Cari nama karyawan"
      className={className}
      containerClassName={containerClassName}
    />
  )
}
