import type { QueryClient, QueryKey } from "@tanstack/react-query"
import { assetKeys } from "../api/asset-keys"
import type { AssetListResponse } from "../schema/asset.schema"

export type AssetListSnapshot = Array<[QueryKey, AssetListResponse | undefined]>

export interface AssetListsCacheSnapshot {
  previousLists?: AssetListSnapshot
}

/**
 * Mengambil snapshot cache dari seluruh query list aset
 * untuk keperluan rollback jika mutasi gagal (EMPTRACK-93).
 */
export function snapshotAssetLists(queryClient: QueryClient): AssetListsCacheSnapshot {
  return {
    previousLists: queryClient.getQueriesData<AssetListResponse>({
      queryKey: assetKeys.lists(),
    }),
  }
}

/**
 * Melakukan rollback cache list aset ke snapshot data sebelumnya jika mutasi error.
 */
export function rollbackAssetLists(
  queryClient: QueryClient,
  snapshot?: AssetListsCacheSnapshot,
): void {
  if (snapshot?.previousLists) {
    for (const [queryKey, data] of snapshot.previousLists) {
      queryClient.setQueryData(queryKey, data)
    }
  }
}

/**
 * Menginvalidasi seluruh query list aset untuk sinkronisasi akhir dengan backend.
 */
export async function invalidateAssetLists(queryClient: QueryClient): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: assetKeys.lists() })
}

/**
 * Menghapus satu atau banyak aset dari cache list paginated secara instan (optimistic UI).
 * Mengupdate item data, total count, dan recalculate totalPages secara otomatis.
 */
export function optimisticallyRemoveAssetsFromCache(
  queryClient: QueryClient,
  idsToRemove: string | string[],
): void {
  const ids = Array.isArray(idsToRemove) ? idsToRemove : [idsToRemove]
  if (ids.length === 0) return

  const idSet = new Set(ids)

  queryClient.setQueriesData<AssetListResponse>({ queryKey: assetKeys.lists() }, (old) => {
    if (!old?.data) return old
    const nextData = old.data.filter((asset) => !idSet.has(asset.id))
    const removedCount = old.data.length - nextData.length
    if (removedCount === 0) return old
    const nextTotal = Math.max(0, old.meta.total - removedCount)
    return {
      ...old,
      data: nextData,
      meta: {
        ...old.meta,
        total: nextTotal,
        totalPages: Math.ceil(nextTotal / old.meta.pageSize),
      },
    }
  })
}
