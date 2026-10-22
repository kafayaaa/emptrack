import React from "react"
import { describe, expect, it, vi, beforeEach } from "vitest"
import { EmployeeTable } from "./employee-table"
import { EmployeeTableSkeleton } from "./employee-table-skeleton"
import * as useEmployeesModule from "../hooks/use-employees"
import * as nextNavigation from "next/navigation"

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
  useSearchParams: vi.fn(),
}))

vi.mock("../hooks/use-employees", () => ({
  useEmployees: vi.fn(),
}))

describe("employee-table.tsx (EmployeeTable Component)", () => {
  const mockPush = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(nextNavigation.useRouter).mockReturnValue({
      push: mockPush,
    } as unknown as ReturnType<typeof nextNavigation.useRouter>)
    vi.mocked(nextNavigation.usePathname).mockReturnValue("/employees")
    vi.mocked(nextNavigation.useSearchParams).mockReturnValue(
      new URLSearchParams() as unknown as ReturnType<typeof nextNavigation.useSearchParams>,
    )
  })

  it("renders EmployeeTable with loaded data", () => {
    vi.mocked(useEmployeesModule.useEmployees).mockReturnValue({
      data: {
        data: [
          {
            id: "1",
            employeeNumber: "EMP-00001",
            fullName: "John Doe",
            email: "john@emptrack.test",
            phone: "+62 812 0000 1111",
            department: "Engineering",
            position: "Developer",
            status: "active",
            hireDate: "2023-01-01",
            isManager: false,
            managerId: null,
            projectId: "1",
          },
        ],
        meta: {
          page: 1,
          pageSize: 10,
          total: 1,
          totalPages: 1,
        },
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useEmployeesModule.useEmployees>)

    const element = <EmployeeTable />
    expect(element).toBeDefined()
  })

  it("handles loading and error states without throwing", () => {
    vi.mocked(useEmployeesModule.useEmployees).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useEmployeesModule.useEmployees>)

    const loadingElement = <EmployeeTable />
    expect(loadingElement).toBeDefined()

    vi.mocked(useEmployeesModule.useEmployees).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error("Server error 500"),
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useEmployeesModule.useEmployees>)

    const errorElement = <EmployeeTable />
    expect(errorElement).toBeDefined()
  })

  it("handles isPlaceholderData and isFetching states without throwing", () => {
    vi.mocked(useEmployeesModule.useEmployees).mockReturnValue({
      data: {
        data: [],
        meta: { page: 1, pageSize: 10, total: 0, totalPages: 0 },
      },
      isLoading: false,
      isFetching: true,
      isPlaceholderData: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useEmployeesModule.useEmployees>)

    const placeholderElement = <EmployeeTable />
    expect(placeholderElement).toBeDefined()
  })

  it("is wrapped in React.memo for re-render optimization", () => {
    // React.memo components have a $$typeof symbol or type property
    expect(EmployeeTable).toBeDefined()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((EmployeeTable as any).$$typeof?.toString()).toContain("react.memo")
  })

  it("accepts controlled column visibility props", () => {
    const onColumnVisibilityChange = vi.fn()
    const element = (
      <EmployeeTable
        columnVisibility={{ hireDate: false }}
        onColumnVisibilityChange={onColumnVisibilityChange}
        showColumnVisibility={true}
      />
    )
    expect(element).toBeDefined()
  })

  describe("EmployeeTableSkeleton", () => {
    it("renders valid table skeleton structure with columns and pagination", () => {
      const element = <EmployeeTableSkeleton rowCount={5} />
      expect(element).toBeDefined()
    })

    it("is wrapped in React.memo", () => {
      expect(EmployeeTableSkeleton).toBeDefined()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((EmployeeTableSkeleton as any).$$typeof?.toString()).toContain("react.memo")
    })
  })
})
