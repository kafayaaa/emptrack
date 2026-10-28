import { describe, it, expect, vi, beforeEach } from "vitest"
import type { QueryClient } from "@tanstack/react-query"
import {
  snapshotAssetLists,
  rollbackAssetLists,
  invalidateAssetLists,
  optimisticallyRemoveAssetsFromCache,
  type AssetListsCacheSnapshot,
  type AssetListSnapshot,
} from "./asset-cache-utils"
import { assetKeys } from "../api/asset-keys"
import type { Asset, AssetListResponse } from "../schema/asset.schema"

describe("asset-cache-utils (EMPTRACK-93)", () => {
  let mockQueryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    mockQueryClient = {
      getQueriesData: vi.fn(),
      setQueryData: vi.fn(),
      setQueriesData: vi.fn(),
      invalidateQueries: vi.fn().mockResolvedValue(undefined),
    } as unknown as QueryClient
  })

  describe("snapshotAssetLists", () => {
    it("memanggil getQueriesData untuk assetKeys.lists()", () => {
      snapshotAssetLists(mockQueryClient)

      expect(mockQueryClient.getQueriesData).toHaveBeenCalledWith({
        queryKey: assetKeys.lists(),
      })
    })
  })

  describe("rollbackAssetLists", () => {
    it("melakukan setQueryData untuk setiap snapshot yang tersimpan", () => {
      const previousLists: AssetListSnapshot = [
        [assetKeys.lists(), { data: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 } }],
      ]
      const mockSnapshot: AssetListsCacheSnapshot = {
        previousLists,
      }

      rollbackAssetLists(mockQueryClient, mockSnapshot)

      expect(mockQueryClient.setQueryData).toHaveBeenCalledTimes(1)
      expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
        assetKeys.lists(),
        previousLists[0][1],
      )
    })
  })

  describe("invalidateAssetLists", () => {
    it("memanggil invalidateQueries untuk queryKey assetKeys.lists()", async () => {
      await invalidateAssetLists(mockQueryClient)
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: assetKeys.lists(),
      })
    })
  })

  describe("optimisticallyRemoveAssetsFromCache", () => {
    const dummyAsset1: Asset = {
      id: "ast-1",
      assetTag: "AST-00001",
      name: "MacBook Pro",
      category: "Laptop",
      model: "M3 Max",
      serialNumber: "SN1",
      status: "available",
      purchaseDate: "2024-01-01",
      purchaseCost: 30000000,
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

    it("menghapus aset dari cache dan menghitung ulang total & totalPages", () => {
      let updaterFn:
        ((old: AssetListResponse | undefined) => AssetListResponse | undefined) | null = null

      vi.mocked(mockQueryClient.setQueriesData).mockImplementation((_filter, updater) => {
        updaterFn = updater as typeof updaterFn
        return []
      })

      optimisticallyRemoveAssetsFromCache(mockQueryClient, "ast-1")

      expect(mockQueryClient.setQueriesData).toHaveBeenCalledWith(
        { queryKey: assetKeys.lists() },
        expect.any(Function),
      )

      const oldData: AssetListResponse = {
        data: [dummyAsset1, dummyAsset2],
        meta: { page: 1, pageSize: 10, total: 2, totalPages: 1 },
      }

      const updated = updaterFn!(oldData)
      expect(updated?.data).toEqual([dummyAsset2])
      expect(updated?.meta.total).toBe(1)
      expect(updated?.meta.totalPages).toBe(1)
    })

    it("mengabaikan proses jika array ID kosong", () => {
      optimisticallyRemoveAssetsFromCache(mockQueryClient, [])
      expect(mockQueryClient.setQueriesData).not.toHaveBeenCalled()
    })
  })
})
