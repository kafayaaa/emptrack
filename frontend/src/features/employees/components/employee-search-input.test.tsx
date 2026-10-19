import React from "react"
import { describe, expect, it, vi, beforeEach } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import * as nuqsModule from "nuqs"
import { EmployeeSearchInput } from "./employee-search-input"

vi.mock("nuqs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("nuqs")>()
  return {
    ...actual,
    useQueryState: vi.fn(),
  }
})

describe("EmployeeSearchInput component", () => {
  const mockSetUrlSearch = vi.fn()
  const mockSetUrlPage = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(nuqsModule.useQueryState).mockImplementation((key) => {
      if (key === "search") {
        return ["", mockSetUrlSearch] as unknown as ReturnType<typeof nuqsModule.useQueryState>
      }
      if (key === "page") {
        return [1, mockSetUrlPage] as unknown as ReturnType<typeof nuqsModule.useQueryState>
      }
      return [null, vi.fn()] as unknown as ReturnType<typeof nuqsModule.useQueryState>
    })
  })

  it("renders with default employee search placeholder", () => {
    const html = renderToStaticMarkup(<EmployeeSearchInput />)
    expect(html).toContain('placeholder="Cari nama karyawan..."')
    expect(html).toContain('aria-label="Cari nama karyawan"')
  })

  it("renders controlled search value when passed as prop", () => {
    const html = renderToStaticMarkup(
      <EmployeeSearchInput search="Prabowo" placeholder="Filter nama..." />,
    )
    expect(html).toContain('value="Prabowo"')
    expect(html).toContain('placeholder="Filter nama..."')
  })

  it("queries nuqs with correct configuration", () => {
    renderToStaticMarkup(<EmployeeSearchInput />)

    expect(nuqsModule.useQueryState).toHaveBeenCalledWith(
      "search",
      expect.objectContaining({
        defaultValue: "",
        clearOnDefault: true,
      }),
    )

    expect(nuqsModule.useQueryState).toHaveBeenCalledWith(
      "page",
      expect.objectContaining({
        defaultValue: 1,
        clearOnDefault: true,
      }),
    )
  })

  it("accepts onSearchChange callback for controlled usage", () => {
    const handleSearchChange = vi.fn()
    const element = (
      <EmployeeSearchInput search="Siti" onSearchChange={handleSearchChange} debounceMs={250} />
    )
    expect(element).toBeDefined()
    expect(element.props.search).toBe("Siti")
    expect(element.props.debounceMs).toBe(250)
  })
})
