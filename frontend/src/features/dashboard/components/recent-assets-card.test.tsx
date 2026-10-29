import React from "react"
import { describe, it, expect } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { RecentAssetsCard } from "./recent-assets-card"
import type { DashboardRecentAsset } from "../types"

describe("RecentAssetsCard component (EMPTRACK-94)", () => {
  const dummyAssets: DashboardRecentAsset[] = [
    {
      id: "ast-1",
      assetTag: "AST-00001",
      name: "MacBook Pro 16",
      category: "Laptop",
      status: "assigned",
      purchaseDate: "2024-03-01",
    },
    {
      id: "ast-2",
      assetTag: "AST-00002",
      name: "Dell UltraSharp 27",
      category: "Monitor",
      status: "available",
      purchaseDate: "2024-03-05",
    },
  ]

  it("merender daftar aset terkini dengan tag, nama, kategori, dan tautan detail", () => {
    const html = renderToStaticMarkup(<RecentAssetsCard assets={dummyAssets} />)

    expect(html).toContain('data-testid="recent-assets-card"')
    expect(html).toContain("Aset Baru &amp; Terkini")
    expect(html).toContain('data-testid="recent-asset-item-ast-1"')
    expect(html).toContain("MacBook Pro 16")
    expect(html).toContain("AST-00001")
    expect(html).toContain('href="/assets/ast-1"')
    expect(html).toContain('data-testid="recent-asset-item-ast-2"')
    expect(html).toContain("Dell UltraSharp 27")
  })

  it("merender pesan kosong saat tidak ada data aset", () => {
    const html = renderToStaticMarkup(<RecentAssetsCard assets={[]} />)

    expect(html).toContain("Belum ada data aset tercatat.")
  })
})
