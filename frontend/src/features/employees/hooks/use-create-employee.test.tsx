import { describe, it, expect, vi, beforeEach } from "vitest"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useCreateEmployee } from "./use-create-employee"
import * as apiModule from "../api/employees.api"
import { employeeKeys } from "../api/employees.api"
import type { Employee } from "../types"

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

describe("useCreateEmployee", () => {
  const mockInvalidateQueries = vi.fn()
  const mockMutate = vi.fn()
  const mockMutateAsync = vi.fn()

  const dummyCreatedEmployee: Employee = {
    id: "emp-101",
    employeeNumber: "EMP-00101",
    fullName: "Dewi Lestari",
    email: "dewi.lestari@perusahaan.com",
    phone: "+62 812-9876-5432",
    department: "Engineering",
    position: "QA Engineer",
    status: "active",
    hireDate: "2024-02-01",
    isManager: false,
    managerId: null,
    projectId: "1",
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useQueryClient).mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
    } as unknown as ReturnType<typeof useQueryClient>)

    vi.mocked(useMutation).mockReturnValue({
      mutate: mockMutate,
      mutateAsync: mockMutateAsync,
      isPending: false,
      isSuccess: false,
      isError: false,
    } as unknown as ReturnType<typeof useMutation>)
  })

  it("menginisialisasi useMutation dengan benar", () => {
    useCreateEmployee()

    expect(useMutation).toHaveBeenCalledWith(
      expect.objectContaining({
        mutationFn: expect.any(Function),
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }),
    )
  })

  it("memanggil createEmployee API di dalam mutationFn", async () => {
    const createEmployeeSpy = vi
      .spyOn(apiModule, "createEmployee")
      .mockResolvedValue(dummyCreatedEmployee)

    useCreateEmployee()

    const mutationConfig = vi.mocked(useMutation).mock.calls[0][0] as {
      mutationFn: (values: unknown) => Promise<Employee>
    }

    const payload = {
      employeeNumber: "EMP-00101",
      fullName: "Dewi Lestari",
      email: "dewi.lestari@perusahaan.com",
      phone: "+62 812-9876-5432",
      department: "Engineering",
      position: "QA Engineer",
      status: "active" as const,
      hireDate: "2024-02-01",
      isManager: false,
      managerId: null,
      projectId: "1",
    }

    const result = await mutationConfig.mutationFn(payload)
    expect(createEmployeeSpy).toHaveBeenCalledWith(payload)
    expect(result).toEqual(dummyCreatedEmployee)
  })

  it("menginvalidasi cache query list dan memicu toast sukses pada onSuccess", () => {
    const onSuccessCallback = vi.fn()
    useCreateEmployee({ onSuccess: onSuccessCallback })

    const mutationConfig = vi.mocked(useMutation).mock.calls[0][0] as {
      onSuccess: (data: Employee) => void
    }

    mutationConfig.onSuccess(dummyCreatedEmployee)

    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: employeeKeys.lists(),
    })
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: employeeKeys.infiniteLists(),
    })
    expect(toast.success).toHaveBeenCalledWith(
      "Karyawan Berhasil Ditambahkan",
      expect.objectContaining({
        description: expect.stringContaining("Dewi Lestari"),
      }),
    )
    expect(onSuccessCallback).toHaveBeenCalledWith(dummyCreatedEmployee)
  })

  it("memicu toast error dan memanggil onError callback pada onError", () => {
    const onErrorCallback = vi.fn()
    useCreateEmployee({ onError: onErrorCallback })

    const mutationConfig = vi.mocked(useMutation).mock.calls[0][0] as {
      onError: (error: Error) => void
    }

    const testError = new Error("Koneksi gagal")
    mutationConfig.onError(testError)

    expect(toast.error).toHaveBeenCalledWith(
      "Gagal Menambahkan Karyawan",
      expect.objectContaining({
        description: "Koneksi gagal",
      }),
    )
    expect(onErrorCallback).toHaveBeenCalledWith(testError)
  })
})
