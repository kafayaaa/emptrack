import React from "react"
import { describe, expect, it, vi, beforeEach } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import * as nuqsModule from "nuqs"
import { AssetSearchInput } from "./asset-search-input"

vi.mock("nuqs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("nuqs")>()
  return {
    ...actual,
    useQueryState: vi.fn(),
  }
})

describe("AssetSearchInput component (EMPTRACK-89)", () => {
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

  it("merender dengan placeholder default pencarian aset", () => {
    const html = renderToStaticMarkup(<AssetSearchInput />)
    expect(html).toContain('placeholder="Cari nama aset, tag, atau model..."')
    expect(html).toContain('aria-label="Cari aset"')
  })

  it("merender nilai controlled search saat diberikan melalui prop", () => {
    const html = renderToStaticMarkup(
      <AssetSearchInput search="MacBook" placeholder="Filter aset..." />,
    )
    expect(html).toContain('value="MacBook"')
    expect(html).toContain('placeholder="Filter aset..."')
  })

  it("memanggil useQueryState dari nuqs dengan konfigurasi yang tepat", () => {
    renderToStaticMarkup(<AssetSearchInput />)

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
})
