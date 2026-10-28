import { describe, it, expect, vi, beforeEach } from "vitest"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useUpdateAsset } from "./use-update-asset"
import * as apiModule from "../api/assets.api"
import { assetKeys } from "../api/asset-keys"
import type { Asset } from "../types"

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

describe("useUpdateAsset hook (EMPTRACK-91)", () => {
  const mockCancelQueries = vi.fn().mockResolvedValue(undefined)
  const mockInvalidateQueries = vi.fn().mockResolvedValue(undefined)
  const mockGetQueryData = vi.fn()
  const mockGetQueriesData = vi.fn()
  const mockSetQueryData = vi.fn()
  const mockSetQueriesData = vi.fn()
  const mockMutate = vi.fn()
  const mockMutateAsync = vi.fn()

  const dummyAsset: Asset = {
    id: "ast-42",
    assetTag: "AST-00042",
    name: "Dell UltraSharp 27",
    category: "Monitor",
    model: "U2723QE",
    serialNumber: "SN-DEL-42",
    status: "available",
    purchaseDate: "2024-01-15",
    purchaseCost: 8500000,
    assignedToId: null,
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

  it("mendaftarkan mutasi dengan mutationFn yang memanggil updateAsset API", async () => {
    const spyUpdate = vi.spyOn(apiModule, "updateAsset").mockResolvedValue(dummyAsset)

    useUpdateAsset("ast-42")

    expect(useMutation).toHaveBeenCalledTimes(1)
    const options = vi.mocked(useMutation).mock.calls[0][0]
    expect(options).toBeDefined()

    const patchPayload = { name: "Dell UltraSharp 27 4K" }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (options as any).mutationFn(patchPayload)
    expect(spyUpdate).toHaveBeenCalledWith("ast-42", patchPayload)
  })

  it("melakukan optimistic update dan mengembalikan previous data pada onMutate", async () => {
    mockGetQueryData.mockReturnValue(dummyAsset)
    mockGetQueriesData.mockReturnValue([])

    useUpdateAsset("ast-42")
    const options = vi.mocked(useMutation).mock.calls[0][0]

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const context = await (options as any).onMutate({ name: "Updated Monitor Name" })

    expect(mockCancelQueries).toHaveBeenCalledWith({
      queryKey: assetKeys.detail("ast-42"),
    })
    expect(mockSetQueryData).toHaveBeenCalledWith(assetKeys.detail("ast-42"), {
      ...dummyAsset,
      name: "Updated Monitor Name",
    })
    expect(context.previousAsset).toEqual(dummyAsset)
  })

  it("melakukan rollback saat onError terjadi", () => {
    useUpdateAsset("ast-42")
    const options = vi.mocked(useMutation).mock.calls[0][0]

    const previousLists = [
      [
        ["assets", "list"],
        { data: [dummyAsset], meta: { page: 1, pageSize: 20, total: 1, totalPages: 1 } },
      ],
    ]

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(options as any).onError(
      new Error("Update failed"),
      {},
      {
        previousAsset: dummyAsset,
        previousLists,
      },
    )

    expect(mockSetQueryData).toHaveBeenCalledWith(assetKeys.detail("ast-42"), dummyAsset)
    expect(toast.error).toHaveBeenCalledWith(
      "Gagal memperbarui data aset",
      expect.objectContaining({ description: "Update failed" }),
    )
  })

  it("menjalankan onSuccess dan onSettled sesuai siklus TanStack Query", () => {
    const customOnSuccess = vi.fn()
    const customOnSettled = vi.fn()

    useUpdateAsset("ast-42", {
      onSuccess: customOnSuccess,
      onSettled: customOnSettled,
    })

    const options = vi.mocked(useMutation).mock.calls[0][0]

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(options as any).onSuccess(dummyAsset)
    expect(mockSetQueryData).toHaveBeenCalledWith(assetKeys.detail("ast-42"), dummyAsset)
    expect(toast.success).toHaveBeenCalledWith('Data aset "Dell UltraSharp 27" berhasil diperbarui')
    expect(customOnSuccess).toHaveBeenCalledWith(dummyAsset)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(options as any).onSettled(dummyAsset, null)
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: assetKeys.detail("ast-42") })
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: assetKeys.lists() })
    expect(customOnSettled).toHaveBeenCalledWith(dummyAsset, null)
  })
})
