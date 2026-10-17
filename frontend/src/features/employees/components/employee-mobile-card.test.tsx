import React from "react"
import { describe, expect, it } from "vitest"
import { EmployeeMobileCard } from "./employee-mobile-card"
import type { Employee } from "../types"

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
})
