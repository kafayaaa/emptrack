import { describe, it, expect, vi, afterEach } from "vitest"
import { apiClient } from "@/lib/api-client"
import {
  employeeKeys,
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
} from "./employees.api"
import type { EmployeeListResponse } from "../schema/employee.schema"

afterEach(() => {
  vi.restoreAllMocks()
})

const mockEmployeeResponse: EmployeeListResponse = {
  data: [
    {
      id: "1",
      employeeNumber: "EMP001",
      fullName: "Jane Doe",
      email: "jane.doe@example.com",
      phone: "+628123456789",
      department: "Engineering",
      position: "Frontend Engineer",
      status: "active",
      hireDate: "2023-01-15",
      isManager: false,
      managerId: null,
      projectId: "101",
    },
  ],
  meta: {
    page: 1,
    pageSize: 20,
    total: 1,
    totalPages: 1,
  },
}

describe("employeeKeys", () => {
  it("menghasilkan struktur query key yang konsisten", () => {
    expect(employeeKeys.all).toEqual(["employees"])
    expect(employeeKeys.lists()).toEqual(["employees", "list"])
    expect(employeeKeys.list({ page: 2, pageSize: 10 })).toEqual([
      "employees",
      "list",
      { page: 2, pageSize: 10 },
    ])
    expect(employeeKeys.details()).toEqual(["employees", "detail"])
    expect(employeeKeys.detail("123")).toEqual(["employees", "detail", "123"])
  })
})

describe("getEmployees", () => {
  it("memanggil apiClient.get dengan path /api/employees dan params yang sesuai", async () => {
    const getSpy = vi.spyOn(apiClient, "get").mockResolvedValue(mockEmployeeResponse)

    const params = { page: 1, pageSize: 20, search: "Jane", sortOrder: "asc" as const }
    const result = await getEmployees(params)

    expect(getSpy).toHaveBeenCalledWith(
      "/api/employees",
      expect.objectContaining({
        params,
        schema: expect.any(Object),
      }),
    )
    expect(result).toEqual(mockEmployeeResponse)
  })

  it("berhasil memvalidasi response dengan employeeListResponseSchema", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockEmployeeResponse), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    )

    const result = await getEmployees()
    expect(result).toEqual(mockEmployeeResponse)
  })

  it("melempar ZodError jika struktur response backend tidak sesuai skema", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [{ id: "1" }], // field wajib lainnya tidak ada
          meta: { page: 1 },
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      ),
    )

    await expect(getEmployees()).rejects.toThrow()
  })
})

describe("getEmployeeById", () => {
  const sampleEmployee = mockEmployeeResponse.data[0]

  it("memanggil apiClient.get dengan path /api/employees/:id dan schema employeeSchema", async () => {
    const getSpy = vi.spyOn(apiClient, "get").mockResolvedValue(sampleEmployee)

    const result = await getEmployeeById("1")

    expect(getSpy).toHaveBeenCalledWith(
      "/api/employees/1",
      expect.objectContaining({
        schema: expect.any(Object),
      }),
    )
    expect(result).toEqual(sampleEmployee)
  })

  it("berhasil memvalidasi response dengan employeeSchema", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(sampleEmployee), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    )

    const result = await getEmployeeById("1")
    expect(result).toEqual(sampleEmployee)
  })

  it("melempar ZodError jika struktur response backend tidak sesuai skema", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "1", // field wajib lainnya tidak ada
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      ),
    )

    await expect(getEmployeeById("1")).rejects.toThrow()
  })
})

describe("createEmployee", () => {
  const newEmployeeData = {
    employeeNumber: "EMP-00100",
    fullName: "Budi Santoso",
    email: "budi.santoso@perusahaan.com",
    phone: "+62 812-3456-7890",
    department: "Engineering",
    position: "Frontend Developer",
    status: "active" as const,
    hireDate: "2024-01-15",
    isManager: false,
    managerId: null,
    projectId: "101",
  }

  it("memanggil apiClient.post dengan path /api/employees dan body data", async () => {
    const createdEmployee = { id: "emp-new", ...newEmployeeData }
    const postSpy = vi.spyOn(apiClient, "post").mockResolvedValue(createdEmployee)

    const result = await createEmployee(newEmployeeData)

    expect(postSpy).toHaveBeenCalledWith(
      "/api/employees",
      newEmployeeData,
      expect.objectContaining({
        schema: expect.any(Object),
      }),
    )
    expect(result).toEqual(createdEmployee)
  })
})

describe("updateEmployee", () => {
  const updateData = {
    employeeNumber: "EMP-00100",
    fullName: "Budi Santoso Diperbarui",
    email: "budi.update@perusahaan.com",
    phone: "+62 812-3456-7890",
    department: "Engineering",
    position: "Frontend Developer",
    status: "active" as const,
    hireDate: "2024-01-15",
    isManager: true,
    managerId: null,
    projectId: "102",
  }

  it("memanggil apiClient.patch dengan path /api/employees/:id dan body data", async () => {
    const updatedEmployee = { id: "emp-100", ...updateData }
    const patchSpy = vi.spyOn(apiClient, "patch").mockResolvedValue(updatedEmployee)

    const result = await updateEmployee("emp-100", updateData)

    expect(patchSpy).toHaveBeenCalledWith(
      "/api/employees/emp-100",
      updateData,
      expect.objectContaining({
        schema: expect.any(Object),
      }),
    )
    expect(result).toEqual(updatedEmployee)
  })
})
