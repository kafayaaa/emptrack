"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { createEmployee, employeeKeys } from "../api/employees.api"
import type { EmployeeFormValues } from "../schema/employee-form.schema"
import type { Employee } from "../types"

export interface UseCreateEmployeeOptions {
  onSuccess?: (data: Employee) => void
  onError?: (error: Error) => void
}

/**
 * Custom hook untuk menambahkan karyawan baru via HTTP POST ke /api/employees.
 * Secara otomatis menginvalidasi cache query list dan memicu toast notifikasi sukses/gagal.
 */
export function useCreateEmployee(options?: UseCreateEmployeeOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: EmployeeFormValues) => createEmployee(values),
    onSuccess: (newEmployee) => {
      // Invalidate list queries agar tabel & daftar infinite terupdate otomatis
      void queryClient.invalidateQueries({ queryKey: employeeKeys.lists() })
      void queryClient.invalidateQueries({ queryKey: employeeKeys.infiniteLists() })

      toast.success("Karyawan Berhasil Ditambahkan", {
        description: `${newEmployee.fullName} (${newEmployee.employeeNumber}) telah berhasil didaftarkan.`,
      })

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
