"use client"

import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { deleteEmployee, employeeKeys, type DeleteEmployeeResponse } from "../api/employees.api"

export interface UseDeleteEmployeeOptions {
  onSuccess?: (data: DeleteEmployeeResponse, id: string) => void
  onError?: (error: Error, id: string) => void
  onSettled?: (data: DeleteEmployeeResponse | undefined, error: Error | null, id: string) => void
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
 * Menghapus cache detail, menginvalidasi seluruh query list, memunculkan toast feedback,
 * dan opsi navigasi otomatis kembali ke daftar karyawan.
 */
export function useDeleteEmployee(options?: UseDeleteEmployeeOptions) {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (id: string) => deleteEmployee(id),
    onSuccess: async (data, id) => {
      // 1. Bersihkan data detail karyawan dari cache
      queryClient.removeQueries({ queryKey: employeeKeys.detail(id) })

      // 2. Invalidate seluruh query list (paginated & infinite) agar tabel tersinkronisasi
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: employeeKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: employeeKeys.infiniteLists() }),
      ])

      // 3. Notifikasi toast sukses
      const nameText = options?.employeeName ? `${options.employeeName} ` : ""
      toast.success("Karyawan Berhasil Dihapus", {
        description: `Data karyawan ${nameText}telah berhasil dihapus dari sistem.`.trim(),
      })

      // 4. Redirect otomatis jika diminta (misal dari halaman detail)
      if (options?.redirectToIndex) {
        router.push("/employees")
      }

      options?.onSuccess?.(data, id)
    },
    onError: (error, id) => {
      toast.error("Gagal Menghapus Karyawan", {
        description:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan pada sistem saat menghapus data.",
      })

      options?.onError?.(error instanceof Error ? error : new Error(String(error)), id)
    },
    onSettled: (data, error, id) => {
      options?.onSettled?.(data, error, id)
    },
  })
}
