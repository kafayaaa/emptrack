"use client"

import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { deleteAsset, assetKeys } from "../api"
import type { Asset } from "../types"
import {
  snapshotAssetLists,
  rollbackAssetLists,
  invalidateAssetLists,
  optimisticallyRemoveAssetsFromCache,
  type AssetListsCacheSnapshot,
} from "./asset-cache-utils"

export interface DeleteAssetMutationContext extends AssetListsCacheSnapshot {
  previousAsset?: Asset
}

export interface UseDeleteAssetOptions {
  onSuccess?: (id: string, context?: DeleteAssetMutationContext) => void
  onError?: (error: Error, id: string, context?: DeleteAssetMutationContext) => void
  onSettled?: (error: Error | null, id: string, context?: DeleteAssetMutationContext) => void
  /**
   * Jika bernilai true, setelah berhasil menghapus akan mengarahkan pengguna kembali ke halaman utama /assets.
   * Cocok digunakan ketika tombol hapus dipicu dari halaman detail aset.
   * Default: false
   */
  redirectToIndex?: boolean
  /**
   * Nama aset (opsional) untuk dipersonalisasi di dalam pesan toast sukses.
   */
  assetName?: string
}

/**
 * Custom hook untuk menghapus satu data aset via HTTP DELETE ke /api/assets/[id] (EMPTRACK-93).
 * Mengimplementasikan Optimistic Deletion + Invalidation + Rollback otomatis jika gagal.
 */
export function useDeleteAsset(options?: UseDeleteAssetOptions) {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation<void, Error, string, DeleteAssetMutationContext>({
    mutationFn: (id: string) => deleteAsset(id),
    onMutate: async (id: string) => {
      // 1. Cancel semua queries aktif agar tidak menimpa optimistic deletion
      await Promise.all([
        queryClient.cancelQueries({ queryKey: assetKeys.detail(id) }),
        queryClient.cancelQueries({ queryKey: assetKeys.lists() }),
      ])

      // 2. Snapshot data sebelum dihapus untuk rollback jika terjadi error
      const previousAsset = queryClient.getQueryData<Asset>(assetKeys.detail(id))
      const snapshots = snapshotAssetLists(queryClient)

      // 3. Optimistic removal untuk detail aset dari cache
      queryClient.removeQueries({ queryKey: assetKeys.detail(id) })

      // 4. Optimistic removal dari cache list
      optimisticallyRemoveAssetsFromCache(queryClient, id)

      return {
        previousAsset,
        ...snapshots,
      }
    },
    onError: (error, id, context) => {
      // Rollback detail cache jika sebelumnya ada
      if (context?.previousAsset) {
        queryClient.setQueryData(assetKeys.detail(id), context.previousAsset)
      }

      // Rollback cache lists
      rollbackAssetLists(queryClient, context)

      toast.error("Gagal Menghapus Aset", {
        description:
          error instanceof Error
            ? `${error.message}. Tindakan dibatalkan dan data dipulihkan.`
            : "Terjadi kesalahan pada sistem saat menghapus aset. Data dipulihkan.",
      })

      options?.onError?.(error instanceof Error ? error : new Error(String(error)), id, context)
    },
    onSuccess: (_data, id, context) => {
      queryClient.removeQueries({ queryKey: assetKeys.detail(id) })

      const nameText = options?.assetName ? `"${options.assetName}" ` : ""
      toast.success("Aset Berhasil Dihapus", {
        description: `Data aset ${nameText}telah berhasil dihapus dari sistem inventaris.`.trim(),
      })

      if (options?.redirectToIndex) {
        router.push("/assets")
      }

      options?.onSuccess?.(id, context)
    },
    onSettled: async (_data, error, id, context) => {
      await invalidateAssetLists(queryClient)
      options?.onSettled?.(error, id, context)
    },
  })
}
