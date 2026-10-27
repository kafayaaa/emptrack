import { describe, it, expect, vi, beforeEach } from "vitest"
import { useQuery } from "@tanstack/react-query"
import { useEmployees } from "./use-employees"
import * as apiModule from "../api/employees.api"
import type { EmployeeListResponse } from "../schema/employee.schema"

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>()
  return {
    ...actual,
    useQuery: vi.fn(),
  }
})

describe("useEmployees - Race Condition & AbortController Handling (EMPTRACK-80)", () => {
  const mockUseQuery = vi.mocked(useQuery)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("meneruskan AbortSignal dari TanStack Query context ke getEmployees", async () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isSuccess: false,
      isError: false,
    } as unknown as ReturnType<typeof useQuery>)

    const params = { page: 2, pageSize: 20 }
    useEmployees(params)

    const queryOptions = mockUseQuery.mock.calls[0][0] as {
      queryFn?: (context: { signal?: AbortSignal }) => Promise<EmployeeListResponse>
    }

    const mockResponse: EmployeeListResponse = {
      data: [],
      meta: { page: 2, pageSize: 20, total: 0, totalPages: 0 },
    }
    const getEmployeesSpy = vi.spyOn(apiModule, "getEmployees").mockResolvedValue(mockResponse)

    const controller = new AbortController()
    expect(queryOptions.queryFn).toBeDefined()

    if (queryOptions.queryFn) {
      await queryOptions.queryFn({ signal: controller.signal })
    }

    expect(getEmployeesSpy).toHaveBeenCalledWith(params, { signal: controller.signal })
  })

  it("mencegah race condition ketika user berpindah halaman berkali-kali secara cepat", async () => {
    mockUseQuery.mockReturnValue({} as unknown as ReturnType<typeof useQuery>)

    // 1. User berada di Page 1
    useEmployees({ page: 1 })
    const page1Options = mockUseQuery.mock.calls[0][0] as unknown as {
      queryFn: (context: { signal?: AbortSignal }) => Promise<EmployeeListResponse>
    }

    // 2. User cepat mengklik Next Page ke Page 2
    useEmployees({ page: 2 })
    const page2Options = mockUseQuery.mock.calls[1][0] as unknown as {
      queryFn: (context: { signal?: AbortSignal }) => Promise<EmployeeListResponse>
    }

    // AbortController untuk page 1 dibatalkan oleh TanStack Query karena query key berubah
    const page1Controller = new AbortController()
    const page2Controller = new AbortController()

    let page1Completed = false
    let page2Completed = false

    vi.spyOn(apiModule, "getEmployees").mockImplementation(async (params, options) => {
      if (params?.page === 1) {
        // Simulasi request lambat
        return new Promise<EmployeeListResponse>((resolve, reject) => {
          options?.signal?.addEventListener("abort", () => {
            const err = new Error("The operation was aborted")
            err.name = "AbortError"
            reject(err)
          })
          setTimeout(() => {
            page1Completed = true
            resolve({
              data: [],
              meta: { page: 1, pageSize: 20, total: 10, totalPages: 1 },
            })
          }, 50)
        })
      }

      if (params?.page === 2) {
        page2Completed = true
        return {
          data: [],
          meta: { page: 2, pageSize: 20, total: 10, totalPages: 1 },
        }
      }

      return {
        data: [],
        meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
      }
    })

    // Mulai request page 1
    const page1Promise = page1Options.queryFn({ signal: page1Controller.signal })

    // User beralih ke page 2 -> signal page 1 di-abort
    page1Controller.abort()

    // Mulai request page 2
    const page2Result = await page2Options.queryFn({ signal: page2Controller.signal })

    // Pastikan request page 1 dibatalkan dan melempar AbortError
    await expect(page1Promise).rejects.toThrow("The operation was aborted")
    expect(page1Completed).toBe(false)

    // Request page 2 berhasil diproses
    expect(page2Completed).toBe(true)
    expect(page2Result.meta.page).toBe(2)
  })
})
