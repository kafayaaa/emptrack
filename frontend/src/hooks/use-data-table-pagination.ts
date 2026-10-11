"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
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
   * If true, sync pagination state with URL search params. Defaults to true.
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
 * Reusable hook for server-side pagination with TanStack Table.
 *
 * Supports bi-directional synchronization with URL search parameters (1-indexed in URL,
 * 0-indexed in TanStack table state) or standalone in-memory state.
 */
export function useDataTablePagination({
  defaultPageIndex = 0,
  defaultPageSize = 10,
  pageParamKey = "page",
  pageSizeParamKey = "pageSize",
  syncToUrl = true,
}: UseDataTablePaginationOptions = {}): UseDataTablePaginationReturn {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Parse state directly from URL search params when syncToUrl is true
  const urlPageIndex = React.useMemo(() => {
    if (!syncToUrl || !searchParams) return defaultPageIndex
    const pageParam = searchParams.get(pageParamKey)
    if (!pageParam) return defaultPageIndex
    const parsed = parseInt(pageParam, 10)
    return isNaN(parsed) || parsed < 1 ? defaultPageIndex : parsed - 1
  }, [syncToUrl, searchParams, pageParamKey, defaultPageIndex])

  const urlPageSize = React.useMemo(() => {
    if (!syncToUrl || !searchParams) return defaultPageSize
    const pageSizeParam = searchParams.get(pageSizeParamKey)
    if (!pageSizeParam) return defaultPageSize
    const parsed = parseInt(pageSizeParam, 10)
    return isNaN(parsed) || parsed < 1 ? defaultPageSize : parsed
  }, [syncToUrl, searchParams, pageSizeParamKey, defaultPageSize])

  // Internal state fallback for standalone in-memory mode (when syncToUrl is false)
  const [inMemoryPagination, setInMemoryPagination] = React.useState<PaginationState>({
    pageIndex: defaultPageIndex,
    pageSize: defaultPageSize,
  })

  // When syncToUrl is true, URL search params is the single source of truth (no duplicate state or useEffect)
  const pagination: PaginationState = React.useMemo(() => {
    if (!syncToUrl) {
      return inMemoryPagination
    }
    return {
      pageIndex: urlPageIndex,
      pageSize: urlPageSize,
    }
  }, [syncToUrl, inMemoryPagination, urlPageIndex, urlPageSize])

  const updateUrl = React.useCallback(
    (newPageIndex: number, newPageSize: number) => {
      if (!syncToUrl || !searchParams || !router || !pathname) return

      const params = new URLSearchParams(searchParams.toString())
      const serverPage = newPageIndex + 1

      // Clean default params from URL query
      if (serverPage === defaultPageIndex + 1) {
        params.delete(pageParamKey)
      } else {
        params.set(pageParamKey, serverPage.toString())
      }

      if (newPageSize === defaultPageSize) {
        params.delete(pageSizeParamKey)
      } else {
        params.set(pageSizeParamKey, newPageSize.toString())
      }

      const queryString = params.toString()
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname
      router.push(newUrl, { scroll: false })
    },
    [
      syncToUrl,
      searchParams,
      router,
      pathname,
      defaultPageIndex,
      defaultPageSize,
      pageParamKey,
      pageSizeParamKey,
    ],
  )

  const onPaginationChange: OnChangeFn<PaginationState> = React.useCallback(
    (updaterOrValue) => {
      const next =
        typeof updaterOrValue === "function" ? updaterOrValue(pagination) : updaterOrValue

      if (pagination.pageIndex === next.pageIndex && pagination.pageSize === next.pageSize) {
        return
      }

      if (syncToUrl) {
        updateUrl(next.pageIndex, next.pageSize)
      } else {
        setInMemoryPagination(next)
      }
    },
    [pagination, syncToUrl, updateUrl],
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
