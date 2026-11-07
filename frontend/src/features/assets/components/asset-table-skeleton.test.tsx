import React from "react"
import { describe, expect, it } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { AssetTableSkeleton } from "./asset-table-skeleton"

describe("AssetTableSkeleton Component", () => {
  it("renders valid table skeleton structure with columns and pagination", () => {
    const html = renderToStaticMarkup(<AssetTableSkeleton rowCount={5} />)
    expect(html).toContain('data-testid="asset-table-skeleton"')
    expect(html).toContain('role="status"')
    expect(html).toContain('aria-busy="true"')
    expect(html).toContain("Asset Tag")
    expect(html).toContain("Asset Name")
  })

  it("is wrapped in React.memo", () => {
    expect(AssetTableSkeleton).toBeDefined()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((AssetTableSkeleton as any).$$typeof?.toString()).toContain("react.memo")
  })
})
