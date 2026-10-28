import React from "react"
import { describe, it, expect } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import AssetDetailLoading from "./loading"

describe("AssetDetailLoading (/assets/[id]/loading.tsx) (EMPTRACK-92)", () => {
  it("merender AssetDetailSkeleton dengan atribut role status dan data-testid", () => {
    const html = renderToStaticMarkup(<AssetDetailLoading />)
    expect(html).toContain('data-testid="asset-detail-skeleton"')
    expect(html).toContain('role="status"')
    expect(html).toContain('aria-busy="true"')
  })
})
