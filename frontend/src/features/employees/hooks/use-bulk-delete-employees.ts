"use client"

import * as React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { deleteEmployee, employeeKeys } from "../api/employees.api"
import {
  snapshotEmployeeLists,
  rollbackEmployeeLists,
  invalidateEmployeeLists,
  optimisticallyRemoveEmployeesFromCache,
  type EmployeeListsCacheSnapshot,
} from "./employee-cache-utils"

export interface BulkDeleteProgress {
  current: number
  total: number
  percentage: number
}

export interface BulkDeleteResult {
  successfulIds: string[]
  failedIds: string[]
  total: number
}

export type BulkDeleteMutationContext = EmployeeListsCacheSnapshot

export interface UseBulkDeleteEmployeesOptions {
  onSuccess?: (result: BulkDeleteResult) => void
  onError?: (error: Error) => void
  onSettled?: (result?: BulkDeleteResult, error?: Error | null) => void
  /**
   * Jumlah request delete yang dijalankan bersamaan.
   * Default: 3
   */
  concurrency?: number
}

const INITIAL_PROGRESS: BulkDeleteProgress = {
  current: 0,
  total: 0,
  percentage: 0,
}

/**
 * Custom hook untuk menghapus data banyak karyawan sekaligus (bulk deletion)
 * disertai pelacakan progress indikator secara real-time (EMPTRACK-78, EMPTRACK-82).
 */
export function useBulkDeleteEmployees(options?: UseBulkDeleteEmployeesOptions) {
  const queryClient = useQueryClient()
  const concurrency = options?.concurrency ?? 3

  const [progress, setProgress] = React.useState<BulkDeleteProgress>(INITIAL_PROGRESS)

  const resetProgress = React.useCallback(() => {
    setProgress(INITIAL_PROGRESS)
  }, [])

  const mutation = useMutation<BulkDeleteResult, Error, string[], BulkDeleteMutationContext>({
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
            await deleteEmployee(id)
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

      const result: BulkDeleteResult = {
        successfulIds,
        failedIds,
        total: ids.length,
      }

      if (failedIds.length === ids.length) {
        throw new Error("Semua proses penghapusan karyawan terpilih mengalami kegagalan.")
      }

      return result
    },
    onMutate: async (ids: string[]) => {
      // 1. Cancel query list agar tidak menimpa optimistic state
      await Promise.all([
        queryClient.cancelQueries({ queryKey: employeeKeys.lists() }),
        queryClient.cancelQueries({ queryKey: employeeKeys.infiniteLists() }),
        ...ids.map((id) => queryClient.cancelQueries({ queryKey: employeeKeys.detail(id) })),
      ])

      // 2. Snapshot cache
      const snapshots = snapshotEmployeeLists(queryClient)

      // 3 & 4. Optimistic remove dari paginated & infinite lists
      optimisticallyRemoveEmployeesFromCache(queryClient, ids)

      // 5. Bersihkan detail cache untuk IDs yang dihapus
      for (const id of ids) {
        queryClient.removeQueries({ queryKey: employeeKeys.detail(id) })
      }

      return snapshots
    },
    onError: (error, _ids, context) => {
      // Rollback cache lists jika semua gagal
      rollbackEmployeeLists(queryClient, context)

      toast.error("Gagal Menghapus Karyawan", {
        description:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan pada sistem saat menghapus data terpilih.",
      })

      options?.onError?.(error)
    },
    onSuccess: (result) => {
      if (result.failedIds.length > 0) {
        toast.warning("Sebagian Karyawan Gagal Dihapus", {
          description: `${result.successfulIds.length} berhasil dihapus, ${result.failedIds.length} gagal dihapus.`,
        })
      } else {
        toast.success("Karyawan Berhasil Dihapus", {
          description: `${result.successfulIds.length} karyawan terpilih telah berhasil dihapus dari sistem.`,
        })
      }

      options?.onSuccess?.(result)
    },
    onSettled: async (result, error) => {
      // Invalidate queries agar cache tersinkronisasi 100%
      await invalidateEmployeeLists(queryClient)

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
