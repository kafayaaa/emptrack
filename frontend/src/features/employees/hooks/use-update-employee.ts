"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { updateEmployee, employeeKeys } from "../api/employees.api"
import type { EmployeeFormValues } from "../schema/employee-form.schema"
import type { Employee } from "../types"

export interface UseUpdateEmployeeOptions {
  onSuccess?: (data: Employee) => void
  onError?: (error: Error) => void
}

/**
 * Custom hook untuk memperbarui data karyawan via HTTP PATCH ke /api/employees/[id].
 * Mengisi cache detail seketika (setQueryData), menginvalidasi seluruh query list,
 * dan memicu toast notifikasi sukses/gagal.
 */
export function useUpdateEmployee(id: string, options?: UseUpdateEmployeeOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: EmployeeFormValues) => updateEmployee(id, values),
    onSuccess: async (updatedEmployee) => {
      // 1. Update cache detail seketika agar halaman detail langsung ter-update tanpa reload
      queryClient.setQueryData(employeeKeys.detail(id), updatedEmployee)

      // 2. Invalidate list queries agar tabel & daftar infinite terupdate otomatis
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: employeeKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: employeeKeys.infiniteLists() }),
      ])

      toast.success("Data Karyawan Berhasil Diperbarui", {
        description: `Informasi untuk ${updatedEmployee.fullName} (${updatedEmployee.employeeNumber}) telah berhasil diperbarui.`,
      })

      options?.onSuccess?.(updatedEmployee)
    },
    onError: (error) => {
      toast.error("Gagal Memperbarui Data Karyawan", {
        description:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan pada sistem saat memperbarui data.",
      })

      options?.onError?.(error instanceof Error ? error : new Error(String(error)))
    },
  })
}
