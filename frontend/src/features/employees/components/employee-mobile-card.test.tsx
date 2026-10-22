import React from "react"
import { describe, expect, it, vi } from "vitest"
import { EmployeeMobileCard } from "./employee-mobile-card"
import type { Employee } from "../types"

const mockPrefetchEmployee = vi.fn()
vi.mock("../hooks", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../hooks")>()
  return {
    ...actual,
    usePrefetchEmployee: () => ({
      prefetchEmployee: mockPrefetchEmployee,
    }),
  }
})

const mockEmployee: Employee = {
  id: "emp-1",
  employeeNumber: "EMP-00100",
  fullName: "Sarah Connor",
  email: "sarah.connor@emptrack.test",
  phone: "+62 812 3456 7890",
  department: "Security Operations",
  position: "Security Lead",
  status: "active",
  hireDate: "2022-03-15",
  isManager: true,
  managerId: null,
  projectId: "proj-1",
}

describe("EmployeeMobileCard", () => {
  it("creates employee mobile card element without throwing", () => {
    const element = <EmployeeMobileCard employee={mockEmployee} />
    expect(element).toBeDefined()
    expect(element.props.employee.fullName).toBe("Sarah Connor")
    expect(element.props.employee.employeeNumber).toBe("EMP-00100")
  })

  it("handles non-manager employee without phone number", () => {
    const nonManagerEmployee: Employee = {
      ...mockEmployee,
      id: "emp-2",
      fullName: "John Smith",
      isManager: false,
      phone: null as unknown as string,
    }

    const element = <EmployeeMobileCard employee={nonManagerEmployee} />
    expect(element).toBeDefined()
    expect(element.props.employee.isManager).toBe(false)
  })

  it("triggers prefetchEmployee on mouseEnter, focus, and touchStart on the employee link", () => {
    mockPrefetchEmployee.mockClear()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rendered = (EmployeeMobileCard as any).type({ employee: mockEmployee })

    // Header -> leftContainer -> detailsDiv -> nameDiv -> Link
    const header = rendered.props.children[0]
    const leftContainer = header.props.children[0]
    const detailsDiv = leftContainer.props.children[1]
    const nameDiv = detailsDiv.props.children[0]
    const linkElement = nameDiv.props.children[0]

    expect(linkElement.props.href).toBe("/employees/emp-1")

    linkElement.props.onMouseEnter()
    expect(mockPrefetchEmployee).toHaveBeenCalledWith("emp-1")

    linkElement.props.onFocus()
    expect(mockPrefetchEmployee).toHaveBeenCalledWith("emp-1")

    linkElement.props.onTouchStart()
    expect(mockPrefetchEmployee).toHaveBeenCalledWith("emp-1")
    expect(mockPrefetchEmployee).toHaveBeenCalledTimes(3)
  })
})
