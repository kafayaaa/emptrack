import { describe, it, expect, vi, beforeEach } from "vitest"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useInfiniteEmployees } from "./use-infinite-employees"
import * as apiModule from "../api/employees.api"
import { employeeKeys } from "../api/employees.api"

import type { EmployeeListResponse } from "../schema/employee.schema"

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>()
  return {
    ...actual,
    useInfiniteQuery: vi.fn(),
  }
})

describe("useInfiniteEmployees", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("memanggil useInfiniteQuery dengan initialPageParam: 1 dan queryKey infiniteList", () => {
    const mockUseInfiniteQuery = vi.mocked(useInfiniteQuery)
    mockUseInfiniteQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
    } as unknown as ReturnType<typeof useInfiniteQuery>)

    const params = { pageSize: 20, search: "Budi", sortOrder: "asc" as const }
    useInfiniteEmployees(params)

    expect(mockUseInfiniteQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: employeeKeys.infiniteList(params),
        initialPageParam: 1,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
      }),
    )
  })

  it("queryFn memanggil getEmployees dengan parameter yang diberikan beserta pageParam", () => {
    const mockUseInfiniteQuery = vi.mocked(useInfiniteQuery)
    mockUseInfiniteQuery.mockReturnValue({} as unknown as ReturnType<typeof useInfiniteQuery>)

    const params = { pageSize: 25, department: "Engineering" }
    useInfiniteEmployees(params)

    const queryOptions = mockUseInfiniteQuery.mock.calls[0][0] as {
      queryFn?: (context: { pageParam: number; signal?: AbortSignal }) => unknown
    }

    const getEmployeesSpy = vi.spyOn(apiModule, "getEmployees").mockResolvedValue({
      data: [],
      meta: { page: 3, pageSize: 25, total: 100, totalPages: 4 },
    })

    const controller = new AbortController()
    if (queryOptions.queryFn) {
      queryOptions.queryFn({ pageParam: 3, signal: controller.signal })
    }

    expect(getEmployeesSpy).toHaveBeenCalledWith(
      {
        pageSize: 25,
        department: "Engineering",
        page: 3,
      },
      { signal: controller.signal },
    )
  })

  it("getNextPageParam mengembalikan page berikutnya jika belum mencapai totalPages", () => {
    const mockUseInfiniteQuery = vi.mocked(useInfiniteQuery)
    mockUseInfiniteQuery.mockReturnValue({} as unknown as ReturnType<typeof useInfiniteQuery>)

    useInfiniteEmployees()

    const rawOptions = mockUseInfiniteQuery.mock.calls[0][0] as unknown as {
      getNextPageParam?: (
        lastPage: EmployeeListResponse,
        allPages: EmployeeListResponse[],
        lastPageParam: number,
      ) => number | undefined
    }

    expect(rawOptions.getNextPageParam).toBeDefined()

    // Kasus masih ada halaman berikutnya (page 1 dari 5)
    const nextPage = rawOptions.getNextPageParam!(
      {
        data: [],
        meta: { page: 1, pageSize: 20, total: 100, totalPages: 5 },
      },
      [],
      1,
    )
    expect(nextPage).toBe(2)

    // Kasus sudah berada di halaman terakhir (page 5 dari 5)
    const endPage = rawOptions.getNextPageParam!(
      {
        data: [],
        meta: { page: 5, pageSize: 20, total: 100, totalPages: 5 },
      },
      [],
      5,
    )
    expect(endPage).toBeUndefined()
  })

  it("meneruskan options tambahan ke useInfiniteQuery", () => {
    const mockUseInfiniteQuery = vi.mocked(useInfiniteQuery)
    mockUseInfiniteQuery.mockReturnValue({} as unknown as ReturnType<typeof useInfiniteQuery>)

    useInfiniteEmployees({ pageSize: 10 }, { enabled: false, staleTime: 3000 })

    expect(mockUseInfiniteQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
        staleTime: 3000,
      }),
    )
  })
})
