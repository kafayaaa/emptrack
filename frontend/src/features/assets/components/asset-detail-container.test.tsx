import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { AssetDetailContainer } from "./asset-detail-container"
import * as hooksModule from "../hooks/use-asset"
import { ApiError } from "@/lib/api-client"
import type { Asset } from "../types"

vi.mock("./asset-edit-dialog", () => ({
  AssetEditDialog: () => <button>Edit Aset</button>,
}))

const sampleAsset: Asset = {
  id: "ast-1",
  assetTag: "AST-00001",
  name: "Dell UltraSharp 27",
  category: "Monitor",
  model: "U2723QE 4K",
  serialNumber: "SN-DEL-01",
  status: "available",
  purchaseDate: "2024-01-10",
  purchaseCost: 8500000,
  assignedToId: null,
}

describe("AssetDetailContainer component (EMPTRACK-92)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("merender skeleton saat status query sedang loading", () => {
    vi.spyOn(hooksModule, "useAsset").mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
      isFetching: false,
    } as unknown as ReturnType<typeof hooksModule.useAsset>)

    const html = renderToStaticMarkup(<AssetDetailContainer id="ast-1" />)
    expect(html).toContain('data-testid="asset-detail-skeleton"')
  })

  it("merender not found region saat error 404", () => {
    vi.spyOn(hooksModule, "useAsset").mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new ApiError(404, "Asset not found"),
      refetch: vi.fn(),
      isFetching: false,
    } as unknown as ReturnType<typeof hooksModule.useAsset>)

    const html = renderToStaticMarkup(<AssetDetailContainer id="unknown-id" />)
    expect(html).toContain('data-testid="asset-detail-not-found"')
    expect(html).toContain("Asset Not Found")
    expect(html).toContain("unknown-id")
  })

  it("merender tampilan error alert saat terjadi error sistem selain 404", () => {
    vi.spyOn(hooksModule, "useAsset").mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error("Database network failure"),
      refetch: vi.fn(),
      isFetching: false,
    } as unknown as ReturnType<typeof hooksModule.useAsset>)

    const html = renderToStaticMarkup(<AssetDetailContainer id="ast-1" />)
    expect(html).toContain('data-testid="asset-detail-error"')
    expect(html).toContain("Gagal Memuat Detail Aset")
    expect(html).toContain("Database network failure")
    expect(html).toContain("Coba Lagi")
  })

  it("merender AssetDetailView saat data aset berhasil dimuat", () => {
    vi.spyOn(hooksModule, "useAsset").mockReturnValue({
      data: sampleAsset,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
      isFetching: false,
    } as unknown as ReturnType<typeof hooksModule.useAsset>)

    const html = renderToStaticMarkup(<AssetDetailContainer id="ast-1" />)
    expect(html).toContain('data-testid="asset-detail-view"')
    expect(html).toContain("Dell UltraSharp 27")
    expect(html).toContain("AST-00001")
  })
})
