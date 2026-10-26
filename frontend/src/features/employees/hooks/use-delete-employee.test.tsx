import { describe, it, expect, vi, beforeEach } from "vitest"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useDeleteEmployee } from "./use-delete-employee"
import * as apiModule from "../api/employees.api"
import { employeeKeys } from "../api/employees.api"

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

describe("useDeleteEmployee", () => {
  const mockInvalidateQueries = vi.fn().mockResolvedValue(undefined)
  const mockRemoveQueries = vi.fn()
  const mockMutate = vi.fn()
  const mockMutateAsync = vi.fn()

  const dummyResponse = { success: true, message: "Karyawan berhasil dihapus." }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useQueryClient).mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
      removeQueries: mockRemoveQueries,
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
    useDeleteEmployee()

    expect(useMutation).toHaveBeenCalledWith(
      expect.objectContaining({
        mutationFn: expect.any(Function),
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
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

  it("menghapus cache detail, menginvalidasi query list, dan memicu toast sukses pada onSuccess", async () => {
    const onSuccessCallback = vi.fn()
    useDeleteEmployee({ employeeName: "Budi Santoso", onSuccess: onSuccessCallback })

    const mutationConfig = vi.mocked(useMutation).mock.calls[0][0] as {
      onSuccess: (data: typeof dummyResponse, id: string) => Promise<void>
    }

    await mutationConfig.onSuccess(dummyResponse, "emp-101")

    expect(mockRemoveQueries).toHaveBeenCalledWith({
      queryKey: employeeKeys.detail("emp-101"),
    })

    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: employeeKeys.lists(),
    })
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: employeeKeys.infiniteLists(),
    })

    expect(toast.success).toHaveBeenCalledWith(
      "Karyawan Berhasil Dihapus",
      expect.objectContaining({
        description: expect.stringContaining("Budi Santoso"),
      }),
    )

    expect(onSuccessCallback).toHaveBeenCalledWith(dummyResponse, "emp-101")
  })

  it("melakukan redirect otomatis ke /employees jika redirectToIndex bernilai true", async () => {
    useDeleteEmployee({ redirectToIndex: true })

    const mutationConfig = vi.mocked(useMutation).mock.calls[0][0] as {
      onSuccess: (data: typeof dummyResponse, id: string) => Promise<void>
    }

    await mutationConfig.onSuccess(dummyResponse, "emp-101")
    expect(mockPush).toHaveBeenCalledWith("/employees")
  })

  it("memicu toast error dan memanggil onError callback jika terjadi kegagalan", () => {
    const onErrorCallback = vi.fn()
    useDeleteEmployee({ onError: onErrorCallback })

    const mutationConfig = vi.mocked(useMutation).mock.calls[0][0] as {
      onError: (error: Error, id: string) => void
    }

    const testError = new Error("Gagal menghapus dari database")
    mutationConfig.onError(testError, "emp-101")

    expect(toast.error).toHaveBeenCalledWith(
      "Gagal Menghapus Karyawan",
      expect.objectContaining({
        description: "Gagal menghapus dari database",
      }),
    )
    expect(onErrorCallback).toHaveBeenCalledWith(testError, "emp-101")
  })
})
