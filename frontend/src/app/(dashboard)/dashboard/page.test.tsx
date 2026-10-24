import React from "react"
import { describe, it, expect } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import DashboardPage, { metadata } from "./page"

describe("DashboardPage heading structure (EMPTRACK-59)", () => {
  it("merender dokumen dengan elemen h1 yang jelas", () => {
    const html = renderToStaticMarkup(<DashboardPage />)

    expect(html).toContain("<h1")
    expect(html).toContain("Dashboard</h1>")
    expect(html).toContain("Overview of key organization metrics and operations.")
  })

  it("memiliki metadata title yang sesuai", () => {
    expect(metadata.title).toBe("Dashboard")
  })
})
