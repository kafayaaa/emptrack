import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  useMutation,
  useQueryClient,
  type InfiniteData,
  type QueryKey,
} from "@tanstack/react-query"
import { toast } from "sonner"
import { useDeleteEmployee, type DeleteEmployeeMutationContext } from "./use-delete-employee"
import * as apiModule from "../api/employees.api"
import { employeeKeys } from "../api/employees.api"
import type { Employee } from "../types"
import type { EmployeeListResponse } from "../schema/employee.schema"

const mockPush = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

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
    error: vi.fn(),
  },
}))

describe("useDeleteEmployee (Optimistic Deletion & Invalidation - EMPTRACK-75)", () => {
  const mockCancelQueries = vi.fn().mockResolvedValue(undefined)
  const mockInvalidateQueries = vi.fn().mockResolvedValue(undefined)
  const mockRemoveQueries = vi.fn()
  const mockGetQueryData = vi.fn()
  const mockGetQueriesData = vi.fn()
  const mockSetQueryData = vi.fn()
  const mockSetQueriesData = vi.fn()
  const mockMutate = vi.fn()
  const mockMutateAsync = vi.fn()

  const dummyResponse = { success: true, message: "Karyawan berhasil dihapus." }

  const dummyTargetEmployee: Employee = {
    id: "emp-101",
    employeeNumber: "EMP-00101",
    fullName: "Budi Santoso",
    email: "budi.santoso@perusahaan.com",
    phone: "+62 812-3456-7890",
    department: "Engineering",
    position: "Staff",
    status: "active",
    hireDate: "2023-01-15",
    isManager: false,
    managerId: null,
    projectId: "1",
  }

  const dummyOtherEmployee: Employee = {
    id: "emp-102",
    employeeNumber: "EMP-00102",
    fullName: "Citra Lestari",
    email: "citra.lestari@perusahaan.com",
    phone: "+62 812-9876-5432",
    department: "Marketing",
    position: "Senior Specialist",
    status: "active",
    hireDate: "2022-03-20",
    isManager: false,
    managerId: null,
    projectId: "2",
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useQueryClient).mockReturnValue({
      cancelQueries: mockCancelQueries,
      invalidateQueries: mockInvalidateQueries,
      removeQueries: mockRemoveQueries,
      getQueryData: mockGetQueryData,
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
    } as unknown as ReturnType<typeof useMutation>)
  })

  it("menginisialisasi useMutation dengan callback lengkap", () => {
    useDeleteEmployee()

    expect(useMutation).toHaveBeenCalledWith(
      expect.objectContaining({
        mutationFn: expect.any(Function),
        onMutate: expect.any(Function),
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
        onSettled: expect.any(Function),
      }),
    )
  })

  it("memanggil deleteEmployee API di dalam mutationFn", async () => {
    const deleteEmployeeSpy = vi.spyOn(apiModule, "deleteEmployee").mockResolvedValue(dummyResponse)

    useDeleteEmployee()

    const mutationConfig = vi.mocked(useMutation).mock.calls[0][0] as {
      mutationFn: (id: string) => Promise<typeof dummyResponse>
    }

    const result = await mutationConfig.mutationFn("emp-101")
    expect(deleteEmployeeSpy).toHaveBeenCalledWith("emp-101")
    expect(result).toEqual(dummyResponse)
  })

  describe("onMutate (Optimistic Deletion)", () => {
    it("melakukan cancel queries, snapshot cache, dan optimistic deletion pada cache list & detail", async () => {
      const initialLists: Array<[QueryKey, EmployeeListResponse]> = [
        [
          employeeKeys.list({ page: 1 }),
          {
            data: [dummyTargetEmployee, dummyOtherEmployee],
            meta: { page: 1, pageSize: 10, total: 2, totalPages: 1 },
          },
        ],
      ]

      const initialInfiniteLists: Array<[QueryKey, InfiniteData<EmployeeListResponse>]> = [
        [
          employeeKeys.infiniteList(),
          {
            pages: [
              {
                data: [dummyTargetEmployee, dummyOtherEmployee],
                meta: { page: 1, pageSize: 10, total: 2, totalPages: 1 },
              },
            ],
            pageParams: [1],
          },
        ],
      ]

      mockGetQueryData.mockImplementation((key: { queryKey?: unknown[] } | unknown[]) => {
        const k = Array.isArray(key) ? key : (key as { queryKey: unknown[] }).queryKey
        if (JSON.stringify(k) === JSON.stringify(employeeKeys.detail("emp-101"))) {
          return dummyTargetEmployee
        }
        return undefined
      })

      mockGetQueriesData.mockImplementation((filters: { queryKey: unknown[] }) => {
        if (JSON.stringify(filters.queryKey) === JSON.stringify(employeeKeys.lists())) {
          return initialLists
        }
        if (JSON.stringify(filters.queryKey) === JSON.stringify(employeeKeys.infiniteLists())) {
          return initialInfiniteLists
        }
        return []
      })

      useDeleteEmployee()

      const mutationConfig = vi.mocked(useMutation).mock.calls[0][0] as {
        onMutate: (id: string) => Promise<DeleteEmployeeMutationContext>
      }

      const context = await mutationConfig.onMutate("emp-101")

      // 1. Memastikan cancelQueries dipanggil
      expect(mockCancelQueries).toHaveBeenCalledWith({
        queryKey: employeeKeys.detail("emp-101"),
      })
      expect(mockCancelQueries).toHaveBeenCalledWith({
        queryKey: employeeKeys.lists(),
      })
      expect(mockCancelQueries).toHaveBeenCalledWith({
        queryKey: employeeKeys.infiniteLists(),
      })

      // 2. Memastikan snapshot tersimpan di context
      expect(context.previousEmployee).toEqual(dummyTargetEmployee)
      expect(context.previousLists).toEqual(initialLists)
      expect(context.previousInfiniteLists).toEqual(initialInfiniteLists)

      // 3. Memastikan detail dihapus dari cache
      expect(mockRemoveQueries).toHaveBeenCalledWith({
        queryKey: employeeKeys.detail("emp-101"),
      })

      // 4. Memverifikasi updater optimistic deletion pada paginated lists
      expect(mockSetQueriesData).toHaveBeenCalledWith(
        { queryKey: employeeKeys.lists() },
        expect.any(Function),
      )
      const listUpdaterCall = mockSetQueriesData.mock.calls.find(
        (call) => JSON.stringify(call[0]) === JSON.stringify({ queryKey: employeeKeys.lists() }),
      )
      const listUpdater = listUpdaterCall?.[1] as (
        old?: EmployeeListResponse,
      ) => EmployeeListResponse
      const updatedList = listUpdater(initialLists[0][1])

      expect(updatedList.data).toHaveLength(1)
      expect(updatedList.data[0].id).toBe("emp-102")
      expect(updatedList.meta.total).toBe(1)
      expect(updatedList.meta.totalPages).toBe(1)

      // 5. Memverifikasi updater optimistic deletion pada infinite lists
      expect(mockSetQueriesData).toHaveBeenCalledWith(
        { queryKey: employeeKeys.infiniteLists() },
        expect.any(Function),
      )
      const infiniteUpdaterCall = mockSetQueriesData.mock.calls.find(
        (call) =>
          JSON.stringify(call[0]) === JSON.stringify({ queryKey: employeeKeys.infiniteLists() }),
      )
      const infiniteUpdater = infiniteUpdaterCall?.[1] as (
        old?: InfiniteData<EmployeeListResponse>,
      ) => InfiniteData<EmployeeListResponse>
      const updatedInfinite = infiniteUpdater(initialInfiniteLists[0][1])

      expect(updatedInfinite.pages[0].data).toHaveLength(1)
      expect(updatedInfinite.pages[0].data[0].id).toBe("emp-102")
      expect(updatedInfinite.pages[0].meta.total).toBe(1)
    })

    it("tidak mengubah cache lists jika karyawan yang dihapus tidak ditemukan di dalam cache data", async () => {
      useDeleteEmployee()

      const mutationConfig = vi.mocked(useMutation).mock.calls[0][0] as {
        onMutate: (id: string) => Promise<DeleteEmployeeMutationContext>
      }

      await mutationConfig.onMutate("emp-999")

      const listUpdaterCall = mockSetQueriesData.mock.calls.find(
        (call) => JSON.stringify(call[0]) === JSON.stringify({ queryKey: employeeKeys.lists() }),
      )
      const listUpdater = listUpdaterCall?.[1] as (
        old?: EmployeeListResponse,
      ) => EmployeeListResponse
      const originalList: EmployeeListResponse = {
        data: [dummyOtherEmployee],
        meta: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
      }
      expect(listUpdater(originalList)).toBe(originalList)
      expect(listUpdater(undefined)).toBeUndefined()
    })
  })

  describe("onError (Rollback)", () => {
    it("melakukan rollback seluruh cache ke snapshot data dan menampilkan toast error", () => {
      const onErrorCallback = vi.fn()
      useDeleteEmployee({ onError: onErrorCallback })

      const mutationConfig = vi.mocked(useMutation).mock.calls[0][0] as {
        onError: (error: Error, id: string, context?: DeleteEmployeeMutationContext) => void
      }

      const mockContext: DeleteEmployeeMutationContext = {
        previousEmployee: dummyTargetEmployee,
        previousLists: [
          [
            employeeKeys.list({ page: 1 }),
            {
              data: [dummyTargetEmployee, dummyOtherEmployee],
              meta: { page: 1, pageSize: 10, total: 2, totalPages: 1 },
            },
          ],
        ],
        previousInfiniteLists: [
          [
            employeeKeys.infiniteList(),
            {
              pages: [
                {
                  data: [dummyTargetEmployee, dummyOtherEmployee],
                  meta: { page: 1, pageSize: 10, total: 2, totalPages: 1 },
                },
              ],
              pageParams: [1],
            },
          ],
        ],
      }

      const testError = new Error("Koneksi internet terputus")
      mutationConfig.onError(testError, "emp-101", mockContext)

      // 1. Memulihkan detail cache
      expect(mockSetQueryData).toHaveBeenCalledWith(
        employeeKeys.detail("emp-101"),
        dummyTargetEmployee,
      )

      // 2. Memulihkan paginated list cache
      expect(mockSetQueryData).toHaveBeenCalledWith(
        employeeKeys.list({ page: 1 }),
        mockContext.previousLists?.[0][1],
      )

      // 3. Memulihkan infinite list cache
      expect(mockSetQueryData).toHaveBeenCalledWith(
        employeeKeys.infiniteList(),
        mockContext.previousInfiniteLists?.[0][1],
      )

      // 4. Menampilkan pesan error toast
      expect(toast.error).toHaveBeenCalledWith(
        "Gagal Menghapus Karyawan",
        expect.objectContaining({
          description: expect.stringContaining(
            "Koneksi internet terputus. Tindakan dibatalkan dan data dipulihkan.",
          ),
        }),
      )

      expect(onErrorCallback).toHaveBeenCalledWith(testError, "emp-101", mockContext)
    })
  })

  describe("onSuccess", () => {
    it("membersihkan detail cache, menampilkan toast sukses, dan memicu redirect jika diminta", () => {
      const onSuccessCallback = vi.fn()
      useDeleteEmployee({
        employeeName: "Budi Santoso",
        redirectToIndex: true,
        onSuccess: onSuccessCallback,
      })

      const mutationConfig = vi.mocked(useMutation).mock.calls[0][0] as {
        onSuccess: (
          data: typeof dummyResponse,
          id: string,
          context?: DeleteEmployeeMutationContext,
        ) => void
      }

      mutationConfig.onSuccess(dummyResponse, "emp-101")

      expect(mockRemoveQueries).toHaveBeenCalledWith({
        queryKey: employeeKeys.detail("emp-101"),
      })

      expect(toast.success).toHaveBeenCalledWith(
        "Karyawan Berhasil Dihapus",
        expect.objectContaining({
          description: expect.stringContaining("Budi Santoso"),
        }),
      )

      expect(mockPush).toHaveBeenCalledWith("/employees")
      expect(onSuccessCallback).toHaveBeenCalledWith(dummyResponse, "emp-101", undefined)
    })
  })

  describe("onSettled (Server Synchronization & Invalidation)", () => {
    it("menginvalidasi seluruh query list (paginated & infinite) agar tersinkronisasi 100% dengan database", async () => {
      const onSettledCallback = vi.fn()
      useDeleteEmployee({ onSettled: onSettledCallback })

      const mutationConfig = vi.mocked(useMutation).mock.calls[0][0] as {
        onSettled: (
          data: typeof dummyResponse | undefined,
          error: Error | null,
          id: string,
          context?: DeleteEmployeeMutationContext,
        ) => Promise<void>
      }

      await mutationConfig.onSettled(dummyResponse, null, "emp-101")

      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: employeeKeys.lists(),
      })
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: employeeKeys.infiniteLists(),
      })

      expect(onSettledCallback).toHaveBeenCalledWith(dummyResponse, null, "emp-101", undefined)
    })
  })
})
