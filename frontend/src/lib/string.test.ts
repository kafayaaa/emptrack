import { describe, expect, it } from "vitest"
import { formatTitle, toSingular } from "./string"

describe("formatTitle", () => {
  it("mengubah slug jadi title case", () => {
    expect(formatTitle("asset-requests")).toBe("Asset Requests")
  })

  it("tidak crash pada URL malformed", () => {
    expect(() => formatTitle("%E0%A4%A")).not.toThrow()
  })
})

describe("toSingular", () => {
  it.each([
    ["employees", "employee"],
    ["categories", "category"],
    ["status", "status"],
    ["address", "address"],
  ])("%s -> %s", (input, expected) => {
    expect(toSingular(input)).toBe(expected)
  })
})
