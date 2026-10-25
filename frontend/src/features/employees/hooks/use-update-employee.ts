"use client"

import {
  useMutation,
  useQueryClient,
  type InfiniteData,
  type QueryKey,
} from "@tanstack/react-query"
import { toast } from "sonner"
import { updateEmployee, employeeKeys } from "../api/employees.api"
import type { EmployeeListResponse } from "../schema/employee.schema"
import type { EmployeeFormValues } from "../schema/employee-form.schema"
import type { Employee } from "../types"

export interface UpdateEmployeeMutationContext {
  previousEmployee?: Employee
  previousLists?: Array<[QueryKey, EmployeeListResponse | undefined]>
  previousInfiniteLists?: Array<[QueryKey, InfiniteData<EmployeeListResponse> | undefined]>
}

export interface UseUpdateEmployeeOptions {
  onSuccess?: (data: Employee) => void
  onError?: (error: Error, context?: UpdateEmployeeMutationContext) => void
  onSettled?: (data: Employee | undefined, error: Error | null) => void
}

/**
 * Custom hook untuk memperbarui data karyawan via HTTP PATCH ke /api/employees/[id].
 *
 * Mengimplementasikan Optimistic Update (EMPTRACK-68):
 * 1. onMutate: Cancel query yang sedang berjalan, snapshot cache sebelumnya, dan
 *    perbarui cache detail & lists seketika (0ms delay) sebelum request server selesai.
 * 2. onError: Melakukan Rollback ke snapshot data sebelumnya jika request gagal/terputus,
 *    disertai notifikasi toast pembatalan.
 * 3. onSuccess: Memperbarui cache detail dengan response resmi dari server dan toast sukses.
 * 4. onSettled: Sinkronisasi akhir dengan server via invalidateQueries untuk menjamin
 *    konsistensi data dengan database backend.
 */
export function useUpdateEmployee(id: string, options?: UseUpdateEmployeeOptions) {
  const queryClient = useQueryClient()

  return useMutation<Employee, Error, EmployeeFormValues, UpdateEmployeeMutationContext>({
    mutationFn: (values: EmployeeFormValues) => updateEmployee(id, values),
    onMutate: async (newValues: EmployeeFormValues) => {
      // 1. Cancel semua queries aktif agar tidak menimpa optimistic update
      await Promise.all([
        queryClient.cancelQueries({ queryKey: employeeKeys.detail(id) }),
        queryClient.cancelQueries({ queryKey: employeeKeys.lists() }),
        queryClient.cancelQueries({ queryKey: employeeKeys.infiniteLists() }),
      ])

      // 2. Snapshot data sebelum perubahan untuk rollback jika terjadi error
      const previousEmployee = queryClient.getQueryData<Employee>(employeeKeys.detail(id))
      const previousLists = queryClient.getQueriesData<EmployeeListResponse>({
        queryKey: employeeKeys.lists(),
      })
      const previousInfiniteLists = queryClient.getQueriesData<InfiniteData<EmployeeListResponse>>({
        queryKey: employeeKeys.infiniteLists(),
      })

      // 3. Optimistic update untuk detail karyawan
      if (previousEmployee) {
        queryClient.setQueryData<Employee>(employeeKeys.detail(id), {
          ...previousEmployee,
          ...newValues,
        })
      }

      // 4. Optimistic update untuk daftar paginated
      queryClient.setQueriesData<EmployeeListResponse>(
        { queryKey: employeeKeys.lists() },
        (old) => {
          if (!old?.data) return old
          return {
            ...old,
            data: old.data.map((emp) => (emp.id === id ? { ...emp, ...newValues } : emp)),
          }
        },
      )

      // 5. Optimistic update untuk daftar infinite
      queryClient.setQueriesData<InfiniteData<EmployeeListResponse>>(
        { queryKey: employeeKeys.infiniteLists() },
        (old) => {
          if (!old?.pages) return old
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((emp) => (emp.id === id ? { ...emp, ...newValues } : emp)),
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
    onError: (error, _newValues, context) => {
      // Rollback detail cache
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

      toast.error("Gagal Memperbarui Data Karyawan", {
        description:
          error instanceof Error
            ? `${error.message}. Perubahan telah dibatalkan.`
            : "Terjadi kesalahan pada sistem saat memperbarui data. Perubahan telah dibatalkan.",
      })

      options?.onError?.(error instanceof Error ? error : new Error(String(error)), context)
    },
    onSuccess: (updatedEmployee) => {
      // Memastikan cache detail sinkron dengan respon data kanonikal dari server
      queryClient.setQueryData(employeeKeys.detail(id), updatedEmployee)

      toast.success("Data Karyawan Berhasil Diperbarui", {
        description: `Informasi untuk ${updatedEmployee.fullName} (${updatedEmployee.employeeNumber}) telah berhasil diperbarui.`,
      })

      options?.onSuccess?.(updatedEmployee)
    },
    onSettled: async (data, error) => {
      // Invalidate semua query terkait agar cache 100% konsisten dengan database
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: employeeKeys.detail(id) }),
        queryClient.invalidateQueries({ queryKey: employeeKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: employeeKeys.infiniteLists() }),
      ])

      options?.onSettled?.(data, error)
    },
  })
}
