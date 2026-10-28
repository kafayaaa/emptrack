import React from "react"
import { describe, it, expect } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import AssetNotFound, { metadata } from "./not-found"

describe("AssetNotFound (/assets/[id]/not-found.tsx) (EMPTRACK-92)", () => {
  it("merender informasi tidak ditemukan dengan semantic region notice dan back button", () => {
    const html = renderToStaticMarkup(<AssetNotFound />)

    expect(html).toContain('data-testid="asset-not-found"')
    expect(html).toContain('role="region"')
    expect(html).toContain('aria-label="Asset not found notice"')
    expect(html).toContain("Asset Not Found</h1>")
    expect(html).toContain("Kembali ke Daftar Aset")
    expect(html).toContain('href="/assets"')
  })

  it("memiliki metadata title dan robots noindex", () => {
    expect(metadata.title).toBe("Asset Not Found")
    expect(metadata.robots).toEqual({ index: false, follow: false })
  })
})
