import { describe, expect, it } from "vitest"
import { formatDate, isValidCalendarDate } from "./date"

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

describe("isValidCalendarDate (EMPTRACK-119)", () => {
  it("mengembalikan true untuk tanggal kalender yang valid", () => {
    expect(isValidCalendarDate("2024-01-15")).toBe(true)
    expect(isValidCalendarDate("2024-12-31")).toBe(true)
    expect(isValidCalendarDate("2024-02-29")).toBe(true) // Tahun kabisat 2024
  })

  it("mencegah JavaScript date rollover pada tanggal yang tidak ada di kalender", () => {
    expect(isValidCalendarDate("2024-02-30")).toBe(false)
    expect(isValidCalendarDate("2024-02-31")).toBe(false)
    expect(isValidCalendarDate("2023-02-29")).toBe(false) // 2023 bukan kabisat
    expect(isValidCalendarDate("2024-04-31")).toBe(false) // April hanya 30 hari
    expect(isValidCalendarDate("2024-06-31")).toBe(false) // Juni hanya 30 hari
  })

  it("mengembalikan false untuk format tanggal yang tidak sesuai YYYY-MM-DD", () => {
    expect(isValidCalendarDate("31-12-2024")).toBe(false)
    expect(isValidCalendarDate("2024/01/01")).toBe(false)
    expect(isValidCalendarDate("invalid")).toBe(false)
    expect(isValidCalendarDate("")).toBe(false)
  })
})
