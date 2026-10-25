import { describe, it, expect, vi, beforeEach } from "vitest"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useUpdateEmployee } from "./use-update-employee"
import * as apiModule from "../api/employees.api"
import { employeeKeys } from "../api/employees.api"
import type { Employee } from "../types"
import type { EmployeeListResponse } from "../schema/employee.schema"
import type { EmployeeFormValues } from "../schema/employee-form.schema"

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

describe("useUpdateEmployee (Optimistic Update - EMPTRACK-68)", () => {
  const mockCancelQueries = vi.fn().mockResolvedValue(undefined)
  const mockInvalidateQueries = vi.fn().mockResolvedValue(undefined)
  const mockGetQueryData = vi.fn()
  const mockGetQueriesData = vi.fn()
  const mockSetQueryData = vi.fn()
  const mockSetQueriesData = vi.fn()
  const mockMutate = vi.fn()
  const mockMutateAsync = vi.fn()

  const dummyOldEmployee: Employee = {
    id: "emp-42",
    employeeNumber: "EMP-00042",
    fullName: "Siti Rahma Lama",
    email: "siti.rahma.old@perusahaan.com",
    phone: "+62 811-1111-2222",
    department: "Engineering",
    position: "Junior Developer",
    status: "active",
    hireDate: "2023-05-10",
    isManager: false,
    managerId: null,
    projectId: "5",
  }

  const dummyUpdatedEmployee: Employee = {
    id: "emp-42",
    employeeNumber: "EMP-00042",
    fullName: "Siti Rahma Diperbarui",
    email: "siti.rahma.new@perusahaan.com",
    phone: "+62 811-2233-4455",
    department: "Engineering",
    position: "Frontend Developer",
    status: "active",
    hireDate: "2023-05-10",
    isManager: true,
    managerId: null,
    projectId: "5",
  }

  const dummyFormValues: EmployeeFormValues = {
    employeeNumber: "EMP-00042",
    fullName: "Siti Rahma Diperbarui",
    email: "siti.rahma.new@perusahaan.com",
    phone: "+62 811-2233-4455",
    department: "Engineering",
    position: "Frontend Developer",
    status: "active",
    hireDate: "2023-05-10",
    isManager: true,
    managerId: null,
    projectId: "5",
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useQueryClient).mockReturnValue({
      cancelQueries: mockCancelQueries,
      invalidateQueries: mockInvalidateQueries,
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

  it("menginisialisasi useMutation dengan lifecycle optimistic update (onMutate, onError, onSuccess, onSettled)", () => {
    useUpdateEmployee("emp-42")

    expect(useMutation).toHaveBeenCalledWith(
      expect.objectContaining({
        mutationFn: expect.any(Function),
        onMutate: expect.any(Function),
        onError: expect.any(Function),
        onSuccess: expect.any(Function),
        onSettled: expect.any(Function),
      }),
    )
  })

  it("memanggil updateEmployee API di dalam mutationFn dengan ID yang sesuai", async () => {
    const updateEmployeeSpy = vi
      .spyOn(apiModule, "updateEmployee")
      .mockResolvedValue(dummyUpdatedEmployee)

    useUpdateEmployee("emp-42")

    const mutationConfig = vi.mocked(useMutation).mock.calls[0][0] as {
      mutationFn: (values: EmployeeFormValues) => Promise<Employee>
    }

    const result = await mutationConfig.mutationFn(dummyFormValues)
    expect(updateEmployeeSpy).toHaveBeenCalledWith("emp-42", dummyFormValues)
    expect(result).toEqual(dummyUpdatedEmployee)
  })

  describe("onMutate (Optimistic updates & Snapshots)", () => {
    it("membatalkan queries aktif, mengambil snapshot, dan mengupdate cache detail & list seketika", async () => {
      mockGetQueryData.mockReturnValue(dummyOldEmployee)
      const mockListsSnapshot = [
        [
          employeeKeys.list({ page: 1, pageSize: 20 }),
          {
            data: [dummyOldEmployee],
            meta: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
          },
        ],
      ]
      const mockInfiniteSnapshot = [
        [
          employeeKeys.infiniteList(),
          {
            pages: [
              {
                data: [dummyOldEmployee],
                meta: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
              },
            ],
            pageParams: [1],
          },
        ],
      ]

      mockGetQueriesData.mockImplementation(({ queryKey }) => {
        if (JSON.stringify(queryKey) === JSON.stringify(employeeKeys.lists())) {
          return mockListsSnapshot
        }
        if (JSON.stringify(queryKey) === JSON.stringify(employeeKeys.infiniteLists())) {
          return mockInfiniteSnapshot
        }
        return []
      })

      useUpdateEmployee("emp-42")

      const mutationConfig = vi.mocked(useMutation).mock.calls[0][0] as {
        onMutate: (values: EmployeeFormValues) => Promise<{
          previousEmployee?: Employee
          previousLists?: typeof mockListsSnapshot
          previousInfiniteLists?: typeof mockInfiniteSnapshot
        }>
      }

      const context = await mutationConfig.onMutate(dummyFormValues)

      // 1. Membatalkan query aktif
      expect(mockCancelQueries).toHaveBeenCalledWith({
        queryKey: employeeKeys.detail("emp-42"),
      })
      expect(mockCancelQueries).toHaveBeenCalledWith({
        queryKey: employeeKeys.lists(),
      })
      expect(mockCancelQueries).toHaveBeenCalledWith({
        queryKey: employeeKeys.infiniteLists(),
      })

      // 2. Snapshot data lama dikembalikan dalam context
      expect(context.previousEmployee).toEqual(dummyOldEmployee)
      expect(context.previousLists).toEqual(mockListsSnapshot)
      expect(context.previousInfiniteLists).toEqual(mockInfiniteSnapshot)

      // 3. Optimistic update detail
      expect(mockSetQueryData).toHaveBeenCalledWith(
        employeeKeys.detail("emp-42"),
        expect.objectContaining({
          id: "emp-42",
          fullName: "Siti Rahma Diperbarui",
          position: "Frontend Developer",
        }),
      )

      // 4. Optimistic update lists
      expect(mockSetQueriesData).toHaveBeenCalledWith(
        { queryKey: employeeKeys.lists() },
        expect.any(Function),
      )
      // Test updater function lists
      const listUpdaterCall = mockSetQueriesData.mock.calls.find(
        (call) => JSON.stringify(call[0]) === JSON.stringify({ queryKey: employeeKeys.lists() }),
      )
      const listUpdater = listUpdaterCall?.[1] as (
        old: EmployeeListResponse | undefined,
      ) => EmployeeListResponse
      const updatedList = listUpdater({
        data: [dummyOldEmployee, { ...dummyOldEmployee, id: "other-emp", fullName: "Budi" }],
        meta: { page: 1, pageSize: 20, total: 2, totalPages: 1 },
      })
      expect(updatedList.data[0].fullName).toBe("Siti Rahma Diperbarui")
      expect(updatedList.data[1].fullName).toBe("Budi")

      // 5. Optimistic update infinite lists
      const infiniteUpdaterCall = mockSetQueriesData.mock.calls.find(
        (call) =>
          JSON.stringify(call[0]) === JSON.stringify({ queryKey: employeeKeys.infiniteLists() }),
      )
      const infiniteUpdater = infiniteUpdaterCall?.[1] as (
        old: { pages: EmployeeListResponse[] } | undefined,
      ) => { pages: EmployeeListResponse[] }
      const updatedInfinite = infiniteUpdater({
        pages: [
          {
            data: [dummyOldEmployee],
            meta: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
          },
        ],
      })
      expect(updatedInfinite.pages[0].data[0].fullName).toBe("Siti Rahma Diperbarui")
    })
  })

  describe("onError (Rollback & Error Toast)", () => {
    it("melakukan rollback detail dan lists ke snapshot data sebelumnya jika mutasi gagal", () => {
      const onErrorCallback = vi.fn()
      useUpdateEmployee("emp-42", { onError: onErrorCallback })

      const mutationConfig = vi.mocked(useMutation).mock.calls[0][0] as {
        onError: (
          error: Error,
          values: EmployeeFormValues,
          context: {
            previousEmployee: Employee
            previousLists: Array<[readonly unknown[], unknown]>
            previousInfiniteLists: Array<[readonly unknown[], unknown]>
          },
        ) => void
      }

      const mockContext = {
        previousEmployee: dummyOldEmployee,
        previousLists: [
          [
            employeeKeys.list(),
            {
              data: [dummyOldEmployee],
              meta: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
            },
          ] as [readonly unknown[], unknown],
        ],
        previousInfiniteLists: [
          [
            employeeKeys.infiniteList(),
            {
              pages: [
                {
                  data: [dummyOldEmployee],
                  meta: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
                },
              ],
            },
          ] as [readonly unknown[], unknown],
        ],
      }

      const testError = new Error("Koneksi server terputus")
      mutationConfig.onError(testError, dummyFormValues, mockContext)

      // Rollback detail
      expect(mockSetQueryData).toHaveBeenCalledWith(employeeKeys.detail("emp-42"), dummyOldEmployee)

      // Rollback lists
      expect(mockSetQueryData).toHaveBeenCalledWith(
        mockContext.previousLists[0][0],
        mockContext.previousLists[0][1],
      )

      // Rollback infinite lists
      expect(mockSetQueryData).toHaveBeenCalledWith(
        mockContext.previousInfiniteLists[0][0],
        mockContext.previousInfiniteLists[0][1],
      )

      // Toast error dengan info pembatalan
      expect(toast.error).toHaveBeenCalledWith(
        "Gagal Memperbarui Data Karyawan",
        expect.objectContaining({
          description: expect.stringContaining("Perubahan telah dibatalkan"),
        }),
      )

      expect(onErrorCallback).toHaveBeenCalledWith(testError, mockContext)
    })
  })

  describe("onSuccess", () => {
    it("mengisi cache detail dengan data resmi dari server dan memicu toast sukses", () => {
      const onSuccessCallback = vi.fn()
      useUpdateEmployee("emp-42", { onSuccess: onSuccessCallback })

      const mutationConfig = vi.mocked(useMutation).mock.calls[0][0] as {
        onSuccess: (data: Employee) => void
      }

      mutationConfig.onSuccess(dummyUpdatedEmployee)

      expect(mockSetQueryData).toHaveBeenCalledWith(
        employeeKeys.detail("emp-42"),
        dummyUpdatedEmployee,
      )

      expect(toast.success).toHaveBeenCalledWith(
        "Data Karyawan Berhasil Diperbarui",
        expect.objectContaining({
          description: expect.stringContaining("Siti Rahma Diperbarui"),
        }),
      )

      expect(onSuccessCallback).toHaveBeenCalledWith(dummyUpdatedEmployee)
    })
  })

  describe("onSettled (Cache Synchronization)", () => {
    it("menginvalidasi query detail, lists, dan infiniteLists untuk menjamin konsistensi data dengan server", async () => {
      const onSettledCallback = vi.fn()
      useUpdateEmployee("emp-42", { onSettled: onSettledCallback })

      const mutationConfig = vi.mocked(useMutation).mock.calls[0][0] as {
        onSettled: (data: Employee | undefined, error: Error | null) => Promise<void>
      }

      await mutationConfig.onSettled(dummyUpdatedEmployee, null)

      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: employeeKeys.detail("emp-42"),
      })
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: employeeKeys.lists(),
      })
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: employeeKeys.infiniteLists(),
      })

      expect(onSettledCallback).toHaveBeenCalledWith(dummyUpdatedEmployee, null)
    })
  })
})
