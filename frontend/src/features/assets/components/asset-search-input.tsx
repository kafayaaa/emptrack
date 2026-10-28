"use client"

import * as React from "react"
import { parseAsInteger, parseAsString, useQueryState } from "nuqs"
import { DataTableSearchInput } from "@/components/shared/data-table"

export interface AssetSearchInputProps {
  /**
   * Controlled search query. Jika tidak diberikan, otomatis tersinkronisasi ke parameter URL `search`.
   */
  search?: string
  /**
   * Callback yang dipanggil setelah debounce search query berubah.
   */
  onSearchChange?: (value: string) => void
  /**
   * Placeholder untuk input pencarian.
   */
  placeholder?: string
  /**
   * Debounce delay dalam milidetik. Default: 300ms.
   */
  debounceMs?: number
  /**
   * Styling tambahan untuk input.
   */
  className?: string
  /**
   * Styling tambahan untuk container.
   */
  containerClassName?: string
}

/**
 * Domain-specific Search Input untuk data aset (EMPTRACK-89).
 * Mengintegrasikan pencarian debounced ke URL query state `search` dan otomatis
 * mereset nomor halaman (`page=1`) ketika query berubah.
 */
export function AssetSearchInput({
  search: controlledSearch,
  onSearchChange,
  placeholder = "Cari nama aset, tag, atau model...",
  debounceMs = 300,
  className,
  containerClassName,
}: AssetSearchInputProps) {
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
      history: "replace",
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
      ariaLabel="Cari aset"
      className={className}
      containerClassName={containerClassName}
    />
  )
}
