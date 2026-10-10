import { describe, expect, it } from "vitest"
import {
  employeeSchema,
  employeeListQuerySchema,
  jsonServerEmployeeListSchema,
  EMPLOYEE_SORT_FIELDS,
} from "./employee.schema"

describe("employeeSchema", () => {
  const validEmployee = {
    id: "emp-1",
    employeeNumber: "EMP001",
    fullName: "John Doe",
    email: "john.doe@example.com",
    phone: "08123456789",
    department: "Engineering",
    position: "Software Engineer",
    status: "active",
    hireDate: "2024-01-15",
    isManager: false,
    managerId: "emp-0",
    projectId: "101",
  }

  it("berhasil memvalidasi data employee yang valid", () => {
    const result = employeeSchema.safeParse(validEmployee)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(validEmployee)
    }
  })

  it("menerima managerId bernilai null untuk manager level teratas", () => {
    const topManager = { ...validEmployee, managerId: null, isManager: true }
    const result = employeeSchema.safeParse(topManager)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.managerId).toBeNull()
    }
  })

  it("gagal validasi jika field wajib tidak ada", () => {
    // Menghapus fullName
    const { fullName: _, ...invalidEmployee } = validEmployee
    const result = employeeSchema.safeParse(invalidEmployee)
    expect(result.success).toBe(false)
  })

  it("gagal validasi jika tipe data tidak cocok (misal isManager bukan boolean)", () => {
    const invalidEmployee = { ...validEmployee, isManager: "true" }
    const result = employeeSchema.safeParse(invalidEmployee)
    expect(result.success).toBe(false)
  })
})

describe("employeeListQuerySchema", () => {
  it("mengisi default page=1, pageSize=20, dan sortOrder=asc jika query kosong", () => {
    const result = employeeListQuerySchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.pageSize).toBe(20)
      expect(result.data.sortOrder).toBe("asc")
    }
  })

  it("berhasil melakukan coerce string angka menjadi number (dari URL search params)", () => {
    const result = employeeListQuerySchema.safeParse({
      page: "3",
      pageSize: "50",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(3)
      expect(result.data.pageSize).toBe(50)
    }
  })

  it("gagal jika page bernilai 0 atau negatif", () => {
    const result = employeeListQuerySchema.safeParse({ page: "0" })
    expect(result.success).toBe(false)
  })

  it("gagal jika pageSize melebihi batas maksimum 100", () => {
    const result = employeeListQuerySchema.safeParse({ pageSize: "101" })
    expect(result.success).toBe(false)
  })

  it("melakukan trim pada string search dan filter", () => {
    const result = employeeListQuerySchema.safeParse({
      search: "  Budi Pratama  ",
      department: "  Engineering  ",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.search).toBe("Budi Pratama")
      expect(result.data.department).toBe("Engineering")
    }
  })

  it("menerima kolom sortBy yang ada di whitelist EMPLOYEE_SORT_FIELDS", () => {
    for (const field of EMPLOYEE_SORT_FIELDS) {
      const result = employeeListQuerySchema.safeParse({ sortBy: field })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.sortBy).toBe(field)
      }
    }
  })

  it("menolak kolom sortBy yang tidak terdaftar di whitelist (mencegah arbitrary sort)", () => {
    const result = employeeListQuerySchema.safeParse({ sortBy: "passwordHash" })
    expect(result.success).toBe(false)
  })

  it("memvalidasi projectId hanya berupa karakter angka (regex ^\\d+$)", () => {
    const validResult = employeeListQuerySchema.safeParse({ projectId: "12345" })
    expect(validResult.success).toBe(true)

    const invalidResult = employeeListQuerySchema.safeParse({ projectId: "abc-123" })
    expect(invalidResult.success).toBe(false)
  })
})

describe("jsonServerEmployeeListSchema", () => {
  it("berhasil memvalidasi envelope response dari json-server", () => {
    const upstreamResponse = {
      items: 1,
      pages: 1,
      data: [
        {
          id: "emp-1",
          employeeNumber: "EMP001",
          fullName: "Jane Doe",
          email: "jane@example.com",
          phone: "0812345678",
          department: "HR",
          position: "HR Specialist",
          status: "active",
          hireDate: "2023-05-10",
          isManager: false,
          managerId: null,
          projectId: "201",
        },
      ],
    }

    const result = jsonServerEmployeeListSchema.safeParse(upstreamResponse)
    expect(result.success).toBe(true)
  })

  it("gagal jika array data di dalamnya memiliki item yang tidak valid", () => {
    const invalidResponse = {
      items: 1,
      pages: 1,
      data: [
        {
          id: "emp-1",
          // field lainnya hilang
        },
      ],
    }

    const result = jsonServerEmployeeListSchema.safeParse(invalidResponse)
    expect(result.success).toBe(false)
  })
})
