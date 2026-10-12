"use client"

import * as React from "react"
import { parseAsInteger, useQueryState } from "nuqs"
import type { OnChangeFn, PaginationState } from "@tanstack/react-table"

export interface UseDataTablePaginationOptions {
  /**
   * Default page index (0-indexed). Defaults to 0.
   */
  defaultPageIndex?: number
  /**
   * Default page size. Defaults to 10.
   */
  defaultPageSize?: number
  /**
   * Parameter name used for page in URL query string (1-indexed). Defaults to "page".
   */
  pageParamKey?: string
  /**
   * Parameter name used for pageSize in URL query string. Defaults to "pageSize".
   */
  pageSizeParamKey?: string
  /**
   * If true, sync pagination state with URL search params using nuqs. Defaults to true.
   */
  syncToUrl?: boolean
}

export interface UseDataTablePaginationReturn {
  /**
   * Pagination state object (0-indexed pageIndex) compatible with TanStack Table.
   */
  pagination: PaginationState
  /**
   * Direct updater function compatible with TanStack Table onPaginationChange.
   */
  onPaginationChange: OnChangeFn<PaginationState>
  /**
   * Helper to set page index directly (0-indexed).
   */
  setPageIndex: (updaterOrValue: number | ((prev: number) => number)) => void
  /**
   * Helper to set page size directly.
   */
  setPageSize: (size: number) => void
  /**
   * Normalized query parameters for backend API (1-indexed page).
   */
  queryParams: {
    page: number
    pageSize: number
  }
}

/**
 * Reusable hook for server-side pagination with TanStack Table and nuqs.
 *
 * Supports bi-directional synchronization with URL search parameters via nuqs (1-indexed in URL,
 * 0-indexed in TanStack table state) or standalone in-memory state.
 */
export function useDataTablePagination({
  defaultPageIndex = 0,
  defaultPageSize = 10,
  pageParamKey = "page",
  pageSizeParamKey = "pageSize",
  syncToUrl = true,
}: UseDataTablePaginationOptions = {}): UseDataTablePaginationReturn {
  // Convert 0-indexed default page index to 1-indexed URL page
  const defaultPage = Math.max(1, defaultPageIndex + 1)

  // Configure nuqs query state for page (1-indexed in URL)
  const [urlPage, setUrlPage] = useQueryState(
    pageParamKey,
    parseAsInteger.withDefault(defaultPage).withOptions({
      shallow: true,
      clearOnDefault: true,
      history: "push",
    }),
  )

  // Configure nuqs query state for pageSize
  const [urlPageSize, setUrlPageSize] = useQueryState(
    pageSizeParamKey,
    parseAsInteger.withDefault(defaultPageSize).withOptions({
      shallow: true,
      clearOnDefault: true,
      history: "push",
    }),
  )

  // Internal state fallback for standalone in-memory mode (when syncToUrl is false)
  const [inMemoryPagination, setInMemoryPagination] = React.useState<PaginationState>({
    pageIndex: defaultPageIndex,
    pageSize: defaultPageSize,
  })

  // Normalize current page index (0-indexed for TanStack Table) and pageSize
  const pagination: PaginationState = React.useMemo(() => {
    if (!syncToUrl) {
      return inMemoryPagination
    }

    // Sanitize non-positive values from URL to safe minimums
    const safePage = Math.max(1, urlPage)
    const safePageSize = Math.max(1, urlPageSize)

    return {
      pageIndex: safePage - 1,
      pageSize: safePageSize,
    }
  }, [syncToUrl, inMemoryPagination, urlPage, urlPageSize])

  const onPaginationChange: OnChangeFn<PaginationState> = React.useCallback(
    (updaterOrValue) => {
      const next =
        typeof updaterOrValue === "function" ? updaterOrValue(pagination) : updaterOrValue

      if (pagination.pageIndex === next.pageIndex && pagination.pageSize === next.pageSize) {
        return
      }

      if (syncToUrl) {
        const nextUrlPage = Math.max(1, next.pageIndex + 1)
        const nextUrlPageSize = Math.max(1, next.pageSize)

        if (nextUrlPage !== pagination.pageIndex + 1) {
          void setUrlPage(nextUrlPage)
        }
        if (nextUrlPageSize !== pagination.pageSize) {
          void setUrlPageSize(nextUrlPageSize)
        }
      } else {
        setInMemoryPagination(next)
      }
    },
    [pagination, syncToUrl, setUrlPage, setUrlPageSize],
  )

  const setPageIndex = React.useCallback(
    (updaterOrValue: number | ((prev: number) => number)) => {
      onPaginationChange((prev) => {
        const nextIndex =
          typeof updaterOrValue === "function" ? updaterOrValue(prev.pageIndex) : updaterOrValue
        return {
          ...prev,
          pageIndex: Math.max(0, nextIndex),
        }
      })
    },
    [onPaginationChange],
  )

  const setPageSize = React.useCallback(
    (size: number) => {
      onPaginationChange((prev) => ({
        ...prev,
        // Reset to first page when changing page size to prevent out-of-range pages
        pageIndex: 0,
        pageSize: Math.max(1, size),
      }))
    },
    [onPaginationChange],
  )

  const queryParams = React.useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
    }),
    [pagination.pageIndex, pagination.pageSize],
  )

  return {
    pagination,
    onPaginationChange,
    setPageIndex,
    setPageSize,
    queryParams,
  }
}
