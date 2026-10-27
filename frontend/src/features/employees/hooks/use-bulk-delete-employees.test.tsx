import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  useMutation,
  useQueryClient,
  type InfiniteData,
  type QueryKey,
} from "@tanstack/react-query"
import { toast } from "sonner"
import {
  useBulkDeleteEmployees,
  type BulkDeleteMutationContext,
  type BulkDeleteResult,
} from "./use-bulk-delete-employees"
import * as apiModule from "../api/employees.api"
import { employeeKeys } from "../api/employees.api"
import type { EmployeeListResponse } from "../schema/employee.schema"
import type { Employee } from "../types"

interface TestMutationConfig {
  mutationFn: (ids: string[]) => Promise<BulkDeleteResult>
  onMutate: (ids: string[]) => Promise<BulkDeleteMutationContext>
  onSuccess: (data: BulkDeleteResult, ids: string[], context?: BulkDeleteMutationContext) => void
  onError: (error: Error, ids: string[], context?: BulkDeleteMutationContext) => void
  onSettled: (
    data: BulkDeleteResult | undefined,
    error: Error | null,
    ids: string[],
    context?: BulkDeleteMutationContext,
  ) => Promise<void> | void
}

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>()
  return {
    ...actual,
    useState: vi.fn((init) => [typeof init === "function" ? init() : init, vi.fn()]),
    useCallback: vi.fn((fn) => fn),
  }
})

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>()
  return {
    ...actual,
    useMutation: vi.fn(),
    useQueryClient: vi.fn(),
  }
})

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
  },
}))

describe("useBulkDeleteEmployees (EMPTRACK-78)", () => {
  const mockCancelQueries = vi.fn().mockResolvedValue(undefined)
  const mockInvalidateQueries = vi.fn().mockResolvedValue(undefined)
  const mockRemoveQueries = vi.fn()
  const mockGetQueriesData = vi.fn()
  const mockSetQueryData = vi.fn()
  const mockSetQueriesData = vi.fn()
  const mockMutate = vi.fn()
  const mockMutateAsync = vi.fn()

  const dummyEmployee1: Employee = {
    id: "emp-1",
    employeeNumber: "EMP-001",
    fullName: "Budi Santoso",
    email: "budi@test.com",
    phone: "+62 812-1111",
    department: "Engineering",
    position: "Staff",
    status: "active",
    hireDate: "2023-01-15",
    isManager: false,
    managerId: null,
    projectId: "1",
  }

  const dummyEmployee2: Employee = {
    id: "emp-2",
    employeeNumber: "EMP-002",
    fullName: "Siti Rahma",
    email: "siti@test.com",
    phone: "+62 812-2222",
    department: "Product",
    position: "Manager",
    status: "active",
    hireDate: "2022-03-10",
    isManager: true,
    managerId: null,
    projectId: "1",
  }

  const dummyEmployee3: Employee = {
    id: "emp-3",
    employeeNumber: "EMP-003",
    fullName: "Doni Pratama",
    email: "doni@test.com",
    phone: "+62 812-3333",
    department: "Design",
    position: "Staff",
    status: "active",
    hireDate: "2024-05-01",
    isManager: false,
    managerId: null,
    projectId: "1",
  }

  const dummyListResponse: EmployeeListResponse = {
    data: [dummyEmployee1, dummyEmployee2, dummyEmployee3],
    meta: {
      page: 1,
      pageSize: 10,
      total: 3,
      totalPages: 1,
    },
  }

  const dummyInfiniteListResponse: InfiniteData<EmployeeListResponse> = {
    pageParams: [1],
    pages: [
      {
        data: [dummyEmployee1, dummyEmployee2, dummyEmployee3],
        meta: {
          page: 1,
          pageSize: 10,
          total: 3,
          totalPages: 1,
        },
      },
    ],
  }

  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useQueryClient).mockReturnValue({
      cancelQueries: mockCancelQueries,
      invalidateQueries: mockInvalidateQueries,
      removeQueries: mockRemoveQueries,
      getQueriesData: mockGetQueriesData,
      setQueryData: mockSetQueryData,
      setQueriesData: mockSetQueriesData,
    } as unknown as ReturnType<typeof useQueryClient>)

    vi.mocked(useMutation).mockReturnValue({
      mutate: mockMutate,
      mutateAsync: mockMutateAsync,
      isPending: false,
      isSuccess: false,
      isError: false,
      error: null,
      data: undefined,
      reset: vi.fn(),
    } as unknown as ReturnType<typeof useMutation>)
  })

  it("initializes mutation and returns progress state", () => {
    const hook = useBulkDeleteEmployees()

    expect(useMutation).toHaveBeenCalledTimes(1)
    expect(hook.progress).toEqual({ current: 0, total: 0, percentage: 0 })
    expect(typeof hook.resetProgress).toBe("function")
  })

  it("mutationFn executes deletion with progress tracking", async () => {
    const deleteSpy = vi
      .spyOn(apiModule, "deleteEmployee")
      .mockResolvedValue({ success: true, message: "Deleted" })

    useBulkDeleteEmployees()
    const mutationConfig = vi.mocked(useMutation).mock.calls[0][0] as unknown as TestMutationConfig

    const result = await mutationConfig.mutationFn(["emp-1", "emp-2"])

    expect(deleteSpy).toHaveBeenCalledWith("emp-1")
    expect(deleteSpy).toHaveBeenCalledWith("emp-2")
    expect(result).toEqual({
      successfulIds: ["emp-1", "emp-2"],
      failedIds: [],
      total: 2,
    })

    deleteSpy.mockRestore()
  })

  it("mutationFn tracks failed IDs and handles partial failure", async () => {
    const deleteSpy = vi
      .spyOn(apiModule, "deleteEmployee")
      .mockImplementation(async (id: string) => {
        if (id === "emp-2") throw new Error("Server error")
        return { success: true, message: "Deleted" }
      })

    useBulkDeleteEmployees()
    const mutationConfig = vi.mocked(useMutation).mock.calls[0][0] as unknown as TestMutationConfig

    const result = await mutationConfig.mutationFn(["emp-1", "emp-2"])

    expect(result.successfulIds).toEqual(["emp-1"])
    expect(result.failedIds).toEqual(["emp-2"])
    expect(result.total).toBe(2)

    deleteSpy.mockRestore()
  })

  it("mutationFn throws if all items fail", async () => {
    const deleteSpy = vi
      .spyOn(apiModule, "deleteEmployee")
      .mockRejectedValue(new Error("Network failed"))

    useBulkDeleteEmployees()
    const mutationConfig = vi.mocked(useMutation).mock.calls[0][0] as unknown as TestMutationConfig

    await expect(mutationConfig.mutationFn(["emp-1", "emp-2"])).rejects.toThrow(
      "Semua proses penghapusan karyawan terpilih mengalami kegagalan.",
    )

    deleteSpy.mockRestore()
  })

  it("onMutate optimistically removes deleted IDs and snapshots cache", async () => {
    mockGetQueriesData.mockImplementation(({ queryKey }: { queryKey: QueryKey }) => {
      if (queryKey[0] === "employees" && queryKey[1] === "list") {
        return [[queryKey, dummyListResponse]]
      }
      if (queryKey[0] === "employees" && queryKey[1] === "infinite-list") {
        return [[queryKey, dummyInfiniteListResponse]]
      }
      return []
    })

    useBulkDeleteEmployees()
    const mutationConfig = vi.mocked(useMutation).mock.calls[0][0] as unknown as TestMutationConfig

    const context = (await mutationConfig.onMutate(["emp-1", "emp-2"])) as
      BulkDeleteMutationContext | undefined

    expect(mockCancelQueries).toHaveBeenCalledWith({
      queryKey: employeeKeys.lists(),
    })
    expect(mockCancelQueries).toHaveBeenCalledWith({
      queryKey: employeeKeys.infiniteLists(),
    })
    expect(mockCancelQueries).toHaveBeenCalledWith({
      queryKey: employeeKeys.detail("emp-1"),
    })
    expect(mockCancelQueries).toHaveBeenCalledWith({
      queryKey: employeeKeys.detail("emp-2"),
    })

    expect(context?.previousLists).toBeDefined()
    expect(context?.previousInfiniteLists).toBeDefined()

    // Test optimistic updater for lists
    const setQueriesDataCalls = mockSetQueriesData.mock.calls
    const listUpdater = setQueriesDataCalls.find((c) => c[0]?.queryKey?.[1] === "list")?.[1]
    expect(listUpdater).toBeDefined()

    const updatedList = listUpdater(dummyListResponse)
    expect(updatedList.data).toHaveLength(1)
    expect(updatedList.data[0].id).toBe("emp-3")
    expect(updatedList.meta.total).toBe(1)

    // Test optimistic updater for infinite lists
    const infiniteUpdater = setQueriesDataCalls.find(
      (c) => c[0]?.queryKey?.[1] === "infinite-list",
    )?.[1]
    expect(infiniteUpdater).toBeDefined()

    const updatedInfinite = infiniteUpdater(dummyInfiniteListResponse)
    expect(updatedInfinite.pages[0].data).toHaveLength(1)
    expect(updatedInfinite.pages[0].data[0].id).toBe("emp-3")
    expect(updatedInfinite.pages[0].meta.total).toBe(1)
  })

  it("onSuccess shows toast with count and calls options.onSuccess", () => {
    const onSuccessOption = vi.fn()
    useBulkDeleteEmployees({ onSuccess: onSuccessOption })
    const mutationConfig = vi.mocked(useMutation).mock.calls[0][0] as unknown as TestMutationConfig

    const result = {
      successfulIds: ["emp-1", "emp-2"],
      failedIds: [],
      total: 2,
    }

    mutationConfig.onSuccess(result, ["emp-1", "emp-2"], undefined)

    expect(toast.success).toHaveBeenCalledWith(
      "Karyawan Berhasil Dihapus",
      expect.objectContaining({
        description: expect.stringContaining("2 karyawan terpilih"),
      }),
    )
    expect(onSuccessOption).toHaveBeenCalledWith(result)
  })

  it("onSuccess shows warning toast for partial failure", () => {
    useBulkDeleteEmployees()
    const mutationConfig = vi.mocked(useMutation).mock.calls[0][0] as unknown as TestMutationConfig

    const result = {
      successfulIds: ["emp-1"],
      failedIds: ["emp-2"],
      total: 2,
    }

    mutationConfig.onSuccess(result, ["emp-1", "emp-2"], undefined)

    expect(toast.warning).toHaveBeenCalledWith(
      "Sebagian Karyawan Gagal Dihapus",
      expect.objectContaining({
        description: expect.stringContaining("1 berhasil dihapus, 1 gagal"),
      }),
    )
  })

  it("onError restores previous cache on failure and triggers toast.error", () => {
    const onErrorOption = vi.fn()
    useBulkDeleteEmployees({ onError: onErrorOption })
    const mutationConfig = vi.mocked(useMutation).mock.calls[0][0] as unknown as TestMutationConfig

    const listQueryKey = employeeKeys.list({ page: 1 })
    const context: BulkDeleteMutationContext = {
      previousLists: [[listQueryKey, dummyListResponse]],
      previousInfiniteLists: [],
    }

    const testError = new Error("Failed to delete")
    mutationConfig.onError(testError, ["emp-1"], context)

    expect(mockSetQueryData).toHaveBeenCalledWith(listQueryKey, dummyListResponse)
    expect(toast.error).toHaveBeenCalledWith(
      "Gagal Menghapus Karyawan",
      expect.objectContaining({
        description: "Failed to delete",
      }),
    )
    expect(onErrorOption).toHaveBeenCalledWith(testError)
  })

  it("onSettled invalidates lists and infiniteLists queries", async () => {
    const onSettledOption = vi.fn()
    useBulkDeleteEmployees({ onSettled: onSettledOption })
    const mutationConfig = vi.mocked(useMutation).mock.calls[0][0] as unknown as TestMutationConfig

    await mutationConfig.onSettled(undefined, null, ["emp-1"], undefined)

    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: employeeKeys.lists(),
    })
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: employeeKeys.infiniteLists(),
    })
    expect(onSettledOption).toHaveBeenCalled()
  })
})
