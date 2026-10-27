import { describe, expect, it, vi } from "vitest"
import {
  employeeColumns,
  EMPLOYEE_COLUMN_LABELS,
  getEmployeeColumnLabel,
  EmployeeNameCell,
} from "./columns"
import { EMPLOYEE_STATUS_CONFIG, EmployeeStatusBadge } from "./employee-status-badge"
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

describe("columns.tsx (Employee Table Columns)", () => {
  describe("employeeColumns definition", () => {
    it("defines the expected set of columns matching whitelist sort fields and view needs", () => {
      const keys = employeeColumns.map((col) => ("accessorKey" in col ? col.accessorKey : col.id))

      expect(keys).toEqual([
        "select",
        "employeeNumber",
        "fullName",
        "department",
        "position",
        "status",
        "hireDate",
      ])
    })

    it("enables sorting on data columns and disables on select column", () => {
      employeeColumns.forEach((col) => {
        const id = "accessorKey" in col ? col.accessorKey : col.id
        if (id === "select") {
          expect(col.enableSorting).toBe(false)
          expect(col.enableHiding).toBe(false)
        } else {
          expect(col.enableSorting).toBe(true)
        }
      })
    })

    it("renders select column header and cell with interactive checkboxes", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const selectCol = employeeColumns.find((col) => col.id === "select") as any
      expect(selectCol).toBeDefined()

      const mockToggleAll = vi.fn()
      const mockToggleRow = vi.fn()

      const headerResult = selectCol.header({
        table: {
          getIsAllPageRowsSelected: () => false,
          getIsSomePageRowsSelected: () => true,
          toggleAllPageRowsSelected: mockToggleAll,
        },
      })
      expect(headerResult).toBeDefined()

      const cellResult = selectCol.cell({
        row: {
          getIsSelected: () => true,
          getCanSelect: () => true,
          toggleSelected: mockToggleRow,
          original: { fullName: "Test Employee", id: "1" },
        },
      })
      expect(cellResult).toBeDefined()
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
              getIsSelected: () => false,
              getCanSelect: () => true,
              toggleSelected: vi.fn(),
            },
          } as never)
          expect(cellResult).toBeDefined()
        }
      })
    })
  })

  describe("EMPLOYEE_COLUMN_LABELS and getEmployeeColumnLabel", () => {
    it("maps all columns to human readable titles", () => {
      expect(EMPLOYEE_COLUMN_LABELS.select).toBe("Select")
      expect(EMPLOYEE_COLUMN_LABELS.employeeNumber).toBe("Employee ID")
      expect(EMPLOYEE_COLUMN_LABELS.fullName).toBe("Full Name")
      expect(EMPLOYEE_COLUMN_LABELS.department).toBe("Department")
      expect(EMPLOYEE_COLUMN_LABELS.position).toBe("Position")
      expect(EMPLOYEE_COLUMN_LABELS.status).toBe("Status")
      expect(EMPLOYEE_COLUMN_LABELS.hireDate).toBe("Hire Date")
    })

    it("returns correct label or fallback to id", () => {
      expect(getEmployeeColumnLabel("employeeNumber")).toBe("Employee ID")
      expect(getEmployeeColumnLabel("unknownCol")).toBe("unknownCol")
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
      const activeBadge = <EmployeeStatusBadge status="active" />
      const unknownBadge = <EmployeeStatusBadge status="unknown_status" />

      expect(activeBadge).toBeDefined()
      expect(unknownBadge).toBeDefined()
    })

    it("is memoized with React.memo", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((EmployeeStatusBadge as any).$$typeof?.toString()).toContain("react.memo")
    })
  })

  describe("EmployeeNameCell", () => {
    const sampleEmployee: Employee = {
      id: "emp-99",
      employeeNumber: "EMP-00099",
      fullName: "Bruce Wayne",
      email: "bruce@wayne.test",
      phone: "+62 812 0000 9999",
      department: "Management",
      position: "CEO",
      status: "active",
      hireDate: "2020-01-01",
      isManager: true,
      managerId: null,
      projectId: "proj-99",
    }

    it("renders employee link with name and email", () => {
      const cellElement = EmployeeNameCell({ employee: sampleEmployee })
      expect(cellElement).toBeDefined()
    })

    it("triggers prefetchEmployee on mouseEnter and focus", () => {
      mockPrefetchEmployee.mockClear()
      const cellElement = EmployeeNameCell({ employee: sampleEmployee })
      const linkElement = cellElement.props.children[0]

      linkElement.props.onMouseEnter()
      expect(mockPrefetchEmployee).toHaveBeenCalledWith("emp-99")

      linkElement.props.onFocus()
      expect(mockPrefetchEmployee).toHaveBeenCalledWith("emp-99")
    })
  })
})
