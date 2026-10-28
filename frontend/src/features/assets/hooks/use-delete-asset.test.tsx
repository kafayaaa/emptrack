import { describe, it, expect, vi, beforeEach } from "vitest"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useDeleteAsset, type DeleteAssetMutationContext } from "./use-delete-asset"
import * as apiModule from "../api/assets.api"
import { assetKeys } from "../api/assets.api"
import type { Asset } from "../types"

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

describe("useDeleteAsset (EMPTRACK-93)", () => {
  const mockCancelQueries = vi.fn().mockResolvedValue(undefined)
  const mockInvalidateQueries = vi.fn().mockResolvedValue(undefined)
  const mockRemoveQueries = vi.fn()
  const mockGetQueryData = vi.fn()
  const mockGetQueriesData = vi.fn()
  const mockSetQueryData = vi.fn()
  const mockSetQueriesData = vi.fn()
  const mockMutate = vi.fn()
  const mockMutateAsync = vi.fn()

  const dummyAsset: Asset = {
    id: "ast-1",
    assetTag: "AST-00001",
    name: "MacBook Pro 16 M3",
    category: "Laptop",
    model: "Apple M3 Pro",
    serialNumber: "MBP16M3-001",
    status: "assigned",
    purchaseDate: "2024-01-10",
    purchaseCost: 35000000,
    assignedToId: "emp-1",
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
    useDeleteAsset()

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

  it("memanggil deleteAsset API di dalam mutationFn", async () => {
    const deleteAssetSpy = vi.spyOn(apiModule, "deleteAsset").mockResolvedValue(undefined)

    useDeleteAsset()

    const mutationConfig = vi.mocked(useMutation).mock.calls[0][0] as {
      mutationFn: (id: string) => Promise<void>
    }

    await mutationConfig.mutationFn("ast-1")
    expect(deleteAssetSpy).toHaveBeenCalledWith("ast-1")
  })

  describe("onMutate (Optimistic Deletion)", () => {
    it("melakukan cancel queries, snapshot detail & lists, dan optimistically remove dari cache", async () => {
      mockGetQueryData.mockReturnValue(dummyAsset)
      mockGetQueriesData.mockReturnValue([])

      useDeleteAsset()

      const mutationConfig = vi.mocked(useMutation).mock.calls[0][0] as {
        onMutate: (id: string) => Promise<DeleteAssetMutationContext>
      }

      const context = await mutationConfig.onMutate("ast-1")

      expect(mockCancelQueries).toHaveBeenCalledWith({
        queryKey: assetKeys.detail("ast-1"),
      })
      expect(mockCancelQueries).toHaveBeenCalledWith({
        queryKey: assetKeys.lists(),
      })
      expect(context.previousAsset).toEqual(dummyAsset)
      expect(mockRemoveQueries).toHaveBeenCalledWith({
        queryKey: assetKeys.detail("ast-1"),
      })
      expect(mockSetQueriesData).toHaveBeenCalledWith(
        { queryKey: assetKeys.lists() },
        expect.any(Function),
      )
    })
  })

  describe("onError (Rollback)", () => {
    it("melakukan rollback detail dan lists serta menampilkan toast error", () => {
      const onErrorMock = vi.fn()
      useDeleteAsset({ onError: onErrorMock })

      const mutationConfig = vi.mocked(useMutation).mock.calls[0][0] as {
        onError: (error: Error, id: string, context?: DeleteAssetMutationContext) => void
      }

      const dummyContext: DeleteAssetMutationContext = {
        previousAsset: dummyAsset,
        previousLists: [
          [
            assetKeys.lists(),
            { data: [dummyAsset], meta: { page: 1, pageSize: 10, total: 1, totalPages: 1 } },
          ],
        ],
      }

      const error = new Error("Network error")
      mutationConfig.onError(error, "ast-1", dummyContext)

      expect(mockSetQueryData).toHaveBeenCalledWith(assetKeys.detail("ast-1"), dummyAsset)
      expect(mockSetQueryData).toHaveBeenCalledWith(
        dummyContext.previousLists![0][0],
        dummyContext.previousLists![0][1],
      )
      expect(toast.error).toHaveBeenCalledWith(
        "Gagal Menghapus Aset",
        expect.objectContaining({
          description: expect.stringContaining("Network error"),
        }),
      )
      expect(onErrorMock).toHaveBeenCalledWith(error, "ast-1", dummyContext)
    })
  })

  describe("onSuccess", () => {
    it("menghapus detail cache, menampilkan toast sukses, dan memanggil onSuccess callback", () => {
      const onSuccessMock = vi.fn()
      useDeleteAsset({ assetName: "MacBook Pro", onSuccess: onSuccessMock })

      const mutationConfig = vi.mocked(useMutation).mock.calls[0][0] as {
        onSuccess: (data: void, id: string, context?: DeleteAssetMutationContext) => void
      }

      mutationConfig.onSuccess(undefined, "ast-1")

      expect(mockRemoveQueries).toHaveBeenCalledWith({ queryKey: assetKeys.detail("ast-1") })
      expect(toast.success).toHaveBeenCalledWith(
        "Aset Berhasil Dihapus",
        expect.objectContaining({
          description: expect.stringContaining('"MacBook Pro"'),
        }),
      )
      expect(onSuccessMock).toHaveBeenCalledWith("ast-1", undefined)
      expect(mockPush).not.toHaveBeenCalled()
    })

    it("melakukan redirect ke /assets jika redirectToIndex bernilai true", () => {
      useDeleteAsset({ redirectToIndex: true })

      const mutationConfig = vi.mocked(useMutation).mock.calls[0][0] as {
        onSuccess: (data: void, id: string, context?: DeleteAssetMutationContext) => void
      }

      mutationConfig.onSuccess(undefined, "ast-1")
      expect(mockPush).toHaveBeenCalledWith("/assets")
    })
  })

  describe("onSettled", () => {
    it("melakukan invalidate lists dan memanggil onSettled callback", async () => {
      const onSettledMock = vi.fn()
      useDeleteAsset({ onSettled: onSettledMock })

      const mutationConfig = vi.mocked(useMutation).mock.calls[0][0] as {
        onSettled: (
          data: void,
          error: Error | null,
          id: string,
          context?: DeleteAssetMutationContext,
        ) => Promise<void>
      }

      await mutationConfig.onSettled(undefined, null, "ast-1")

      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: assetKeys.lists(),
      })
      expect(onSettledMock).toHaveBeenCalledWith(null, "ast-1", undefined)
    })
  })
})
