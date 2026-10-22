import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { EmployeeDetailView } from "./employee-detail-view"
import { EmployeeDetailSkeleton } from "./employee-detail-skeleton"
import { EmployeeDetailContainer } from "./employee-detail-container"
import * as hooksModule from "../hooks/use-employee"
import { ApiError } from "@/lib/api-client"
import type { Employee } from "../types"

const mockEmployee: Employee = {
  id: "1",
  employeeNumber: "EMP-00001",
  fullName: "Daruna Daruna Oktovian",
  email: "daruna.daruna.oktovian.1@emptrack.test",
  phone: "0849 938 826",
  department: "Engineering",
  position: "Manager",
  status: "active",
  hireDate: "2017-01-18",
  isManager: true,
  managerId: null,
  projectId: "1281",
}

describe("EmployeeDetailSkeleton", () => {
  it("merender skeleton loading tanpa error", () => {
    const html = renderToStaticMarkup(<EmployeeDetailSkeleton />)
    expect(html).toContain('data-testid="employee-detail-skeleton"')
  })
})

describe("EmployeeDetailView", () => {
  it("merender informasi detail employee lengkap", () => {
    const html = renderToStaticMarkup(<EmployeeDetailView employee={mockEmployee} />)

    expect(html).toContain("Daruna Daruna Oktovian")
    expect(html).toContain("EMP-00001")
    expect(html).toContain("Engineering")
    expect(html).toContain("Manager")
    expect(html).toContain("Active")
    expect(html).toContain("PRJ-1281")
    expect(html).toContain("None (Top-level)")
    expect(html).toContain(`mailto:${mockEmployee.email}`)
    expect(html).toContain(`tel:${mockEmployee.phone}`)
    expect(html).toContain("DO") // Initials
  })

  it("merender manajer langsung jika managerId tersedia dan bukan manajer jika isManager: false", () => {
    const staffEmployee: Employee = {
      ...mockEmployee,
      id: "42",
      fullName: "Staff Member",
      isManager: false,
      managerId: "1",
    }

    const html = renderToStaticMarkup(<EmployeeDetailView employee={staffEmployee} />)

    expect(html).toContain("Individual Contributor")
    expect(html).toContain("EMP-00001")
    expect(html).toContain('href="/employees/1"')
  })
})

describe("EmployeeDetailContainer", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("merender skeleton saat status query sedang loading", () => {
    vi.spyOn(hooksModule, "useEmployee").mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
      isFetching: false,
    } as unknown as ReturnType<typeof hooksModule.useEmployee>)

    const html = renderToStaticMarkup(<EmployeeDetailContainer id="1" />)
    expect(html).toContain('data-testid="employee-detail-skeleton"')
  })

  it("merender tampilan not found saat error 404", () => {
    vi.spyOn(hooksModule, "useEmployee").mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new ApiError(404, "Not Found"),
      refetch: vi.fn(),
      isFetching: false,
    } as unknown as ReturnType<typeof hooksModule.useEmployee>)

    const html = renderToStaticMarkup(<EmployeeDetailContainer id="999" />)
    expect(html).toContain('data-testid="employee-detail-not-found"')
    expect(html).toContain("Employee Not Found")
  })

  it("merender tampilan error umum saat terjadi error lain", () => {
    vi.spyOn(hooksModule, "useEmployee").mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error("Network Error"),
      refetch: vi.fn(),
      isFetching: false,
    } as unknown as ReturnType<typeof hooksModule.useEmployee>)

    const html = renderToStaticMarkup(<EmployeeDetailContainer id="1" />)
    expect(html).toContain('data-testid="employee-detail-error"')
    expect(html).toContain("Unable to Load Employee Details")
    expect(html).toContain("Network Error")
  })

  it("merender EmployeeDetailView saat data berhasil dimuat", () => {
    vi.spyOn(hooksModule, "useEmployee").mockReturnValue({
      data: mockEmployee,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
      isFetching: false,
    } as unknown as ReturnType<typeof hooksModule.useEmployee>)

    const html = renderToStaticMarkup(<EmployeeDetailContainer id="1" />)
    expect(html).toContain(`data-testid="employee-detail-${mockEmployee.id}"`)
    expect(html).toContain("Daruna Daruna Oktovian")
  })
})
