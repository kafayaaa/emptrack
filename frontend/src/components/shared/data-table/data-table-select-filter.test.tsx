import React from "react"
import { describe, expect, it, vi } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { DataTableSelectFilter } from "./data-table-select-filter"

describe("DataTableSelectFilter component", () => {
  const dummyOptions = [
    { value: "opt1", label: "Option 1" },
    { value: "opt2", label: "Option 2" },
  ]

  it("renders trigger with title and placeholder", () => {
    const html = renderToStaticMarkup(
      <DataTableSelectFilter
        title="Department"
        options={dummyOptions}
        value=""
        onValueChange={vi.fn()}
      />,
    )
    expect(html).toContain("Department:")
    expect(html).toContain("Semua Department")
  })

  it("renders with custom allLabel", () => {
    const html = renderToStaticMarkup(
      <DataTableSelectFilter
        title="Status"
        allLabel="Seluruh Status"
        options={dummyOptions}
        value=""
        onValueChange={vi.fn()}
      />,
    )
    expect(html).toContain("Seluruh Status")
  })

  it("renders string-based options", () => {
    const html = renderToStaticMarkup(
      <DataTableSelectFilter
        title="Role"
        options={["Admin", "User"]}
        value="Admin"
        onValueChange={vi.fn()}
      />,
    )
    expect(html).toContain("Role:")
  })
})
