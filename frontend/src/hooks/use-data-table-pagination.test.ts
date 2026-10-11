import { describe, expect, it } from "vitest"
import { useDataTablePagination } from "./use-data-table-pagination"

describe("useDataTablePagination module", () => {
  it("exports useDataTablePagination function", () => {
    expect(typeof useDataTablePagination).toBe("function")
  })
})
