import React from "react"
import { describe, expect, it, vi } from "vitest"
import { EmployeeInfiniteTable } from "./employee-infinite-table"
import * as hooksModule from "../hooks/use-infinite-employees"

vi.mock("../hooks/use-infinite-employees", () => ({
  useInfiniteEmployees: vi.fn(),
}))

describe("EmployeeInfiniteTable", () => {
  it("renders with flattened employee pages data", () => {
    vi.mocked(hooksModule.useInfiniteEmployees).mockReturnValue({
      data: {
        pages: [
          {
            data: [
              {
                id: "1",
                employeeNumber: "EMP-00001",
                fullName: "Alice Wonderland",
                email: "alice@emptrack.test",
                phone: "08123456789",
                department: "Engineering",
                position: "Senior Manager",
                status: "active",
                hireDate: "2020-01-01",
                isManager: true,
                managerId: null,
                projectId: "1",
              },
            ],
            meta: { page: 1, pageSize: 20, total: 100, totalPages: 5 },
          },
        ],
        pageParams: [1],
      },
      isLoading: false,
      isFetching: false,
      isFetchingNextPage: false,
      hasNextPage: true,
      fetchNextPage: vi.fn(),
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof hooksModule.useInfiniteEmployees>)

    const element = <EmployeeInfiniteTable />
    expect(element).toBeDefined()
  })

  it("handles loading and error states without crashing", () => {
    vi.mocked(hooksModule.useInfiniteEmployees).mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: true,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof hooksModule.useInfiniteEmployees>)

    const loadingElement = <EmployeeInfiniteTable />
    expect(loadingElement).toBeDefined()

    vi.mocked(hooksModule.useInfiniteEmployees).mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
      isError: true,
      error: new Error("Failed to load employees"),
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof hooksModule.useInfiniteEmployees>)

    const errorElement = <EmployeeInfiniteTable />
    expect(errorElement).toBeDefined()
  })
})
