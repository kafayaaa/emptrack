import { describe, expect, it, vi, beforeEach } from "vitest"
import * as React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import * as nuqsModule from "nuqs"
import {
  useDataTablePagination,
  type UseDataTablePaginationOptions,
  type UseDataTablePaginationReturn,
} from "./use-data-table-pagination"

vi.mock("nuqs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("nuqs")>()
  return {
    ...actual,
    useQueryState: vi.fn(),
  }
})

describe("useDataTablePagination hook", () => {
  const mockSetUrlPage = vi.fn()
  const mockSetUrlPageSize = vi.fn()

  let currentResult: UseDataTablePaginationReturn | null = null

  function TestHookComponent({ options }: { options?: UseDataTablePaginationOptions }) {
    currentResult = useDataTablePagination(options)
    return <div data-testid="test-hook" />
  }

  function renderHook(options?: UseDataTablePaginationOptions): UseDataTablePaginationReturn {
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
      if (key === "page") {
        return [1, mockSetUrlPage] as unknown as ReturnType<typeof nuqsModule.useQueryState>
      }
      if (key === "pageSize") {
        return [10, mockSetUrlPageSize] as unknown as ReturnType<typeof nuqsModule.useQueryState>
      }
      return [null, vi.fn()] as unknown as ReturnType<typeof nuqsModule.useQueryState>
    })
  })

  it("exports useDataTablePagination function", () => {
    expect(typeof useDataTablePagination).toBe("function")
  })

  it("initializes with default pagination and queries nuqs with proper options", () => {
    const result = renderHook({
      defaultPageIndex: 0,
      defaultPageSize: 10,
    })

    expect(nuqsModule.useQueryState).toHaveBeenCalledWith(
      "page",
      expect.objectContaining({
        defaultValue: 1,
        clearOnDefault: true,
      }),
    )

    expect(nuqsModule.useQueryState).toHaveBeenCalledWith(
      "pageSize",
      expect.objectContaining({
        defaultValue: 10,
        clearOnDefault: true,
      }),
    )

    expect(result.pagination).toEqual({
      pageIndex: 0,
      pageSize: 10,
    })

    expect(result.queryParams).toEqual({
      page: 1,
      pageSize: 10,
    })
  })

  it("converts 1-indexed URL page from nuqs into 0-indexed TanStack pageIndex", () => {
    vi.mocked(nuqsModule.useQueryState).mockImplementation((key) => {
      if (key === "page") {
        return [3, mockSetUrlPage] as unknown as ReturnType<typeof nuqsModule.useQueryState>
      }
      if (key === "pageSize") {
        return [25, mockSetUrlPageSize] as unknown as ReturnType<typeof nuqsModule.useQueryState>
      }
      return [null, vi.fn()] as unknown as ReturnType<typeof nuqsModule.useQueryState>
    })

    const result = renderHook()

    expect(result.pagination.pageIndex).toBe(2)
    expect(result.pagination.pageSize).toBe(25)
    expect(result.queryParams).toEqual({
      page: 3,
      pageSize: 25,
    })
  })

  it("calls setUrlPage when pageIndex changes via onPaginationChange", () => {
    const result = renderHook()

    result.onPaginationChange({
      pageIndex: 4,
      pageSize: 10,
    })

    expect(mockSetUrlPage).toHaveBeenCalledWith(5)
    expect(mockSetUrlPageSize).not.toHaveBeenCalled()
  })

  it("calls setUrlPageSize when pageSize changes via onPaginationChange", () => {
    const result = renderHook()

    result.onPaginationChange({
      pageIndex: 0,
      pageSize: 50,
    })

    expect(mockSetUrlPageSize).toHaveBeenCalledWith(50)
  })

  it("resets pageIndex to 0 when setPageSize is called", () => {
    vi.mocked(nuqsModule.useQueryState).mockImplementation((key) => {
      if (key === "page") {
        return [4, mockSetUrlPage] as unknown as ReturnType<typeof nuqsModule.useQueryState>
      }
      if (key === "pageSize") {
        return [10, mockSetUrlPageSize] as unknown as ReturnType<typeof nuqsModule.useQueryState>
      }
      return [null, vi.fn()] as unknown as ReturnType<typeof nuqsModule.useQueryState>
    })

    const result = renderHook()
    result.setPageSize(20)

    expect(mockSetUrlPage).toHaveBeenCalledWith(1)
    expect(mockSetUrlPageSize).toHaveBeenCalledWith(20)
  })

  it("updates pageIndex via setPageIndex helper function", () => {
    const result = renderHook()
    result.setPageIndex(2)

    expect(mockSetUrlPage).toHaveBeenCalledWith(3)
  })

  it("supports in-memory pagination when syncToUrl is false", () => {
    const result = renderHook({
      syncToUrl: false,
      defaultPageIndex: 1,
      defaultPageSize: 15,
    })

    expect(result.pagination).toEqual({
      pageIndex: 1,
      pageSize: 15,
    })
    expect(result.queryParams).toEqual({
      page: 2,
      pageSize: 15,
    })

    result.setPageIndex(3)
    expect(mockSetUrlPage).not.toHaveBeenCalled()
  })
})
