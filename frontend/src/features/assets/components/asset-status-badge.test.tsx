import React from "react"
import { describe, it, expect } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { AssetStatusBadge } from "./asset-status-badge"

describe("AssetStatusBadge (EMPTRACK-87)", () => {
  it("renders Available status with correct label", () => {
    const html = renderToStaticMarkup(<AssetStatusBadge status="available" />)
    expect(html).toContain("Available")
  })

  it("renders Assigned status with correct label", () => {
    const html = renderToStaticMarkup(<AssetStatusBadge status="assigned" />)
    expect(html).toContain("Assigned")
  })

  it("renders Maintenance status with correct label", () => {
    const html = renderToStaticMarkup(<AssetStatusBadge status="maintenance" />)
    expect(html).toContain("Maintenance")
  })

  it("renders Retired status with correct label", () => {
    const html = renderToStaticMarkup(<AssetStatusBadge status="retired" />)
    expect(html).toContain("Retired")
  })

  it("renders fallback label for unknown status", () => {
    const html = renderToStaticMarkup(<AssetStatusBadge status="disposed" />)
    expect(html).toContain("disposed")
  })
})
