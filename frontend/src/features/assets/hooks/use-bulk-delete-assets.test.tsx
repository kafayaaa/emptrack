import { describe, it, expect, vi, beforeEach } from "vitest"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  useBulkDeleteAssets,
  type BulkDeleteAssetMutationContext,
  type BulkDeleteAssetResult,
} from "./use-bulk-delete-assets"
import * as apiModule from "../api/assets.api"
import { assetKeys } from "../api/assets.api"
import type { AssetListResponse } from "../schema/asset.schema"
import type { Asset } from "../types"

interface TestMutationConfig {
  mutationFn: (ids: string[]) => Promise<BulkDeleteAssetResult>
  onMutate: (ids: string[]) => Promise<BulkDeleteAssetMutationContext>
  onSuccess: (
    data: BulkDeleteAssetResult,
    ids: string[],
    context?: BulkDeleteAssetMutationContext,
  ) => void
  onError: (error: Error, ids: string[], context?: BulkDeleteAssetMutationContext) => void
  onSettled: (
    data: BulkDeleteAssetResult | undefined,
    error: Error | null,
    ids: string[],
    context?: BulkDeleteAssetMutationContext,
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

describe("useBulkDeleteAssets (EMPTRACK-93)", () => {
  const mockCancelQueries = vi.fn().mockResolvedValue(undefined)
  const mockInvalidateQueries = vi.fn().mockResolvedValue(undefined)
  const mockRemoveQueries = vi.fn()
  const mockGetQueriesData = vi.fn()
  const mockSetQueryData = vi.fn()
  const mockSetQueriesData = vi.fn()
  const mockMutate = vi.fn()
  const mockMutateAsync = vi.fn()

  const dummyAsset1: Asset = {
    id: "ast-1",
    assetTag: "AST-00001",
    name: "MacBook Pro 16",
    category: "Laptop",
    model: "Apple M3 Pro",
    serialNumber: "SN1",
    status: "available",
    purchaseDate: "2024-01-01",
    purchaseCost: 35000000,
    assignedToId: null,
  }

  const dummyAsset2: Asset = {
    id: "ast-2",
    assetTag: "AST-00002",
    name: "Dell Monitor",
    category: "Monitor",
    model: "U2723QE",
    serialNumber: "SN2",
    status: "available",
    purchaseDate: "2024-01-02",
    purchaseCost: 8000000,
    assignedToId: null,
  }

  const dummyListResponse: AssetListResponse = {
    data: [dummyAsset1, dummyAsset2],
    meta: { page: 1, pageSize: 10, total: 2, totalPages: 1 },
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
    const hook = useBulkDeleteAssets()

    expect(useMutation).toHaveBeenCalledTimes(1)
    expect(hook.progress).toEqual({ current: 0, total: 0, percentage: 0 })
    expect(typeof hook.resetProgress).toBe("function")
  })

  it("mutationFn handles empty array correctly", async () => {
    useBulkDeleteAssets()
    const mutationConfig = vi.mocked(useMutation).mock.calls[0][0] as unknown as TestMutationConfig

    const result = await mutationConfig.mutationFn([])
    expect(result).toEqual({ successfulIds: [], failedIds: [], total: 0 })
  })

  it("mutationFn executes deletion with worker concurrency and progress", async () => {
    const deleteSpy = vi.spyOn(apiModule, "deleteAsset").mockResolvedValue(undefined)

    useBulkDeleteAssets()
    const mutationConfig = vi.mocked(useMutation).mock.calls[0][0] as unknown as TestMutationConfig

    const result = await mutationConfig.mutationFn(["ast-1", "ast-2"])

    expect(deleteSpy).toHaveBeenCalledWith("ast-1")
    expect(deleteSpy).toHaveBeenCalledWith("ast-2")
    expect(result).toEqual({
      successfulIds: ["ast-1", "ast-2"],
      failedIds: [],
      total: 2,
    })

    deleteSpy.mockRestore()
  })

  it("mutationFn handles partial failure correctly", async () => {
    const deleteSpy = vi.spyOn(apiModule, "deleteAsset").mockImplementation(async (id: string) => {
      if (id === "ast-2") throw new Error("Server error")
    })

    useBulkDeleteAssets()
    const mutationConfig = vi.mocked(useMutation).mock.calls[0][0] as unknown as TestMutationConfig

    const result = await mutationConfig.mutationFn(["ast-1", "ast-2"])

    expect(result.successfulIds).toEqual(["ast-1"])
    expect(result.failedIds).toEqual(["ast-2"])
    expect(result.total).toBe(2)

    deleteSpy.mockRestore()
  })

  it("mutationFn throws if all items fail", async () => {
    const deleteSpy = vi
      .spyOn(apiModule, "deleteAsset")
      .mockRejectedValue(new Error("Network failed"))

    useBulkDeleteAssets()
    const mutationConfig = vi.mocked(useMutation).mock.calls[0][0] as unknown as TestMutationConfig

    await expect(mutationConfig.mutationFn(["ast-1", "ast-2"])).rejects.toThrow(
      "Semua proses penghapusan aset terpilih mengalami kegagalan.",
    )

    deleteSpy.mockRestore()
  })

  it("onMutate optimistically removes deleted IDs and snapshots cache", async () => {
    mockGetQueriesData.mockImplementation(() => [[assetKeys.lists(), dummyListResponse]])

    useBulkDeleteAssets()
    const mutationConfig = vi.mocked(useMutation).mock.calls[0][0] as unknown as TestMutationConfig

    const context = (await mutationConfig.onMutate([
      "ast-1",
      "ast-2",
    ])) as BulkDeleteAssetMutationContext

    expect(mockCancelQueries).toHaveBeenCalledWith({
      queryKey: assetKeys.lists(),
    })
    expect(mockCancelQueries).toHaveBeenCalledWith({
      queryKey: assetKeys.detail("ast-1"),
    })
    expect(mockCancelQueries).toHaveBeenCalledWith({
      queryKey: assetKeys.detail("ast-2"),
    })
    expect(context.previousLists).toBeDefined()
    expect(mockRemoveQueries).toHaveBeenCalledWith({
      queryKey: assetKeys.detail("ast-1"),
    })
    expect(mockRemoveQueries).toHaveBeenCalledWith({
      queryKey: assetKeys.detail("ast-2"),
    })
  })

  it("onSuccess shows toast with count and calls options.onSuccess", () => {
    const onSuccessOption = vi.fn()
    useBulkDeleteAssets({ onSuccess: onSuccessOption })
    const mutationConfig = vi.mocked(useMutation).mock.calls[0][0] as unknown as TestMutationConfig

    const result: BulkDeleteAssetResult = {
      successfulIds: ["ast-1", "ast-2"],
      failedIds: [],
      total: 2,
    }

    mutationConfig.onSuccess(result, ["ast-1", "ast-2"], undefined)

    expect(toast.success).toHaveBeenCalledWith(
      "Aset Berhasil Dihapus",
      expect.objectContaining({
        description: expect.stringContaining("2 aset terpilih"),
      }),
    )
    expect(onSuccessOption).toHaveBeenCalledWith(result)
  })

  it("onSuccess shows warning toast for partial failure", () => {
    useBulkDeleteAssets()
    const mutationConfig = vi.mocked(useMutation).mock.calls[0][0] as unknown as TestMutationConfig

    const result: BulkDeleteAssetResult = {
      successfulIds: ["ast-1"],
      failedIds: ["ast-2"],
      total: 2,
    }

    mutationConfig.onSuccess(result, ["ast-1", "ast-2"], undefined)

    expect(toast.warning).toHaveBeenCalledWith(
      "Sebagian Aset Gagal Dihapus",
      expect.objectContaining({
        description: expect.stringContaining("1 berhasil dihapus, 1 gagal"),
      }),
    )
  })

  it("onError restores previous cache on failure and triggers toast.error", () => {
    const onErrorOption = vi.fn()
    useBulkDeleteAssets({ onError: onErrorOption })
    const mutationConfig = vi.mocked(useMutation).mock.calls[0][0] as unknown as TestMutationConfig

    const listQueryKey = assetKeys.list({ page: 1 })
    const context: BulkDeleteAssetMutationContext = {
      previousLists: [[listQueryKey, dummyListResponse]],
    }

    const testError = new Error("Failed to delete")
    mutationConfig.onError(testError, ["ast-1"], context)

    expect(mockSetQueryData).toHaveBeenCalledWith(listQueryKey, dummyListResponse)
    expect(toast.error).toHaveBeenCalledWith(
      "Gagal Menghapus Aset Terpilih",
      expect.objectContaining({
        description: "Failed to delete",
      }),
    )
    expect(onErrorOption).toHaveBeenCalledWith(testError)
  })

  it("onSettled invalidates lists queries", async () => {
    const onSettledOption = vi.fn()
    useBulkDeleteAssets({ onSettled: onSettledOption })
    const mutationConfig = vi.mocked(useMutation).mock.calls[0][0] as unknown as TestMutationConfig

    await mutationConfig.onSettled(undefined, null, ["ast-1"], undefined)

    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: assetKeys.lists(),
    })
    expect(onSettledOption).toHaveBeenCalled()
  })
})
