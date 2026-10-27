"use client"

import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { deleteEmployee, employeeKeys, type DeleteEmployeeResponse } from "../api/employees.api"
import type { Employee } from "../types"
import {
  snapshotEmployeeLists,
  rollbackEmployeeLists,
  invalidateEmployeeLists,
  optimisticallyRemoveEmployeesFromCache,
  type EmployeeListsCacheSnapshot,
} from "./employee-cache-utils"

export interface DeleteEmployeeMutationContext extends EmployeeListsCacheSnapshot {
  previousEmployee?: Employee
}

export interface UseDeleteEmployeeOptions {
  onSuccess?: (
    data: DeleteEmployeeResponse,
    id: string,
    context?: DeleteEmployeeMutationContext,
  ) => void
  onError?: (error: Error, id: string, context?: DeleteEmployeeMutationContext) => void
  onSettled?: (
    data: DeleteEmployeeResponse | undefined,
    error: Error | null,
    id: string,
    context?: DeleteEmployeeMutationContext,
  ) => void
  /**
   * Jika bernilai true, setelah berhasil menghapus akan mengarahkan pengguna kembali ke halaman utama /employees.
   * Cocok digunakan ketika tombol hapus dipicu dari halaman detail karyawan.
   * Default: false
   */
  redirectToIndex?: boolean
  /**
   * Nama lengkap karyawan (opsional) untuk dipersonalisasi di dalam pesan toast sukses.
   */
  employeeName?: string
}

/**
 * Custom hook untuk menghapus data karyawan via HTTP DELETE ke /api/employees/[id].
 *
 * Mengimplementasikan Optimistic Deletion + Invalidation (EMPTRACK-75, EMPTRACK-82):
 * 1. onMutate: Cancel queries aktif, snapshot data cache (detail, lists, infiniteLists),
 *    serta optimistically menghapus entitas dari cache secara instan (0ms delay).
 * 2. onError: Rollback ke snapshot cache sebelumnya jika request ke backend gagal/terputus,
 *    disertai notifikasi toast pembatalan.
 * 3. onSuccess: Menghapus detail cache, memunculkan notifikasi toast sukses, dan opsi redirect.
 * 4. onSettled: Invalidate query list (paginated & infinite) agar data tabel tersinkronisasi 100%
 *    dengan database backend.
 */
export function useDeleteEmployee(options?: UseDeleteEmployeeOptions) {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation<DeleteEmployeeResponse, Error, string, DeleteEmployeeMutationContext>({
    mutationFn: (id: string) => deleteEmployee(id),
    onMutate: async (id: string) => {
      // 1. Cancel semua queries aktif agar tidak menimpa optimistic deletion
      await Promise.all([
        queryClient.cancelQueries({ queryKey: employeeKeys.detail(id) }),
        queryClient.cancelQueries({ queryKey: employeeKeys.lists() }),
        queryClient.cancelQueries({ queryKey: employeeKeys.infiniteLists() }),
      ])

      // 2. Snapshot data sebelum dihapus untuk rollback jika terjadi error
      const previousEmployee = queryClient.getQueryData<Employee>(employeeKeys.detail(id))
      const snapshots = snapshotEmployeeLists(queryClient)

      // 3. Optimistic removal untuk detail karyawan dari cache
      queryClient.removeQueries({ queryKey: employeeKeys.detail(id) })

      // 4. Optimistic removal dari cache lists (paginated & infinite)
      optimisticallyRemoveEmployeesFromCache(queryClient, id)

      return {
        previousEmployee,
        ...snapshots,
      }
    },
    onError: (error, id, context) => {
      // Rollback detail cache jika sebelumnya ada
      if (context?.previousEmployee) {
        queryClient.setQueryData(employeeKeys.detail(id), context.previousEmployee)
      }

      // Rollback cache lists (paginated & infinite)
      rollbackEmployeeLists(queryClient, context)

      toast.error("Gagal Menghapus Karyawan", {
        description:
          error instanceof Error
            ? `${error.message}. Tindakan dibatalkan dan data dipulihkan.`
            : "Terjadi kesalahan pada sistem saat menghapus data. Tindakan dibatalkan dan data dipulihkan.",
      })

      options?.onError?.(error instanceof Error ? error : new Error(String(error)), id, context)
    },
    onSuccess: (data, id, context) => {
      // Pastikan data detail dibersihkan dari cache
      queryClient.removeQueries({ queryKey: employeeKeys.detail(id) })

      // Notifikasi toast sukses
      const nameText = options?.employeeName ? `${options.employeeName} ` : ""
      toast.success("Karyawan Berhasil Dihapus", {
        description: `Data karyawan ${nameText}telah berhasil dihapus dari sistem.`.trim(),
      })

      // Redirect otomatis jika diminta (misal dari halaman detail)
      if (options?.redirectToIndex) {
        router.push("/employees")
      }

      options?.onSuccess?.(data, id, context)
    },
    onSettled: async (data, error, id, context) => {
      // Invalidate seluruh query list (paginated & infinite) agar tabel tersinkronisasi
      await invalidateEmployeeLists(queryClient)

      options?.onSettled?.(data, error, id, context)
    },
  })
}
