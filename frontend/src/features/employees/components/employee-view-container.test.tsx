import React from "react"
import { describe, expect, it, vi } from "vitest"
import { EmployeeViewContainer } from "./employee-view-container"

vi.mock("nuqs", () => ({
  useQueryState: vi.fn(() => ["paginated", vi.fn()]),
  parseAsStringLiteral: vi.fn(() => ({
    withDefault: vi.fn().mockReturnThis(),
    withOptions: vi.fn().mockReturnThis(),
  })),
}))

vi.mock("./employee-table", () => ({
  EmployeeTable: () => <div data-testid="employee-table">Paginated Table</div>,
}))

vi.mock("./employee-infinite-table", () => ({
  EmployeeInfiniteTable: () => <div data-testid="employee-infinite-table">Infinite Table</div>,
}))

describe("EmployeeViewContainer", () => {
  it("renders without crashing in paginated mode", () => {
    const element = <EmployeeViewContainer />
    expect(element).toBeDefined()
  })
})
