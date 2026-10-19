import React from "react"
import { describe, expect, it, vi } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { DataTableSearchInput } from "./data-table-search-input"

describe("DataTableSearchInput component", () => {
  it("renders with search role and default placeholder", () => {
    const html = renderToStaticMarkup(<DataTableSearchInput />)
    expect(html).toContain('role="search"')
    expect(html).toContain('placeholder="Cari karyawan..."')
    expect(html).toContain('aria-label="Cari data"')
  })

  it("renders with custom placeholder and aria-label", () => {
    const html = renderToStaticMarkup(
      <DataTableSearchInput
        placeholder="Cari nama karyawan..."
        ariaLabel="Pencarian karyawan"
        containerClassName="max-w-md"
      />,
    )
    expect(html).toContain('placeholder="Cari nama karyawan..."')
    expect(html).toContain('aria-label="Pencarian karyawan"')
    expect(html).toContain("max-w-md")
  })

  it("renders clear button when value is provided", () => {
    const html = renderToStaticMarkup(<DataTableSearchInput value="Budi" ariaLabel="Cari data" />)
    expect(html).toContain('value="Budi"')
    expect(html).toContain('aria-label="Hapus kata kunci pencarian"')
  })

  it("does not render clear button when value is empty", () => {
    const html = renderToStaticMarkup(<DataTableSearchInput value="" ariaLabel="Cari data" />)
    expect(html).not.toContain('aria-label="Hapus kata kunci pencarian"')
  })

  it("accepts callbacks onChange and onDebouncedChange", () => {
    const handleChange = vi.fn()
    const handleDebouncedChange = vi.fn()

    const element = (
      <DataTableSearchInput
        defaultValue="Initial"
        onChange={handleChange}
        onDebouncedChange={handleDebouncedChange}
        debounceMs={400}
      />
    )
    expect(element).toBeDefined()
    expect(element.props.defaultValue).toBe("Initial")
    expect(element.props.debounceMs).toBe(400)
  })
})
