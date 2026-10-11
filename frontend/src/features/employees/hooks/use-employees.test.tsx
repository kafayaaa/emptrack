import { describe, it, expect, vi, beforeEach } from "vitest"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { useEmployees } from "./use-employees"
import * as apiModule from "../api/employees.api"
import { employeeKeys } from "../api/employees.api"

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>()
  return {
    ...actual,
    useQuery: vi.fn(),
  }
})

describe("useEmployees", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("memanggil useQuery dengan queryKey, queryFn, dan keepPreviousData", () => {
    const mockUseQuery = vi.mocked(useQuery)
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isSuccess: false,
      isError: false,
    } as unknown as ReturnType<typeof useQuery>)

    const params = { page: 1, pageSize: 20, search: "Alice", sortOrder: "asc" as const }
    useEmployees(params)

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: employeeKeys.list(params),
        placeholderData: keepPreviousData,
      }),
    )

    // Test queryFn
    const queryOptions = mockUseQuery.mock.calls[0][0] as {
      queryFn?: (...args: unknown[]) => unknown
    }
    const getEmployeesSpy = vi.spyOn(apiModule, "getEmployees").mockResolvedValue({
      data: [],
      meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
    })

    if (queryOptions.queryFn) {
      queryOptions.queryFn()
    }
    expect(getEmployeesSpy).toHaveBeenCalledWith(params)
  })

  it("meneruskan options tambahan ke useQuery", () => {
    const mockUseQuery = vi.mocked(useQuery)
    mockUseQuery.mockReturnValue({
      data: undefined,
    } as unknown as ReturnType<typeof useQuery>)

    const params = { page: 2, pageSize: 10, sortOrder: "asc" as const }
    useEmployees(params, { enabled: false, staleTime: 5000 })

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: employeeKeys.list(params),
        enabled: false,
        staleTime: 5000,
        placeholderData: keepPreviousData,
      }),
    )
  })
})
