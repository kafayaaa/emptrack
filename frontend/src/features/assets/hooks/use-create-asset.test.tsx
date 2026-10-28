import { describe, it, expect, vi, beforeEach } from "vitest"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useCreateAsset } from "./use-create-asset"
import * as apiModule from "../api/assets.api"
import { assetKeys } from "../api/asset-keys"
import type { Asset } from "../types"
import type { AssetFormValues } from "../schema/asset-form.schema"

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

describe("useCreateAsset hook (EMPTRACK-91)", () => {
  const mockInvalidateQueries = vi.fn().mockResolvedValue(undefined)
  const mockSetQueryData = vi.fn()
  const mockSetQueriesData = vi.fn()
  const mockMutate = vi.fn()
  const mockMutateAsync = vi.fn()

  const dummyCreatedAsset: Asset = {
    id: "ast-101",
    assetTag: "AST-00101",
    name: "MacBook Pro 16 M3 Max",
    category: "Laptop",
    model: "M3 Max / 36GB RAM / 1TB SSD",
    serialNumber: "C02G1234MD6R",
    status: "available",
    purchaseDate: "2024-03-01",
    purchaseCost: 35000000,
    assignedToId: null,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useQueryClient).mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
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

  it("mendaftarkan mutasi dengan mutationFn yang memanggil createAsset API", async () => {
    const spyCreate = vi.spyOn(apiModule, "createAsset").mockResolvedValue(dummyCreatedAsset)

    useCreateAsset()

    expect(useMutation).toHaveBeenCalledTimes(1)
    const options = vi.mocked(useMutation).mock.calls[0][0]
    expect(options).toBeDefined()

    const formValues: AssetFormValues = {
      name: dummyCreatedAsset.name,
      category: dummyCreatedAsset.category,
      model: dummyCreatedAsset.model,
      serialNumber: dummyCreatedAsset.serialNumber,
      status: dummyCreatedAsset.status,
      purchaseDate: dummyCreatedAsset.purchaseDate,
      purchaseCost: dummyCreatedAsset.purchaseCost,
      assignedToId: null,
      notes: null,
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (options as any).mutationFn(formValues)
    expect(spyCreate).toHaveBeenCalledWith(formValues)
  })

  it("menjalankan onSuccess callback dengan cache priming dan query invalidation", async () => {
    const customOnSuccess = vi.fn()
    useCreateAsset({ onSuccess: customOnSuccess })

    const options = vi.mocked(useMutation).mock.calls[0][0]

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (options as any).onSuccess(dummyCreatedAsset)

    // 1. Priming detail cache
    expect(mockSetQueryData).toHaveBeenCalledWith(
      assetKeys.detail(dummyCreatedAsset.id),
      dummyCreatedAsset,
    )

    // 2. Set queries data for lists
    expect(mockSetQueriesData).toHaveBeenCalledWith(
      { queryKey: assetKeys.lists() },
      expect.any(Function),
    )

    // 3. Invalidate query list
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: assetKeys.lists(),
    })

    // 4. Sonner toast success
    expect(toast.success).toHaveBeenCalledWith(
      `Aset "${dummyCreatedAsset.name}" berhasil ditambahkan`,
      expect.objectContaining({
        description: expect.stringContaining("AST-00101"),
      }),
    )

    // 5. Custom onSuccess dipanggil
    expect(customOnSuccess).toHaveBeenCalledWith(dummyCreatedAsset)
  })

  it("menampilkan toast error saat onError terpanggil", () => {
    const customOnError = vi.fn()
    useCreateAsset({ onError: customOnError })

    const options = vi.mocked(useMutation).mock.calls[0][0]
    const testError = new Error("Koneksi gagal ke server")

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(options as any).onError(testError)

    expect(toast.error).toHaveBeenCalledWith("Gagal menambahkan aset baru", {
      description: "Koneksi gagal ke server",
    })
    expect(customOnError).toHaveBeenCalledWith(testError)
  })
})
