import { describe, expect, it, vi, beforeEach } from "vitest"
import * as React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import * as nuqsModule from "nuqs"
import {
  useDataTableSorting,
  type UseDataTableSortingOptions,
  type UseDataTableSortingReturn,
} from "./use-data-table-sorting"

vi.mock("nuqs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("nuqs")>()
  return {
    ...actual,
    useQueryState: vi.fn(),
  }
})

describe("useDataTableSorting hook", () => {
  const mockSetUrlSortBy = vi.fn()
  const mockSetUrlSortOrder = vi.fn()

  let currentResult: UseDataTableSortingReturn | null = null

  function TestHookComponent({ options }: { options?: UseDataTableSortingOptions }) {
    currentResult = useDataTableSorting(options)
    return <div data-testid="test-sort-hook" />
  }

  function renderHook(options?: UseDataTableSortingOptions): UseDataTableSortingReturn {
    currentResult = null
    renderToStaticMarkup(<TestHookComponent options={options} />)
    if (!currentResult) {
      throw new Error("Failed to render TestHookComponent")
    }
    return currentResult
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(nuqsModule.useQueryState).mockImplementation((key) => {
      if (key === "sortBy") {
        return ["", mockSetUrlSortBy] as unknown as ReturnType<typeof nuqsModule.useQueryState>
      }
      if (key === "sortOrder") {
        return ["asc", mockSetUrlSortOrder] as unknown as ReturnType<
          typeof nuqsModule.useQueryState
        >
      }
      return [null, vi.fn()] as unknown as ReturnType<typeof nuqsModule.useQueryState>
    })
  })

  it("exports useDataTableSorting function", () => {
    expect(typeof useDataTableSorting).toBe("function")
  })

  it("initializes empty sorting state when no sortBy is present in URL", () => {
    const result = renderHook()
    expect(result.sorting).toEqual([])
    expect(result.queryParams).toEqual({})
  })

  it("parses active URL sorting params correctly", () => {
    vi.mocked(nuqsModule.useQueryState).mockImplementation((key) => {
      if (key === "sortBy") {
        return ["fullName", mockSetUrlSortBy] as unknown as ReturnType<
          typeof nuqsModule.useQueryState
        >
      }
      if (key === "sortOrder") {
        return ["desc", mockSetUrlSortOrder] as unknown as ReturnType<
          typeof nuqsModule.useQueryState
        >
      }
      return [null, vi.fn()] as unknown as ReturnType<typeof nuqsModule.useQueryState>
    })

    const result = renderHook()
    expect(result.sorting).toEqual([{ id: "fullName", desc: true }])
    expect(result.queryParams).toEqual({ sortBy: "fullName", sortOrder: "desc" })
  })

  it("updates URL search params on onSortingChange", () => {
    const result = renderHook()
    result.onSortingChange([{ id: "department", desc: false }])
    expect(mockSetUrlSortBy).toHaveBeenCalledWith("department")
    expect(mockSetUrlSortOrder).toHaveBeenCalledWith("asc")
  })

  it("clears URL params when sorting is cleared", () => {
    const result = renderHook()
    result.onSortingChange([])
    expect(mockSetUrlSortBy).toHaveBeenCalledWith("")
    expect(mockSetUrlSortOrder).toHaveBeenCalledWith("asc")
  })
})
