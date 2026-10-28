"use client"

import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { createAsset, assetKeys } from "../api"
import type { AssetFormValues } from "../schema/asset-form.schema"
import type { AssetListResponse } from "../schema/asset.schema"
import type { Asset } from "../types"

export interface UseCreateAssetOptions {
  onSuccess?: (data: Asset) => void
  onError?: (error: Error) => void
  redirectToDetail?: boolean
}

/**
 * Custom hook untuk menambahkan aset baru via HTTP POST ke /api/assets (EMPTRACK-91).
 * Mengimplementasikan cache priming, optimasi paginated list cache, query invalidation,
 * dan toast feedback interaktif.
 */
export function useCreateAsset(options?: UseCreateAssetOptions) {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (values: AssetFormValues) => createAsset(values),
    onSuccess: async (newAsset) => {
      // 1. Cache priming: simpan detail aset baru ke cache
      queryClient.setQueryData(assetKeys.detail(newAsset.id), newAsset)

      // 2. Perbarui cache paginated lists seketika
      queryClient.setQueriesData<AssetListResponse>({ queryKey: assetKeys.lists() }, (old) => {
        if (!old?.data) return old
        const hasItem = old.data.some((ast) => ast.id === newAsset.id)
        if (hasItem) return old
        const nextTotal = old.meta.total + 1
        return {
          ...old,
          data: [newAsset, ...old.data],
          meta: {
            ...old.meta,
            total: nextTotal,
            totalPages: Math.ceil(nextTotal / old.meta.pageSize),
          },
        }
      })

      // 3. Invalidate query list agar sinkron penuh dengan server
      await queryClient.invalidateQueries({ queryKey: assetKeys.lists() })

      // 4. Toast notifikasi sukses dengan action button
      toast.success(`Aset "${newAsset.name}" berhasil ditambahkan`, {
        description: `Tag: ${newAsset.assetTag} • Status: ${newAsset.status}`,
        action: {
          label: "Lihat Detail",
          onClick: () => router.push(`/assets/${newAsset.id}`),
        },
      })

      // 5. Trigger opsional redirect atau custom callback
      if (options?.redirectToDetail) {
        router.push(`/assets/${newAsset.id}`)
      }

      options?.onSuccess?.(newAsset)
    },
    onError: (error: Error) => {
      toast.error("Gagal menambahkan aset baru", {
        description: error.message || "Terjadi kesalahan sistem saat menyimpan aset.",
      })
      options?.onError?.(error)
    },
  })
}
