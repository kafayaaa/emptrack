"use client"

import * as React from "react"
import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs"
import type { OnChangeFn, SortingState } from "@tanstack/react-table"

export interface UseDataTableSortingOptions<TField extends string = string> {
  /**
   * List of allowed sortable column keys.
   */
  validFields?: readonly TField[]
  /**
   * Default sortBy field.
   */
  defaultSortBy?: TField
  /**
   * Default sortOrder ("asc" or "desc").
   */
  defaultSortOrder?: "asc" | "desc"
  /**
   * URL query parameter key for sortBy. Defaults to "sortBy".
   */
  sortByParamKey?: string
  /**
   * URL query parameter key for sortOrder. Defaults to "sortOrder".
   */
  sortOrderParamKey?: string
  /**
   * If true, sync sorting state with URL search params using nuqs. Defaults to true.
   */
  syncToUrl?: boolean
}

export interface UseDataTableSortingReturn<TField extends string = string> {
  /**
   * Sorting state array compatible with TanStack Table.
   */
  sorting: SortingState
  /**
   * OnChange handler compatible with TanStack Table onSortingChange.
   */
  onSortingChange: OnChangeFn<SortingState>
  /**
   * Normalized query parameters for backend API.
   */
  queryParams: {
    sortBy?: TField
    sortOrder?: "asc" | "desc"
  }
}

/**
 * Reusable hook for server-side sorting with TanStack Table and nuqs.
 *
 * Supports bi-directional synchronization with URL search parameters via nuqs
 * or standalone in-memory state.
 */
export function useDataTableSorting<TField extends string = string>({
  validFields,
  defaultSortBy,
  defaultSortOrder = "asc",
  sortByParamKey = "sortBy",
  sortOrderParamKey = "sortOrder",
  syncToUrl = true,
}: UseDataTableSortingOptions<TField> = {}): UseDataTableSortingReturn<TField> {
  // nuqs query state for sortBy
  const [urlSortBy, setUrlSortBy] = useQueryState(
    sortByParamKey,
    parseAsString.withDefault(defaultSortBy ?? "").withOptions({
      shallow: true,
      clearOnDefault: true,
      history: "push",
    }),
  )

  // nuqs query state for sortOrder
  const [urlSortOrder, setUrlSortOrder] = useQueryState(
    sortOrderParamKey,
    parseAsStringLiteral(["asc", "desc"] as const)
      .withDefault(defaultSortOrder)
      .withOptions({
        shallow: true,
        clearOnDefault: true,
        history: "push",
      }),
  )

  // In-memory fallback
  const [inMemorySorting, setInMemorySorting] = React.useState<SortingState>(() => {
    if (defaultSortBy) {
      return [{ id: defaultSortBy, desc: defaultSortOrder === "desc" }]
    }
    return []
  })

  // Normalize sorting state for TanStack Table
  const sorting: SortingState = React.useMemo(() => {
    if (!syncToUrl) {
      return inMemorySorting
    }

    if (!urlSortBy) {
      return []
    }

    if (validFields && !validFields.includes(urlSortBy as TField)) {
      return []
    }

    return [
      {
        id: urlSortBy,
        desc: urlSortOrder === "desc",
      },
    ]
  }, [syncToUrl, inMemorySorting, urlSortBy, urlSortOrder, validFields])

  const onSortingChange: OnChangeFn<SortingState> = React.useCallback(
    (updaterOrValue) => {
      const nextSorting =
        typeof updaterOrValue === "function" ? updaterOrValue(sorting) : updaterOrValue

      if (syncToUrl) {
        if (!nextSorting || nextSorting.length === 0) {
          void setUrlSortBy("")
          void setUrlSortOrder("asc")
          return
        }

        const primarySort = nextSorting[0]
        if (!primarySort) {
          void setUrlSortBy("")
          void setUrlSortOrder("asc")
          return
        }

        const nextSortBy = primarySort.id
        const nextSortOrder = primarySort.desc ? "desc" : "asc"

        void setUrlSortBy(nextSortBy)
        void setUrlSortOrder(nextSortOrder)
      } else {
        setInMemorySorting(nextSorting)
      }
    },
    [sorting, syncToUrl, setUrlSortBy, setUrlSortOrder],
  )

  const queryParams = React.useMemo(() => {
    if (sorting.length === 0) {
      return {}
    }
    const current = sorting[0]
    return {
      sortBy: current.id as TField,
      sortOrder: current.desc ? ("desc" as const) : ("asc" as const),
    }
  }, [sorting])

  return {
    sorting,
    onSortingChange,
    queryParams,
  }
}
