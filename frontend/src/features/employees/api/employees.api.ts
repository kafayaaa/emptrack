import { z } from "zod"
import { apiClient } from "@/lib/api-client"
import {
  employeeSchema,
  type EmployeeListInputQuery,
  type EmployeeListResponse,
} from "../schema/employee.schema"

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
  details: () => [...employeeKeys.all, "detail"] as const,
  detail: (id: string) => [...employeeKeys.details(), id] as const,
}

export async function getEmployees(params?: EmployeeListInputQuery): Promise<EmployeeListResponse> {
  return apiClient.get<EmployeeListResponse>("/api/employees", {
    params: params as Record<string, string | number | boolean | null | undefined>,
    schema: employeeListResponseSchema,
  })
}
