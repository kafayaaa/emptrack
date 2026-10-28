import { useQuery, type UseQueryOptions } from "@tanstack/react-query"
import { assetKeys, getAssetById } from "../api"
import type { Asset } from "../schema/asset.schema"

export type UseAssetOptions = Omit<
  UseQueryOptions<Asset, Error, Asset, ReturnType<typeof assetKeys.detail>>,
  "queryKey" | "queryFn"
>

export const ASSET_DETAIL_CACHE_CONFIG = {
  STALE_TIME: 5 * 60 * 1000, // 5 minutes fresh cache
  GC_TIME: 10 * 60 * 1000, // 10 minutes garbage collection time
} as const

/**
 * Hook to fetch a single asset by ID using TanStack Query (EMPTRACK-92).
 *
 * Caches asset details fresh for 5 minutes (STALE_TIME) and keeps in memory
 * for 10 minutes (GC_TIME), providing instant back-and-forth navigation.
 */
export function useAsset(id: string, options?: UseAssetOptions) {
  return useQuery({
    queryKey: assetKeys.detail(id),
    queryFn: ({ signal }) => getAssetById(id, { signal }),
    enabled: Boolean(id && id.trim().length > 0),
    staleTime: ASSET_DETAIL_CACHE_CONFIG.STALE_TIME,
    gcTime: ASSET_DETAIL_CACHE_CONFIG.GC_TIME,
    ...options,
  })
}
