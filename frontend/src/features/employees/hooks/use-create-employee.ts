"use client"

import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { createEmployee, employeeKeys } from "../api/employees.api"
import type { EmployeeFormValues } from "../schema/employee-form.schema"
import type { Employee } from "../types"

export interface UseCreateEmployeeOptions {
  onSuccess?: (data: Employee) => void
  onError?: (error: Error) => void
  /**
   * Jika bernilai true, browser akan diarahkan langsung ke halaman detail karyawan baru.
   * Default: false (tetap di halaman dan menampilkan tombol aksi "Lihat Profil" di Toast).
   */
  redirectToDetail?: boolean
}

/**
 * Custom hook untuk menambahkan karyawan baru via HTTP POST ke /api/employees.
 * Mengisi cache detail seketika (cache priming), menginvalidasi seluruh query list,
 * dan memunculkan toast notifikasi interaktif.
 */
export function useCreateEmployee(options?: UseCreateEmployeeOptions) {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (values: EmployeeFormValues) => createEmployee(values),
    onSuccess: async (newEmployee) => {
      // 1. Cache priming: simpan detail karyawan baru ke cache agar navigasi instan
      queryClient.setQueryData(employeeKeys.detail(newEmployee.id), newEmployee)

      // 2. Invalidate seluruh query list (paginated & infinite) agar tabel me-refetch otomatis
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: employeeKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: employeeKeys.infiniteLists() }),
      ])

      // 3. Notifikasi Toast interaktif dengan tombol navigasi
      toast.success("Karyawan Berhasil Ditambahkan", {
        description: `${newEmployee.fullName} (${newEmployee.employeeNumber}) telah berhasil didaftarkan.`,
        action: {
          label: "Lihat Profil",
          onClick: () => router.push(`/employees/${newEmployee.id}`),
        },
      })

      // 4. Redirect otomatis jika diminta
      if (options?.redirectToDetail) {
        router.push(`/employees/${newEmployee.id}`)
      }

      options?.onSuccess?.(newEmployee)
    },
    onError: (error) => {
      toast.error("Gagal Menambahkan Karyawan", {
        description:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan pada sistem saat menyimpan data.",
      })

      options?.onError?.(error instanceof Error ? error : new Error(String(error)))
    },
  })
}
