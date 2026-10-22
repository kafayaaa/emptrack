import { describe, it, expect, vi, beforeEach } from "vitest"
import { useQuery } from "@tanstack/react-query"
import { useEmployee, EMPLOYEE_DETAIL_CACHE_CONFIG } from "./use-employee"
import * as apiModule from "../api/employees.api"
import { employeeKeys } from "../api/employees.api"

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>()
  return {
    ...actual,
    useQuery: vi.fn(),
  }
})

describe("useEmployee", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("memanggil useQuery dengan queryKey employeeKeys.detail(id), queryFn, dan enabled: true untuk ID valid", () => {
    const mockUseQuery = vi.mocked(useQuery)
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isSuccess: false,
      isError: false,
    } as unknown as ReturnType<typeof useQuery>)

    useEmployee("123")

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: employeeKeys.detail("123"),
        enabled: true,
        staleTime: EMPLOYEE_DETAIL_CACHE_CONFIG.STALE_TIME,
        gcTime: EMPLOYEE_DETAIL_CACHE_CONFIG.GC_TIME,
      }),
    )

    // Test queryFn
    const queryOptions = mockUseQuery.mock.calls[0][0] as {
      queryFn?: (...args: unknown[]) => unknown
    }
    const sampleEmployee = {
      id: "123",
      employeeNumber: "EMP-123",
      fullName: "Test User",
      email: "test@example.com",
      phone: "123456",
      department: "Engineering",
      position: "Engineer",
      status: "active",
      hireDate: "2024-01-01",
      isManager: false,
      managerId: null,
      projectId: "1",
    }
    const getEmployeeByIdSpy = vi
      .spyOn(apiModule, "getEmployeeById")
      .mockResolvedValue(sampleEmployee)

    if (queryOptions.queryFn) {
      queryOptions.queryFn()
    }
    expect(getEmployeeByIdSpy).toHaveBeenCalledWith("123")
  })

  it("menonaktifkan query (enabled: false) jika ID kosong atau hanya whitespace", () => {
    const mockUseQuery = vi.mocked(useQuery)
    mockUseQuery.mockReturnValue({
      data: undefined,
    } as unknown as ReturnType<typeof useQuery>)

    useEmployee("")
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      }),
    )

    useEmployee("   ")
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      }),
    )
  })

  it("meneruskan options tambahan ke useQuery dan dapat meng-override konfigurasi default", () => {
    const mockUseQuery = vi.mocked(useQuery)
    mockUseQuery.mockReturnValue({
      data: undefined,
    } as unknown as ReturnType<typeof useQuery>)

    useEmployee("123", {
      staleTime: 1000,
      gcTime: 5000,
      enabled: false,
    })

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: employeeKeys.detail("123"),
        staleTime: 1000,
        gcTime: 5000,
        enabled: false,
      }),
    )
  })
})
