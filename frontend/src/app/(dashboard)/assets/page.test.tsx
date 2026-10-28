import React from "react"
import { describe, it, expect, vi } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import AssetsPage, { metadata } from "./page"

vi.mock("@/features/assets", () => ({
  AssetViewContainer: () => <div data-testid="asset-view-container">AssetViewContainer</div>,
  AssetCreateDialog: () => <button type="button">Tambah Aset</button>,
}))

describe("AssetsPage heading structure (EMPTRACK-59)", () => {
  it("merender dokumen dengan elemen h1, deskripsi, dan tombol tambah aset", () => {
    const html = renderToStaticMarkup(<AssetsPage />)

    expect(html).toContain("<h1")
    expect(html).toContain("Assets</h1>")
    expect(html).toContain("Track and manage company hardware, equipment, and assets.")
    expect(html).toContain("Tambah Aset")
  })

  it("memiliki metadata title yang sesuai", () => {
    expect(metadata.title).toBe("Assets")
  })
})
