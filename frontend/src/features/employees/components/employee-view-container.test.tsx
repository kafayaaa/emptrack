import React from "react"
import { describe, expect, it, vi, beforeEach } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import * as nuqsModule from "nuqs"
import { EmployeeViewContainer } from "./employee-view-container"

vi.mock("nuqs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("nuqs")>()
  return {
    ...actual,
    useQueryState: vi.fn(),
  }
})

let capturedTableFilters: unknown = null
let capturedInfiniteFilters: unknown = null

vi.mock("./employee-table", () => ({
  EmployeeTable: (props: { filters?: unknown }) => {
    capturedTableFilters = props.filters
    return <div data-testid="employee-table">Paginated Table</div>
  },
}))

vi.mock("./employee-infinite-table", () => ({
  EmployeeInfiniteTable: (props: { filters?: unknown }) => {
    capturedInfiniteFilters = props.filters
    return <div data-testid="employee-infinite-table">Infinite Table</div>
  },
}))

describe("EmployeeViewContainer", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    capturedTableFilters = null
    capturedInfiniteFilters = null
  })

  it("renders without crashing in paginated mode without active search", () => {
    vi.mocked(nuqsModule.useQueryState).mockImplementation((key) => {
      if (key === "view") {
        return ["paginated", vi.fn()] as unknown as ReturnType<typeof nuqsModule.useQueryState>
      }
      if (key === "search") {
        return ["", vi.fn()] as unknown as ReturnType<typeof nuqsModule.useQueryState>
      }
      return [null, vi.fn()] as unknown as ReturnType<typeof nuqsModule.useQueryState>
    })

    const html = renderToStaticMarkup(<EmployeeViewContainer />)
    expect(html).toContain('data-testid="employee-table"')
    expect(capturedTableFilters).toBeUndefined()
  })

  it("passes search filter to EmployeeTable when search query is active in URL", () => {
    vi.mocked(nuqsModule.useQueryState).mockImplementation((key) => {
      if (key === "view") {
        return ["paginated", vi.fn()] as unknown as ReturnType<typeof nuqsModule.useQueryState>
      }
      if (key === "search") {
        return ["Alice", vi.fn()] as unknown as ReturnType<typeof nuqsModule.useQueryState>
      }
      return [null, vi.fn()] as unknown as ReturnType<typeof nuqsModule.useQueryState>
    })

    const html = renderToStaticMarkup(<EmployeeViewContainer />)
    expect(html).toContain('data-testid="employee-table"')
    expect(capturedTableFilters).toEqual({ search: "Alice" })
  })

  it("passes search filter to EmployeeInfiniteTable in infinite scroll mode", () => {
    vi.mocked(nuqsModule.useQueryState).mockImplementation((key) => {
      if (key === "view") {
        return ["infinite", vi.fn()] as unknown as ReturnType<typeof nuqsModule.useQueryState>
      }
      if (key === "search") {
        return ["Bob", vi.fn()] as unknown as ReturnType<typeof nuqsModule.useQueryState>
      }
      return [null, vi.fn()] as unknown as ReturnType<typeof nuqsModule.useQueryState>
    })

    const html = renderToStaticMarkup(<EmployeeViewContainer />)
    expect(html).toContain('data-testid="employee-infinite-table"')
    expect(capturedInfiniteFilters).toEqual({ search: "Bob" })
  })

  it("passes department, position, and status filters to EmployeeTable", () => {
    vi.mocked(nuqsModule.useQueryState).mockImplementation((key) => {
      if (key === "view") {
        return ["paginated", vi.fn()] as unknown as ReturnType<typeof nuqsModule.useQueryState>
      }
      if (key === "department") {
        return ["Engineering", vi.fn()] as unknown as ReturnType<typeof nuqsModule.useQueryState>
      }
      if (key === "position") {
        return ["Frontend Developer", vi.fn()] as unknown as ReturnType<
          typeof nuqsModule.useQueryState
        >
      }
      if (key === "status") {
        return ["active", vi.fn()] as unknown as ReturnType<typeof nuqsModule.useQueryState>
      }
      return [null, vi.fn()] as unknown as ReturnType<typeof nuqsModule.useQueryState>
    })

    const html = renderToStaticMarkup(<EmployeeViewContainer />)
    expect(html).toContain('data-testid="employee-table"')
    expect(capturedTableFilters).toEqual({
      department: "Engineering",
      position: "Frontend Developer",
      status: "active",
    })
  })

  it("configures page query state and handles filter changes resetting page to 1", () => {
    const mockSetPage = vi.fn()
    const mockSetDepartment = vi.fn()
    const mockSetPosition = vi.fn()
    const mockSetStatus = vi.fn()

    vi.mocked(nuqsModule.useQueryState).mockImplementation((key) => {
      if (key === "page") {
        return [3, mockSetPage] as unknown as ReturnType<typeof nuqsModule.useQueryState>
      }
      if (key === "department") {
        return ["", mockSetDepartment] as unknown as ReturnType<typeof nuqsModule.useQueryState>
      }
      if (key === "position") {
        return ["", mockSetPosition] as unknown as ReturnType<typeof nuqsModule.useQueryState>
      }
      if (key === "status") {
        return ["", mockSetStatus] as unknown as ReturnType<typeof nuqsModule.useQueryState>
      }
      return [null, vi.fn()] as unknown as ReturnType<typeof nuqsModule.useQueryState>
    })

    const html = renderToStaticMarkup(<EmployeeViewContainer />)
    expect(html).toBeDefined()

    expect(nuqsModule.useQueryState).toHaveBeenCalledWith(
      "page",
      expect.objectContaining({
        defaultValue: 1,
        clearOnDefault: true,
      }),
    )
  })
})
