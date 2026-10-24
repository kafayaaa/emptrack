import React from "react"
import { describe, it, expect } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import InventoryPage, { metadata } from "./page"

describe("InventoryPage heading structure (EMPTRACK-59)", () => {
  it("merender dokumen dengan elemen h1 dan deskripsi", () => {
    const html = renderToStaticMarkup(<InventoryPage />)

    expect(html).toContain("<h1")
    expect(html).toContain("Inventory</h1>")
    expect(html).toContain("Track and manage company hardware, equipment, and assets.")
  })

  it("memiliki metadata title yang sesuai", () => {
    expect(metadata.title).toBe("Inventory")
  })
})
