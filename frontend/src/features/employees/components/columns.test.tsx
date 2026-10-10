import { describe, expect, it } from "vitest"
import { employeeColumns } from "./columns"
import { EMPLOYEE_STATUS_CONFIG, EmployeeStatusBadge } from "./employee-status-badge"
import type { Employee } from "../types"

describe("columns.tsx (Employee Table Columns)", () => {
  describe("employeeColumns definition", () => {
    it("defines the expected set of columns matching whitelist sort fields and view needs", () => {
      const keys = employeeColumns.map((col) => ("accessorKey" in col ? col.accessorKey : col.id))

      expect(keys).toEqual([
        "employeeNumber",
        "fullName",
        "department",
        "position",
        "status",
        "hireDate",
      ])
    })

    it("enables sorting on all columns", () => {
      employeeColumns.forEach((col) => {
        expect(col.enableSorting).toBe(true)
      })
    })

    it("renders cells without throwing errors", () => {
      const sampleEmployee: Employee = {
        id: "1",
        employeeNumber: "EMP-00001",
        fullName: "Daruna Daruna Oktovian",
        email: "daruna.daruna.oktovian.1@emptrack.test",
        phone: "+62 812 3456 7890",
        department: "Engineering",
        position: "Manager",
        status: "active",
        hireDate: "2017-01-18",
        isManager: true,
        managerId: null,
        projectId: "1281",
      }

      employeeColumns.forEach((col) => {
        if ("cell" in col && typeof col.cell === "function") {
          const key = "accessorKey" in col ? (col.accessorKey as keyof Employee) : undefined
          const cellResult = col.cell({
            getValue: () => (key ? sampleEmployee[key] : undefined),
            row: {
              original: sampleEmployee,
              getValue: (colKey: string) => sampleEmployee[colKey as keyof Employee],
            },
          } as never)
          expect(cellResult).toBeDefined()
        }
      })
    })
  })

  describe("EmployeeStatusBadge", () => {
    it("has proper configuration for active, on_leave, and inactive", () => {
      expect(EMPLOYEE_STATUS_CONFIG.active).toEqual({
        label: "Active",
        variant: "success",
      })
      expect(EMPLOYEE_STATUS_CONFIG.on_leave).toEqual({
        label: "On Leave",
        variant: "warning",
      })
      expect(EMPLOYEE_STATUS_CONFIG.inactive).toEqual({
        label: "Inactive",
        variant: "destructive",
      })
    })

    it("renders valid status badges without errors", () => {
      const activeBadge = EmployeeStatusBadge({ status: "active" })
      const unknownBadge = EmployeeStatusBadge({ status: "unknown_status" })

      expect(activeBadge).toBeDefined()
      expect(unknownBadge).toBeDefined()
    })
  })
})
