import React from "react"
import { describe, expect, it, vi } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { AssetFilters } from "./asset-filters"

describe("AssetFilters component (EMPTRACK-89)", () => {
  it("merender ketiga filter dropdown (Kategori, Status, Penugasan)", () => {
    const handleFiltersChange = vi.fn()
    const html = renderToStaticMarkup(
      <AssetFilters
        filters={{ category: undefined, status: undefined, assignedTo: undefined }}
        onFiltersChange={handleFiltersChange}
      />,
    )

    expect(html).toContain("Kategori:")
    expect(html).toContain("Status:")
    expect(html).toContain("Penugasan:")
    expect(html).toContain("Semua Kategori")
    expect(html).toContain("Semua Status")
    expect(html).toContain("Semua Penugasan")
  })

  it("merender nilai filter yang aktif dan menampilkan tombol Reset Filter", () => {
    const handleFiltersChange = vi.fn()
    const html = renderToStaticMarkup(
      <AssetFilters
        filters={{ category: "Laptop", status: "assigned", assignedTo: "assigned" }}
        onFiltersChange={handleFiltersChange}
      />,
    )

    expect(html).toContain("Kategori:")
    expect(html).toContain("Status:")
    expect(html).toContain("Penugasan:")
    expect(html).toContain("Reset Filter")
  })

  it("tidak menampilkan tombol Reset Filter jika tidak ada filter aktif", () => {
    const handleFiltersChange = vi.fn()
    const html = renderToStaticMarkup(
      <AssetFilters
        filters={{ category: undefined, status: undefined, assignedTo: undefined }}
        onFiltersChange={handleFiltersChange}
      />,
    )

    expect(html).not.toContain("Reset Filter")
  })
})
