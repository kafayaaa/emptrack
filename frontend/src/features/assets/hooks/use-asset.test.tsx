import { describe, it, expect, vi, beforeEach } from "vitest"
import { useQuery } from "@tanstack/react-query"
import { useAsset, ASSET_DETAIL_CACHE_CONFIG } from "./use-asset"
import * as apiModule from "../api/assets.api"
import { assetKeys } from "../api/asset-keys"
import type { Asset } from "../types"

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>()
  return {
    ...actual,
    useQuery: vi.fn(),
  }
})

describe("useAsset hook (EMPTRACK-92)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("memanggil useQuery dengan queryKey assetKeys.detail(id), queryFn, dan enabled: true untuk ID valid", () => {
    const mockUseQuery = vi.mocked(useQuery)
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isSuccess: false,
      isError: false,
    } as unknown as ReturnType<typeof useQuery>)

    useAsset("ast-1")

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: assetKeys.detail("ast-1"),
        enabled: true,
        staleTime: ASSET_DETAIL_CACHE_CONFIG.STALE_TIME,
        gcTime: ASSET_DETAIL_CACHE_CONFIG.GC_TIME,
      }),
    )

    const queryOptions = mockUseQuery.mock.calls[0][0] as {
      queryFn?: (...args: unknown[]) => unknown
    }

    const sampleAsset: Asset = {
      id: "ast-1",
      assetTag: "AST-00001",
      name: "MacBook Pro 16",
      category: "Laptop",
      model: "M3 Max",
      serialNumber: "SN123456",
      status: "available",
      purchaseDate: "2024-03-01",
      purchaseCost: 35000000,
      assignedToId: null,
    }

    const getAssetByIdSpy = vi.spyOn(apiModule, "getAssetById").mockResolvedValue(sampleAsset)
    queryOptions.queryFn?.({ signal: new AbortController().signal })
    expect(getAssetByIdSpy).toHaveBeenCalledWith("ast-1", expect.any(Object))
  })

  it("menonaktifkan query jika id bernilai kosong", () => {
    const mockUseQuery = vi.mocked(useQuery)
    useAsset("")
    expect(mockUseQuery).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }))
  })
})
