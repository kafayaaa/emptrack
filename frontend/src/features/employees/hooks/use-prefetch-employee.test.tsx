import { describe, it, expect, vi, beforeEach } from "vitest"
import * as React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { useQueryClient } from "@tanstack/react-query"
import { usePrefetchEmployee } from "./use-prefetch-employee"
import { EMPLOYEE_DETAIL_CACHE_CONFIG } from "./use-employee"
import * as apiModule from "../api/employees.api"
import { employeeKeys } from "../api/employees.api"

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>()
  return {
    ...actual,
    useQueryClient: vi.fn(),
  }
})

describe("usePrefetchEmployee", () => {
  const mockPrefetchQuery = vi.fn()
  let currentResult: ReturnType<typeof usePrefetchEmployee> | null = null

  function TestHookComponent() {
    currentResult = usePrefetchEmployee()
    return <div data-testid="test-hook" />
  }

  function renderHook(): ReturnType<typeof usePrefetchEmployee> {
    currentResult = null
    renderToStaticMarkup(<TestHookComponent />)
    if (!currentResult) {
      throw new Error("Failed to render TestHookComponent")
    }
    return currentResult
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useQueryClient).mockReturnValue({
      prefetchQuery: mockPrefetchQuery,
    } as unknown as ReturnType<typeof useQueryClient>)
  })

  it("memanggil queryClient.prefetchQuery dengan queryKey, queryFn, dan staleTime yang tepat untuk ID valid", async () => {
    const { prefetchEmployee } = renderHook()

    prefetchEmployee("123")

    expect(mockPrefetchQuery).toHaveBeenCalledTimes(1)
    expect(mockPrefetchQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: employeeKeys.detail("123"),
        staleTime: EMPLOYEE_DETAIL_CACHE_CONFIG.STALE_TIME,
      }),
    )

    // Test queryFn execution
    const prefetchOptions = mockPrefetchQuery.mock.calls[0][0] as {
      queryFn?: (...args: unknown[]) => unknown
    }
    const sampleEmployee = {
      id: "123",
      employeeNumber: "EMP-00123",
      fullName: "Jane Doe",
      email: "jane@example.com",
      phone: "+62 812 0000",
      department: "Engineering",
      position: "Senior Engineer",
      status: "active" as const,
      hireDate: "2023-01-01",
      isManager: false,
      managerId: null,
      projectId: "proj-1",
    }
    const getEmployeeByIdSpy = vi
      .spyOn(apiModule, "getEmployeeById")
      .mockResolvedValue(sampleEmployee)

    expect(prefetchOptions.queryFn).toBeDefined()
    if (prefetchOptions.queryFn) {
      await prefetchOptions.queryFn()
    }
    expect(getEmployeeByIdSpy).toHaveBeenCalledWith("123")
  })

  it("melakukan normalisasi (trim) pada ID sebelum melakukan prefetch", () => {
    const { prefetchEmployee } = renderHook()

    prefetchEmployee("   456   ")

    expect(mockPrefetchQuery).toHaveBeenCalledTimes(1)
    expect(mockPrefetchQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: employeeKeys.detail("456"),
        staleTime: EMPLOYEE_DETAIL_CACHE_CONFIG.STALE_TIME,
      }),
    )
  })

  it("mengabaikan pemanggilan prefetch jika ID bernilai kosong, hanya whitespace, null, atau undefined", () => {
    const { prefetchEmployee } = renderHook()

    prefetchEmployee("")
    prefetchEmployee("   ")
    prefetchEmployee(null)
    prefetchEmployee(undefined)

    expect(mockPrefetchQuery).not.toHaveBeenCalled()
  })
})
