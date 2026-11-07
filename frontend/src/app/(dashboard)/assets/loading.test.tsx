import React from "react"
import { describe, it, expect } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import AssetsLoading from "./loading"

describe("AssetsLoading (/assets/loading.tsx)", () => {
  it("merender AssetTableSkeleton dengan heading halaman aset", () => {
    const html = renderToStaticMarkup(<AssetsLoading />)
    expect(html).toContain("Aset &amp; Inventaris")
    expect(html).toContain("Kelola inventaris perangkat keras")
    expect(html).toContain("Asset Tag")
  })
})
