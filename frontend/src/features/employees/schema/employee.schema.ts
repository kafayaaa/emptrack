import { z } from "zod"

// Bentuk 1 employee persis seperti data seed di json-server.
// Dipakai untuk memvalidasi response upstream DAN menurunkan tipe TypeScript.
export const employeeSchema = z.object({
  id: z.string(),
  employeeNumber: z.string(),
  fullName: z.string(),
  email: z.string(),
  phone: z.string(),
  department: z.string(),
  position: z.string(),
  status: z.string(),
  hireDate: z.string(),
  isManager: z.boolean(),
  managerId: z.string().nullable(), // manager teratas bernilai null
  projectId: z.string(),
})

// Kolom yang BOLEH dipakai untuk sorting (whitelist).
export const EMPLOYEE_SORT_FIELDS = [
  "employeeNumber",
  "fullName",
  "department",
  "position",
  "status",
  "hireDate",
] as const

// Kontrak query string dari browser ke /api/employees.
export const employeeListQuerySchema = z.object({
  // z.coerce mengubah string "2" dari URL menjadi number 2
  page: z.coerce.number().int().min(1).default(1),
  // max(100) mencegah client meminta pageSize=100000
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().min(1).max(100).optional(),
  sortBy: z.enum(EMPLOYEE_SORT_FIELDS).optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  // filter
  department: z.string().trim().min(1).max(50).optional(),
  position: z.string().trim().min(1).max(50).optional(),
  status: z.string().trim().min(1).max(50).optional(),
  projectId: z.string().regex(/^\d+$/).optional(), // hanya angka
  isManager: z.enum(["true", "false"]).optional(),
})

// Bentuk response mentah json-server v1 (hanya field yang kita pakai).
export const jsonServerEmployeeListSchema = z.object({
  items: z.number().int().nonnegative(), // total seluruh data
  pages: z.number().int().nonnegative(), // total halaman
  data: z.array(employeeSchema),
})

export type Employee = z.infer<typeof employeeSchema>
export type EmployeeListQuery = z.infer<typeof employeeListQuerySchema>

// Kontrak response yang diterima frontend.
export type EmployeeListResponse = {
  data: Employee[]
  meta: { page: number; pageSize: number; total: number; totalPages: number }
}
