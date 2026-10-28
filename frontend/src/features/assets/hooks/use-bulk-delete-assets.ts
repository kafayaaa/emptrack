"use client"

import * as React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { deleteAsset, assetKeys } from "../api"
import {
  snapshotAssetLists,
  rollbackAssetLists,
  invalidateAssetLists,
  optimisticallyRemoveAssetsFromCache,
  type AssetListsCacheSnapshot,
} from "./asset-cache-utils"

export interface BulkDeleteProgress {
  current: number
  total: number
  percentage: number
}

export interface BulkDeleteAssetResult {
  successfulIds: string[]
  failedIds: string[]
  total: number
}

export type BulkDeleteAssetMutationContext = AssetListsCacheSnapshot

export interface UseBulkDeleteAssetsOptions {
  onSuccess?: (result: BulkDeleteAssetResult) => void
  onError?: (error: Error) => void
  onSettled?: (result?: BulkDeleteAssetResult, error?: Error | null) => void
  concurrency?: number
}

const INITIAL_PROGRESS: BulkDeleteProgress = {
  current: 0,
  total: 0,
  percentage: 0,
}

/**
 * Custom hook untuk menghapus banyak aset sekaligus (bulk deletion)
 * disertai pelacakan progress indikator secara real-time (EMPTRACK-93).
 */
export function useBulkDeleteAssets(options?: UseBulkDeleteAssetsOptions) {
  const queryClient = useQueryClient()
  const concurrency = options?.concurrency ?? 3

  const [progress, setProgress] = React.useState<BulkDeleteProgress>(INITIAL_PROGRESS)

  const resetProgress = React.useCallback(() => {
    setProgress(INITIAL_PROGRESS)
  }, [])

  const mutation = useMutation<
    BulkDeleteAssetResult,
    Error,
    string[],
    BulkDeleteAssetMutationContext
  >({
    mutationFn: async (ids: string[]) => {
      if (ids.length === 0) {
        return { successfulIds: [], failedIds: [], total: 0 }
      }

      setProgress({
        current: 0,
        total: ids.length,
        percentage: 0,
      })

      const successfulIds: string[] = []
      const failedIds: string[] = []

      let index = 0
      let completed = 0

      const worker = async () => {
        while (index < ids.length) {
          const currentIndex = index++
          const id = ids[currentIndex]
          try {
            await deleteAsset(id)
            successfulIds.push(id)
          } catch {
            failedIds.push(id)
          } finally {
            completed++
            const currentPercentage = Math.round((completed / ids.length) * 100)
            setProgress({
              current: completed,
              total: ids.length,
              percentage: currentPercentage,
            })
          }
        }
      }

      const workerCount = Math.min(concurrency, ids.length)
      const workers = Array.from({ length: workerCount }, () => worker())
      await Promise.all(workers)

      const result: BulkDeleteAssetResult = {
        successfulIds,
        failedIds,
        total: ids.length,
      }

      if (failedIds.length === ids.length) {
        throw new Error("Semua proses penghapusan aset terpilih mengalami kegagalan.")
      }

      return result
    },
    onMutate: async (ids: string[]) => {
      // 1. Cancel query list agar tidak menimpa optimistic state
      await Promise.all([
        queryClient.cancelQueries({ queryKey: assetKeys.lists() }),
        ...ids.map((id) => queryClient.cancelQueries({ queryKey: assetKeys.detail(id) })),
      ])

      // 2. Snapshot cache
      const snapshots = snapshotAssetLists(queryClient)

      // 3. Optimistic remove dari list
      optimisticallyRemoveAssetsFromCache(queryClient, ids)

      // 4. Bersihkan detail cache untuk IDs yang dihapus
      for (const id of ids) {
        queryClient.removeQueries({ queryKey: assetKeys.detail(id) })
      }

      return snapshots
    },
    onError: (error, _ids, context) => {
      rollbackAssetLists(queryClient, context)

      toast.error("Gagal Menghapus Aset Terpilih", {
        description:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan sistem saat menghapus aset terpilih.",
      })

      options?.onError?.(error)
    },
    onSuccess: (result) => {
      if (result.failedIds.length > 0) {
        toast.warning("Sebagian Aset Gagal Dihapus", {
          description: `${result.successfulIds.length} berhasil dihapus, ${result.failedIds.length} gagal dihapus.`,
        })
      } else {
        toast.success("Aset Berhasil Dihapus", {
          description: `${result.successfulIds.length} aset terpilih telah berhasil dihapus dari inventaris.`,
        })
      }

      options?.onSuccess?.(result)
    },
    onSettled: async (result, error) => {
      await invalidateAssetLists(queryClient)
      options?.onSettled?.(result, error)
    },
  })

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    progress,
    resetProgress,
    reset: () => {
      mutation.reset()
      resetProgress()
    },
  }
}
