import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import AssetDetailPage, { generateMetadata } from "./page"
import * as serverApiModule from "@/features/assets/api/assets.server"
import type { Asset } from "@/features/assets/schema/asset.schema"

const mockNotFound = vi.fn()
vi.mock("next/navigation", () => ({
  notFound: () => {
    mockNotFound()
    throw new Error("NEXT_NOT_FOUND")
  },
}))

vi.mock("@/features/assets", () => ({
  AssetDetailContainer: ({ id }: { id: string }) => (
    <div data-testid="mock-asset-detail-container">Asset Container ID: {id}</div>
  ),
  AssetDetailSkeleton: () => <div data-testid="mock-skeleton">Skeleton</div>,
}))

vi.mock("@/features/assets/api/assets.server", () => ({
  getAssetByIdServer: vi.fn(),
}))

describe("AssetDetailPage (/assets/[id]) (EMPTRACK-92)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

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

  describe("generateMetadata", () => {
    it("menghasilkan metadata SEO dinamis saat aset ditemukan", async () => {
      vi.spyOn(serverApiModule, "getAssetByIdServer").mockResolvedValue(sampleAsset)

      const metadata = await generateMetadata({
        params: Promise.resolve({ id: "ast-1" }),
      })

      expect(metadata.title).toBe("MacBook Pro 16 (AST-00001)")
      expect(metadata.description).toContain("MacBook Pro 16")
      expect(metadata.description).toContain("AST-00001")
      expect(metadata.description).toContain("available")
    })

    it("menghasilkan fallback metadata robot noindex jika aset tidak ditemukan", async () => {
      vi.spyOn(serverApiModule, "getAssetByIdServer").mockResolvedValue(null)

      const metadata = await generateMetadata({
        params: Promise.resolve({ id: "unknown" }),
      })

      expect(metadata.title).toBe("Asset Not Found")
      expect(metadata.robots).toEqual({ index: false, follow: false })
    })
  })

  describe("AssetDetailPage Component", () => {
    it("merender AssetDetailContainer saat aset valid ditemukan di server", async () => {
      vi.spyOn(serverApiModule, "getAssetByIdServer").mockResolvedValue(sampleAsset)

      const jsx = await AssetDetailPage({
        params: Promise.resolve({ id: "ast-1" }),
      })

      const html = renderToStaticMarkup(jsx)
      expect(html).toContain("Asset Container ID: ast-1")
    })

    it("memanggil notFound() saat aset tidak ditemukan", async () => {
      vi.spyOn(serverApiModule, "getAssetByIdServer").mockResolvedValue(null)

      await expect(
        AssetDetailPage({
          params: Promise.resolve({ id: "non-existent" }),
        }),
      ).rejects.toThrow("NEXT_NOT_FOUND")

      expect(mockNotFound).toHaveBeenCalledTimes(1)
    })
  })
})
