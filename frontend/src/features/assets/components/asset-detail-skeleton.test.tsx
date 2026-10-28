import React from "react"
import { describe, it, expect } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { AssetDetailSkeleton } from "./asset-detail-skeleton"

describe("AssetDetailSkeleton component (EMPTRACK-92)", () => {
  it("merender skeleton loading dengan semantic role status dan aria-busy", () => {
    const html = renderToStaticMarkup(<AssetDetailSkeleton />)

    expect(html).toContain('data-testid="asset-detail-skeleton"')
    expect(html).toContain('role="status"')
    expect(html).toContain('aria-busy="true"')
    expect(html).toContain('aria-label="Loading asset details"')
    expect(html).toContain("Loading asset details...")
  })
})
