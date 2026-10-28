import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"
import { assetKeys, getAssetById } from "../api"
import { ASSET_DETAIL_CACHE_CONFIG } from "./use-asset"

/**
 * Hook to prefetch single asset detail data into TanStack Query cache (EMPTRACK-92).
 *
 * Typically invoked during mouse hover (`onMouseEnter`), keyboard focus (`onFocus`),
 * or touch start (`onTouchStart`) to warm up the cache before user navigation,
 * achieving near-instant page transitions (0ms perceived latency).
 */
export function usePrefetchAsset() {
  let queryClient: ReturnType<typeof useQueryClient> | null = null
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    queryClient = useQueryClient()
  } catch {
    // Graceful fallback when rendered outside QueryClientProvider
    queryClient = null
  }

  const prefetchAsset = React.useCallback(
    (id: string | undefined | null) => {
      const normalizedId = id?.trim()
      if (!normalizedId || !queryClient) return

      queryClient.prefetchQuery({
        queryKey: assetKeys.detail(normalizedId),
        queryFn: ({ signal }) => getAssetById(normalizedId, { signal }),
        staleTime: ASSET_DETAIL_CACHE_CONFIG.STALE_TIME,
      })
    },
    [queryClient],
  )

  return { prefetchAsset }
}
