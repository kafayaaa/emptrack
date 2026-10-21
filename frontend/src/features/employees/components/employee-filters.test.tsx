import React from "react"
import { describe, expect, it, vi } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { EmployeeFilters } from "./employee-filters"

describe("EmployeeFilters component", () => {
  it("renders all three filter dropdowns (Departemen, Posisi, Status)", () => {
    const handleFiltersChange = vi.fn()
    const html = renderToStaticMarkup(
      <EmployeeFilters
        filters={{ department: "", position: "", status: "" }}
        onFiltersChange={handleFiltersChange}
      />,
    )

    expect(html).toContain("Departemen:")
    expect(html).toContain("Posisi:")
    expect(html).toContain("Status:")
    expect(html).toContain("Semua Departemen")
    expect(html).toContain("Semua Posisi")
    expect(html).toContain("Semua Status")
  })

  it("renders with active filter values", () => {
    const handleFiltersChange = vi.fn()
    const html = renderToStaticMarkup(
      <EmployeeFilters
        filters={{ department: "Engineering", position: "Frontend Developer", status: "active" }}
        onFiltersChange={handleFiltersChange}
      />,
    )

    expect(html).toContain("Departemen:")
    expect(html).toContain("Posisi:")
    expect(html).toContain("Status:")
  })
})
