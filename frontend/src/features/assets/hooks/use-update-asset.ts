"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { updateAsset, assetKeys } from "../api"
import type { AssetFormValues } from "../schema/asset-form.schema"
import type { Asset, AssetListResponse } from "../types"

export interface UpdateAssetMutationContext {
  previousAsset?: Asset
  previousLists?: [unknown, AssetListResponse | undefined][]
}

export interface UseUpdateAssetOptions {
  onSuccess?: (data: Asset) => void
  onError?: (error: Error, context?: UpdateAssetMutationContext) => void
  onSettled?: (data: Asset | undefined, error: Error | null) => void
}

/**
 * Custom hook untuk memperbarui data aset via HTTP PATCH ke /api/assets/[id] (EMPTRACK-91).
 * Mengimplementasikan Optimistic Update dengan snapshot dan rollback otomatis jika gagal.
 */
export function useUpdateAsset(id: string, options?: UseUpdateAssetOptions) {
  const queryClient = useQueryClient()

  return useMutation<Asset, Error, Partial<AssetFormValues>, UpdateAssetMutationContext>({
    mutationFn: (values: Partial<AssetFormValues>) => updateAsset(id, values),
    onMutate: async (newValues: Partial<AssetFormValues>) => {
      // 1. Cancel query aktif agar tidak menimpa optimistic data
      await Promise.all([
        queryClient.cancelQueries({ queryKey: assetKeys.detail(id) }),
        queryClient.cancelQueries({ queryKey: assetKeys.lists() }),
      ])

      // 2. Snapshot cache detail dan lists untuk rollback jika error
      const previousAsset = queryClient.getQueryData<Asset>(assetKeys.detail(id))
      const previousLists = queryClient.getQueriesData<AssetListResponse>({
        queryKey: assetKeys.lists(),
      })

      // 3. Optimistic update detail
      if (previousAsset) {
        queryClient.setQueryData<Asset>(assetKeys.detail(id), {
          ...previousAsset,
          ...newValues,
        })
      }

      // 4. Optimistic update paginated lists
      queryClient.setQueriesData<AssetListResponse>({ queryKey: assetKeys.lists() }, (old) => {
        if (!old?.data) return old
        return {
          ...old,
          data: old.data.map((ast) => (ast.id === id ? { ...ast, ...newValues } : ast)),
        }
      })

      return {
        previousAsset,
        previousLists,
      }
    },
    onError: (error, _newValues, context) => {
      // Rollback detail cache
      if (context?.previousAsset) {
        queryClient.setQueryData(assetKeys.detail(id), context.previousAsset)
      }

      // Rollback lists cache
      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey as ReturnType<typeof assetKeys.list>, data)
        })
      }

      toast.error("Gagal memperbarui data aset", {
        description: error.message || "Perubahan dibatalkan karena kesalahan sistem.",
      })

      options?.onError?.(error, context)
    },
    onSuccess: (updatedAsset) => {
      queryClient.setQueryData(assetKeys.detail(id), updatedAsset)
      toast.success(`Data aset "${updatedAsset.name}" berhasil diperbarui`)
      options?.onSuccess?.(updatedAsset)
    },
    onSettled: (data, error) => {
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: assetKeys.detail(id) }),
        queryClient.invalidateQueries({ queryKey: assetKeys.lists() }),
      ])
      options?.onSettled?.(data, error)
    },
  })
}
