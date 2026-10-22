"use client"

import * as React from "react"
import type { ColumnVisibilityState, OnChangeFn } from "@tanstack/react-table"

export interface UseDataTableVisibilityOptions {
  /**
   * Initial column visibility map, e.g. { hireDate: false }.
   */
  initialVisibility?: ColumnVisibilityState
  /**
   * Optional localStorage key to persist column visibility preferences across sessions.
   */
  storageKey?: string
}

export interface UseDataTableVisibilityReturn {
  /**
   * Column visibility state object for TanStack Table.
   */
  columnVisibility: ColumnVisibilityState
  /**
   * State setter for column visibility.
   */
  setColumnVisibility: React.Dispatch<React.SetStateAction<ColumnVisibilityState>>
  /**
   * TanStack Table compatible onColumnVisibilityChange callback.
   */
  onColumnVisibilityChange: OnChangeFn<ColumnVisibilityState>
  /**
   * Toggle visibility for a single column.
   */
  toggleColumnVisibility: (columnId: string, isVisible?: boolean) => void
  /**
   * Reset visibility back to initial visibility (and resets stored value).
   */
  resetColumnVisibility: () => void
  /**
   * Make all given columns (or all currently recorded columns) visible.
   */
  showAllColumns: (columnIds?: string[]) => void
}

/**
 * Reusable hook for managing TanStack Table column visibility state with optional localStorage persistence.
 */
export function useDataTableVisibility({
  initialVisibility = {},
  storageKey,
}: UseDataTableVisibilityOptions = {}): UseDataTableVisibilityReturn {
  const [columnVisibility, setColumnVisibility] = React.useState<ColumnVisibilityState>(() => {
    if (typeof window !== "undefined" && storageKey) {
      try {
        const item = window.localStorage.getItem(storageKey)
        if (item) {
          return { ...initialVisibility, ...JSON.parse(item) }
        }
      } catch {
        // Fallback to initialVisibility on storage errors
      }
    }
    return initialVisibility
  })

  // Synchronize state changes to localStorage if storageKey is configured
  React.useEffect(() => {
    if (typeof window === "undefined" || !storageKey) return
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(columnVisibility))
    } catch {
      // Ignore write errors (e.g. quota exceeded / incognito private mode)
    }
  }, [columnVisibility, storageKey])

  const onColumnVisibilityChange: OnChangeFn<ColumnVisibilityState> = React.useCallback(
    (updaterOrValue) => {
      setColumnVisibility((old) =>
        typeof updaterOrValue === "function" ? updaterOrValue(old) : updaterOrValue,
      )
    },
    [],
  )

  const toggleColumnVisibility = React.useCallback((columnId: string, isVisible?: boolean) => {
    setColumnVisibility((old) => {
      const currentVisible = old[columnId] !== false
      const nextVisible = typeof isVisible === "boolean" ? isVisible : !currentVisible
      return {
        ...old,
        [columnId]: nextVisible,
      }
    })
  }, [])

  const resetColumnVisibility = React.useCallback(() => {
    setColumnVisibility(initialVisibility)
  }, [initialVisibility])

  const showAllColumns = React.useCallback((columnIds?: string[]) => {
    setColumnVisibility((old) => {
      const next: ColumnVisibilityState = { ...old }
      if (columnIds && columnIds.length > 0) {
        for (const id of columnIds) {
          next[id] = true
        }
      } else {
        for (const key of Object.keys(next)) {
          next[key] = true
        }
      }
      return next
    })
  }, [])

  return {
    columnVisibility,
    setColumnVisibility,
    onColumnVisibilityChange,
    toggleColumnVisibility,
    resetColumnVisibility,
    showAllColumns,
  }
}
