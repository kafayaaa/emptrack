import { describe, expect, it } from "vitest"
import { formatDate } from "./date"

describe("formatDate", () => {
  it("formats standard YYYY-MM-DD date to human-readable month day, year", () => {
    expect(formatDate("2023-05-15")).toBe("May 15, 2023")
    expect(formatDate("2017-01-18")).toBe("Jan 18, 2017")
  })

  it("returns '-' when given empty or missing date string", () => {
    expect(formatDate("")).toBe("-")
  })

  it("returns the original string when given an invalid date", () => {
    expect(formatDate("invalid-date-string")).toBe("invalid-date-string")
    expect(formatDate("not-a-date")).toBe("not-a-date")
  })
})
