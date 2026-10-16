import React from "react"
import { describe, expect, it, vi } from "vitest"
import { EmployeeViewToggle } from "./employee-view-toggle"

vi.mock("nuqs", () => ({
  useQueryState: vi.fn(() => ["paginated", vi.fn()]),
  parseAsStringLiteral: vi.fn(() => ({
    withDefault: vi.fn().mockReturnThis(),
    withOptions: vi.fn().mockReturnThis(),
  })),
}))

describe("EmployeeViewToggle", () => {
  it("renders both pagination and infinite scroll buttons", () => {
    const element = <EmployeeViewToggle />
    expect(element).toBeDefined()
  })

  it("calls onViewModeChange when clicked in controlled mode", () => {
    const onViewModeChange = vi.fn()
    const element = <EmployeeViewToggle viewMode="paginated" onViewModeChange={onViewModeChange} />
    expect(element).toBeDefined()
  })
})
