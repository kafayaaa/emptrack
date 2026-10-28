import React from "react"
import { describe, it, expect } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import AssetsPage, { metadata } from "./page"

describe("AssetsPage heading structure (EMPTRACK-59)", () => {
  it("merender dokumen dengan elemen h1 dan deskripsi", () => {
    const html = renderToStaticMarkup(<AssetsPage />)

    expect(html).toContain("<h1")
    expect(html).toContain("Assets</h1>")
    expect(html).toContain("Track and manage company hardware, equipment, and assets.")
  })

  it("memiliki metadata title yang sesuai", () => {
    expect(metadata.title).toBe("Assets")
  })
})
