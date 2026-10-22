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
  /**
   * Whether the stored column visibility preferences have been hydrated from localStorage.
   */
  isHydrated: boolean
}

const emptySubscribe = () => () => {}

/**
 * Reusable hook for managing TanStack Table column visibility state with optional localStorage persistence.
 * Prevents SSR hydration mismatch and cascading render warnings by using useSyncExternalStore for localStorage synchronization.
 */
export function useDataTableVisibility({
  initialVisibility = {},
  storageKey,
}: UseDataTableVisibilityOptions = {}): UseDataTableVisibilityReturn {
  // Subscribe to storage changes for same-window and cross-tab persistence updates
  const subscribe = React.useCallback(
    (callback: () => void) => {
      if (!storageKey || typeof window === "undefined") {
        return () => {}
      }
      const handleStorage = (event: StorageEvent) => {
        if (event.key === storageKey) {
          callback()
        }
      }
      const handleCustom = () => callback()

      window.addEventListener("storage", handleStorage)
      window.addEventListener(`emptrack:visibility:${storageKey}`, handleCustom)

      return () => {
        window.removeEventListener("storage", handleStorage)
        window.removeEventListener(`emptrack:visibility:${storageKey}`, handleCustom)
      }
    },
    [storageKey],
  )

  // Client snapshot reads raw string from localStorage
  const getSnapshot = React.useCallback(() => {
    if (!storageKey || typeof window === "undefined") return ""
    try {
      return window.localStorage.getItem(storageKey) ?? ""
    } catch {
      return ""
    }
  }, [storageKey])

  // Server snapshot is always empty to guarantee consistent SSR
  const getServerSnapshot = React.useCallback(() => "", [])

  const storedRaw = React.useSyncExternalStore(
    storageKey ? subscribe : emptySubscribe,
    getSnapshot,
    getServerSnapshot,
  )

  // Track hydration status safely without triggering cascading render lint errors
  const isHydrated = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  )

  // Local state for in-memory operation (or before hydration / when storage is disabled)
  const [localVisibility, setLocalVisibility] =
    React.useState<ColumnVisibilityState>(initialVisibility)

  // Parse stored preferences safely
  const storedVisibility = React.useMemo<ColumnVisibilityState | null>(() => {
    if (!storedRaw) return null
    try {
      const parsed = JSON.parse(storedRaw)
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed
      }
    } catch {
      // Fallback on corrupt JSON
    }
    return null
  }, [storedRaw])

  // Effective visibility merges initialVisibility with stored preferences (or localVisibility)
  const columnVisibility = React.useMemo<ColumnVisibilityState>(() => {
    if (storageKey) {
      if (isHydrated && storedVisibility !== null) {
        return { ...initialVisibility, ...storedVisibility }
      }
      return { ...initialVisibility, ...localVisibility }
    }
    return localVisibility
  }, [storageKey, isHydrated, storedVisibility, initialVisibility, localVisibility])

  const setColumnVisibility = React.useCallback<
    React.Dispatch<React.SetStateAction<ColumnVisibilityState>>
  >(
    (updaterOrValue) => {
      const next =
        typeof updaterOrValue === "function" ? updaterOrValue(columnVisibility) : updaterOrValue

      setLocalVisibility(next)

      if (storageKey && typeof window !== "undefined") {
        try {
          window.localStorage.setItem(storageKey, JSON.stringify(next))
          window.dispatchEvent(new Event(`emptrack:visibility:${storageKey}`))
        } catch {
          // Ignore quota / private browsing errors
        }
      }
    },
    [columnVisibility, storageKey],
  )

  const onColumnVisibilityChange: OnChangeFn<ColumnVisibilityState> = React.useCallback(
    (updaterOrValue) => {
      setColumnVisibility((old) =>
        typeof updaterOrValue === "function" ? updaterOrValue(old) : updaterOrValue,
      )
    },
    [setColumnVisibility],
  )

  const toggleColumnVisibility = React.useCallback(
    (columnId: string, isVisible?: boolean) => {
      setColumnVisibility((old) => {
        const currentVisible = old[columnId] !== false
        const nextVisible = typeof isVisible === "boolean" ? isVisible : !currentVisible
        return {
          ...old,
          [columnId]: nextVisible,
        }
      })
    },
    [setColumnVisibility],
  )

  const resetColumnVisibility = React.useCallback(() => {
    setLocalVisibility(initialVisibility)
    if (storageKey && typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(storageKey)
        window.dispatchEvent(new Event(`emptrack:visibility:${storageKey}`))
      } catch {
        // Ignore errors
      }
    }
  }, [initialVisibility, storageKey])

  const showAllColumns = React.useCallback(
    (columnIds?: string[]) => {
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
    },
    [setColumnVisibility],
  )

  return {
    columnVisibility,
    setColumnVisibility,
    onColumnVisibilityChange,
    toggleColumnVisibility,
    resetColumnVisibility,
    showAllColumns,
    isHydrated,
  }
}
