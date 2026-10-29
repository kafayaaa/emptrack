import React from "react"
import { describe, it, expect } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { AssetStatusChart } from "./asset-status-chart"
import type { AssetDashboardMetrics } from "../types"

describe("AssetStatusChart component (EMPTRACK-94)", () => {
  const dummyMetrics: AssetDashboardMetrics = {
    total: 100,
    assigned: 60,
    available: 25,
    maintenance: 10,
    retired: 5,
    allocationRate: 60,
    totalValue: 500000000,
    categories: [],
  }

  it("merender visual progress bar dan grid segmen status", () => {
    const html = renderToStaticMarkup(<AssetStatusChart metrics={dummyMetrics} />)

    expect(html).toContain('data-testid="asset-status-chart"')
    expect(html).toContain('role="progressbar"')
    expect(html).toContain('aria-valuenow="60"')

    // Status segments
    expect(html).toContain('data-testid="status-segment-assigned"')
    expect(html).toContain("Ditugaskan")
    expect(html).toContain("60")

    expect(html).toContain('data-testid="status-segment-available"')
    expect(html).toContain("Tersedia")
    expect(html).toContain("25")

    expect(html).toContain('data-testid="status-segment-maintenance"')
    expect(html).toContain("Perawatan / Servis")
    expect(html).toContain("10")

    expect(html).toContain('data-testid="status-segment-retired"')
    expect(html).toContain("Afkir / Pensiun")
    expect(html).toContain("5")
  })
})
