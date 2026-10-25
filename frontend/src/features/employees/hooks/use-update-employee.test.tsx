import { describe, it, expect, vi, beforeEach } from "vitest"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useUpdateEmployee } from "./use-update-employee"
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

describe("useUpdateEmployee", () => {
  const mockInvalidateQueries = vi.fn().mockResolvedValue(undefined)
  const mockSetQueryData = vi.fn()
  const mockMutate = vi.fn()
  const mockMutateAsync = vi.fn()

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

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useQueryClient).mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
      setQueryData: mockSetQueryData,
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
    useUpdateEmployee("emp-42")

    expect(useMutation).toHaveBeenCalledWith(
      expect.objectContaining({
        mutationFn: expect.any(Function),
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }),
    )
  })

  it("memanggil updateEmployee API di dalam mutationFn dengan ID yang sesuai", async () => {
    const updateEmployeeSpy = vi
      .spyOn(apiModule, "updateEmployee")
      .mockResolvedValue(dummyUpdatedEmployee)

    useUpdateEmployee("emp-42")

    const mutationConfig = vi.mocked(useMutation).mock.calls[0][0] as {
      mutationFn: (values: unknown) => Promise<Employee>
    }

    const payload = {
      employeeNumber: "EMP-00042",
      fullName: "Siti Rahma Diperbarui",
      email: "siti.rahma.new@perusahaan.com",
      phone: "+62 811-2233-4455",
      department: "Engineering",
      position: "Frontend Developer",
      status: "active" as const,
      hireDate: "2023-05-10",
      isManager: true,
      managerId: null,
      projectId: "5",
    }

    const result = await mutationConfig.mutationFn(payload)
    expect(updateEmployeeSpy).toHaveBeenCalledWith("emp-42", payload)
    expect(result).toEqual(dummyUpdatedEmployee)
  })

  it("mengisi cache detail, menginvalidasi query lists, dan memicu toast sukses pada onSuccess", async () => {
    const onSuccessCallback = vi.fn()
    useUpdateEmployee("emp-42", { onSuccess: onSuccessCallback })

    const mutationConfig = vi.mocked(useMutation).mock.calls[0][0] as {
      onSuccess: (data: Employee) => Promise<void>
    }

    await mutationConfig.onSuccess(dummyUpdatedEmployee)

    // Cache detail update instan
    expect(mockSetQueryData).toHaveBeenCalledWith(
      employeeKeys.detail("emp-42"),
      dummyUpdatedEmployee,
    )

    // Invalidate list queries
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: employeeKeys.lists(),
    })
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: employeeKeys.infiniteLists(),
    })

    // Toast feedback
    expect(toast.success).toHaveBeenCalledWith(
      "Data Karyawan Berhasil Diperbarui",
      expect.objectContaining({
        description: expect.stringContaining("Siti Rahma Diperbarui"),
      }),
    )

    expect(onSuccessCallback).toHaveBeenCalledWith(dummyUpdatedEmployee)
  })

  it("memicu toast error dan memanggil onError callback pada onError", () => {
    const onErrorCallback = vi.fn()
    useUpdateEmployee("emp-42", { onError: onErrorCallback })

    const mutationConfig = vi.mocked(useMutation).mock.calls[0][0] as {
      onError: (error: Error) => void
    }

    const testError = new Error("Gagal menyimpan update")
    mutationConfig.onError(testError)

    expect(toast.error).toHaveBeenCalledWith(
      "Gagal Memperbarui Data Karyawan",
      expect.objectContaining({
        description: "Gagal menyimpan update",
      }),
    )
    expect(onErrorCallback).toHaveBeenCalledWith(testError)
  })
})
