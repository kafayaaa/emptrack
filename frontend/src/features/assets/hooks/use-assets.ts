import { keepPreviousData, useQuery, type UseQueryOptions } from "@tanstack/react-query"
import { assetKeys, getAssets } from "../api"
import type { AssetListInputQuery, AssetListResponse } from "../schema/asset.schema"

export type UseAssetsOptions = Omit<
  UseQueryOptions<AssetListResponse, Error, AssetListResponse, ReturnType<typeof assetKeys.list>>,
  "queryKey" | "queryFn"
>

/**
 * Default cache configuration for assets query.
 */
export const ASSET_CACHE_CONFIG = {
  PAGE_ONE_STALE_TIME: 5 * 60 * 1000, // 5 minutes
  DEFAULT_STALE_TIME: 60 * 1000, // 1 minute
  GC_TIME: 10 * 60 * 1000, // 10 minutes
} as const

/**
 * Hook to fetch paginated and filtered list of assets using TanStack Query (EMPTRACK-87).
 *
 * Keeps previous page data while loading new pages (`placeholderData: keepPreviousData`)
 * to avoid layout flickers during pagination/sorting/filtering transitions.
 *
 * Applies a deliberate staleTime strategy:
 * - Page 1 (default landing page): cached fresh for 5 minutes (`PAGE_ONE_STALE_TIME`).
 * - Page 2+: cached fresh for 1 minute (`DEFAULT_STALE_TIME`).
 */
export function useAssets(params?: AssetListInputQuery, options?: UseAssetsOptions) {
  const isPageOne = !params?.page || params.page === 1
  const defaultStaleTime = isPageOne
    ? ASSET_CACHE_CONFIG.PAGE_ONE_STALE_TIME
    : ASSET_CACHE_CONFIG.DEFAULT_STALE_TIME

  return useQuery({
    queryKey: assetKeys.list(params ?? {}),
    queryFn: ({ signal }) => getAssets(params, { signal }),
    placeholderData: keepPreviousData,
    staleTime: defaultStaleTime,
    gcTime: ASSET_CACHE_CONFIG.GC_TIME,
    ...options,
  })
}
