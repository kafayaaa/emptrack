import React from "react"
import { describe, expect, it, vi, beforeEach } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import * as nuqsModule from "nuqs"
import { AssetViewContainer } from "./asset-view-container"

vi.mock("nuqs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("nuqs")>()
  return {
    ...actual,
    useQueryState: vi.fn(),
  }
})

let capturedTableFilters: unknown = null

vi.mock("./asset-table", () => ({
  AssetTable: (props: { filters?: unknown }) => {
    capturedTableFilters = props.filters
    return <div data-testid="asset-table">Asset Table Mock</div>
  },
}))

describe("AssetViewContainer component (EMPTRACK-89)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    capturedTableFilters = null
  })

  it("merender tanpa error dalam kondisi default tanpa filter aktif", () => {
    vi.mocked(nuqsModule.useQueryState).mockImplementation((key) => {
      if (key === "page") {
        return [1, vi.fn()] as unknown as ReturnType<typeof nuqsModule.useQueryState>
      }
      return ["", vi.fn()] as unknown as ReturnType<typeof nuqsModule.useQueryState>
    })

    const html = renderToStaticMarkup(<AssetViewContainer />)
    expect(html).toContain('data-testid="asset-view-container"')
    expect(html).toContain('data-testid="asset-table"')
    expect(capturedTableFilters).toBeUndefined()
  })

  it("meneruskan filter search, category, status ke AssetTable", () => {
    vi.mocked(nuqsModule.useQueryState).mockImplementation((key) => {
      if (key === "search") {
        return ["ThinkPad", vi.fn()] as unknown as ReturnType<typeof nuqsModule.useQueryState>
      }
      if (key === "category") {
        return ["Laptop", vi.fn()] as unknown as ReturnType<typeof nuqsModule.useQueryState>
      }
      if (key === "status") {
        return ["available", vi.fn()] as unknown as ReturnType<typeof nuqsModule.useQueryState>
      }
      if (key === "page") {
        return [1, vi.fn()] as unknown as ReturnType<typeof nuqsModule.useQueryState>
      }
      return ["", vi.fn()] as unknown as ReturnType<typeof nuqsModule.useQueryState>
    })

    renderToStaticMarkup(<AssetViewContainer />)
    expect(capturedTableFilters).toEqual({
      search: "ThinkPad",
      category: "Laptop",
      status: "available",
    })
  })

  it("memetakan filter penugasan (assignedTo) ke status aset saat status belum disetel spesifik", () => {
    vi.mocked(nuqsModule.useQueryState).mockImplementation((key) => {
      if (key === "assignedTo") {
        return ["assigned", vi.fn()] as unknown as ReturnType<typeof nuqsModule.useQueryState>
      }
      if (key === "page") {
        return [1, vi.fn()] as unknown as ReturnType<typeof nuqsModule.useQueryState>
      }
      return ["", vi.fn()] as unknown as ReturnType<typeof nuqsModule.useQueryState>
    })

    renderToStaticMarkup(<AssetViewContainer />)
    expect(capturedTableFilters).toEqual({
      status: "assigned",
    })
  })

  it("menampilkan banner filter dan meneruskan assignedToId ke AssetTable (EMPTRACK-90)", () => {
    vi.mocked(nuqsModule.useQueryState).mockImplementation((key) => {
      if (key === "assignedToId") {
        return ["emp-14", vi.fn()] as unknown as ReturnType<typeof nuqsModule.useQueryState>
      }
      if (key === "page") {
        return [1, vi.fn()] as unknown as ReturnType<typeof nuqsModule.useQueryState>
      }
      return ["", vi.fn()] as unknown as ReturnType<typeof nuqsModule.useQueryState>
    })

    const html = renderToStaticMarkup(<AssetViewContainer />)
    expect(html).toContain('data-testid="assigned-to-filter-banner"')
    expect(html).toContain("emp-14")
    expect(html).toContain('data-testid="clear-assigned-to-filter-button"')
    expect(capturedTableFilters).toEqual({
      assignedToId: "emp-14",
    })
  })
})
