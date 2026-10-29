import React from "react"
import { describe, it, expect } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import DashboardLoading from "./loading"

describe("DashboardLoading component (EMPTRACK-94)", () => {
  it("merender DashboardSkeleton saat halaman dimuat", () => {
    const html = renderToStaticMarkup(<DashboardLoading />)

    expect(html).toContain('data-testid="dashboard-skeleton"')
    expect(html).toContain("animate-pulse")
  })
})
