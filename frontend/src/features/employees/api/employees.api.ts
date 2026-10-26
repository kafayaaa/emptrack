import { z } from "zod"
import { apiClient } from "@/lib/api-client"
import {
  employeeSchema,
  type Employee,
  type EmployeeListInputQuery,
  type EmployeeListResponse,
} from "../schema/employee.schema"
import type { EmployeeFormValues } from "../schema/employee-form.schema"

export const employeeListResponseSchema = z.object({
  data: z.array(employeeSchema),
  meta: z.object({
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
})

export const employeeKeys = {
  all: ["employees"] as const,
  lists: () => [...employeeKeys.all, "list"] as const,
  list: (params?: EmployeeListInputQuery) => [...employeeKeys.lists(), params] as const,
  infiniteLists: () => [...employeeKeys.all, "infinite-list"] as const,
  infiniteList: (params?: Omit<EmployeeListInputQuery, "page">) =>
    [...employeeKeys.infiniteLists(), params] as const,
  details: () => [...employeeKeys.all, "detail"] as const,
  detail: (id: string) => [...employeeKeys.details(), id] as const,
}

export async function getEmployees(params?: EmployeeListInputQuery): Promise<EmployeeListResponse> {
  return apiClient.get<EmployeeListResponse>("/api/employees", {
    params: params as Record<string, string | number | boolean | null | undefined>,
    schema: employeeListResponseSchema,
  })
}

export async function getEmployeeById(id: string): Promise<Employee> {
  return apiClient.get<Employee>(`/api/employees/${id}`, {
    schema: employeeSchema,
  })
}

export async function createEmployee(data: EmployeeFormValues): Promise<Employee> {
  return apiClient.post<Employee>("/api/employees", data, {
    schema: employeeSchema,
  })
}

export async function updateEmployee(id: string, data: EmployeeFormValues): Promise<Employee> {
  return apiClient.patch<Employee>(`/api/employees/${encodeURIComponent(id)}`, data, {
    schema: employeeSchema,
  })
}

export const deleteEmployeeResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
})

export type DeleteEmployeeResponse = z.infer<typeof deleteEmployeeResponseSchema>

export async function deleteEmployee(id: string): Promise<DeleteEmployeeResponse> {
  return apiClient.delete<DeleteEmployeeResponse>(`/api/employees/${encodeURIComponent(id)}`, {
    schema: deleteEmployeeResponseSchema,
  })
}

export const checkEmailResponseSchema = z.object({
  isUnique: z.boolean(),
})

export type CheckEmailResponse = z.infer<typeof checkEmailResponseSchema>

export async function checkEmployeeEmailUnique(
  email: string,
  excludeId?: string,
): Promise<boolean> {
  const params: Record<string, string> = { email: email.trim().toLowerCase() }
  if (excludeId) params.excludeId = excludeId.trim()

  const res = await apiClient.get<CheckEmailResponse>("/api/employees/check-email", {
    params,
    schema: checkEmailResponseSchema,
  })
  return res.isUnique
}
