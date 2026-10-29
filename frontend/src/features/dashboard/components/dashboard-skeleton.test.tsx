import React from "react"
import { describe, it, expect } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { DashboardSkeleton } from "./dashboard-skeleton"

describe("DashboardSkeleton component (EMPTRACK-94)", () => {
  it("merender struktur skeleton dengan testid yang sesuai", () => {
    const html = renderToStaticMarkup(<DashboardSkeleton />)

    expect(html).toContain('data-testid="dashboard-skeleton"')
    expect(html).toContain("animate-pulse")
  })
})
