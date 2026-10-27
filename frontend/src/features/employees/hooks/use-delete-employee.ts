"use client"

import { useRouter } from "next/navigation"
import {
  useMutation,
  useQueryClient,
  type InfiniteData,
  type QueryKey,
} from "@tanstack/react-query"
import { toast } from "sonner"
import { deleteEmployee, employeeKeys, type DeleteEmployeeResponse } from "../api/employees.api"
import type { EmployeeListResponse } from "../schema/employee.schema"
import type { Employee } from "../types"

export interface DeleteEmployeeMutationContext {
  previousEmployee?: Employee
  previousLists?: Array<[QueryKey, EmployeeListResponse | undefined]>
  previousInfiniteLists?: Array<[QueryKey, InfiniteData<EmployeeListResponse> | undefined]>
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
 * Mengimplementasikan Optimistic Deletion + Invalidation (EMPTRACK-75):
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
      const previousLists = queryClient.getQueriesData<EmployeeListResponse>({
        queryKey: employeeKeys.lists(),
      })
      const previousInfiniteLists = queryClient.getQueriesData<InfiniteData<EmployeeListResponse>>({
        queryKey: employeeKeys.infiniteLists(),
      })

      // 3. Optimistic removal untuk detail karyawan dari cache
      queryClient.removeQueries({ queryKey: employeeKeys.detail(id) })

      // 4. Optimistic removal untuk daftar paginated
      queryClient.setQueriesData<EmployeeListResponse>(
        { queryKey: employeeKeys.lists() },
        (old) => {
          if (!old?.data) return old
          const hasItem = old.data.some((emp) => emp.id === id)
          if (!hasItem) return old
          const nextData = old.data.filter((emp) => emp.id !== id)
          const nextTotal = Math.max(0, old.meta.total - 1)
          const nextTotalPages = Math.ceil(nextTotal / old.meta.pageSize)
          return {
            ...old,
            data: nextData,
            meta: {
              ...old.meta,
              total: nextTotal,
              totalPages: nextTotalPages,
            },
          }
        },
      )

      // 5. Optimistic removal untuk daftar infinite
      queryClient.setQueriesData<InfiniteData<EmployeeListResponse>>(
        { queryKey: employeeKeys.infiniteLists() },
        (old) => {
          if (!old?.pages) return old
          const hasItem = old.pages.some((page) => page.data.some((emp) => emp.id === id))
          if (!hasItem) return old
          const nextTotal = Math.max(0, (old.pages[0]?.meta.total ?? 1) - 1)
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.filter((emp) => emp.id !== id),
              meta: {
                ...page.meta,
                total: nextTotal,
                totalPages: Math.ceil(nextTotal / page.meta.pageSize),
              },
            })),
          }
        },
      )

      return {
        previousEmployee,
        previousLists,
        previousInfiniteLists,
      }
    },
    onError: (error, id, context) => {
      // Rollback detail cache jika sebelumnya ada
      if (context?.previousEmployee) {
        queryClient.setQueryData(employeeKeys.detail(id), context.previousEmployee)
      }

      // Rollback paginated list caches
      if (context?.previousLists) {
        for (const [queryKey, data] of context.previousLists) {
          queryClient.setQueryData(queryKey, data)
        }
      }

      // Rollback infinite list caches
      if (context?.previousInfiniteLists) {
        for (const [queryKey, data] of context.previousInfiniteLists) {
          queryClient.setQueryData(queryKey, data)
        }
      }

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
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: employeeKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: employeeKeys.infiniteLists() }),
      ])

      options?.onSettled?.(data, error, id, context)
    },
  })
}
