import { describe, expect, it } from "vitest"
import { escapeHtml, formatTitle, toSingular } from "./string"

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

describe("escapeHtml", () => {
  it("mengembalikan string apa adanya jika tidak ada karakter HTML berbahaya", () => {
    expect(escapeHtml("EmpTrack Management System")).toBe("EmpTrack Management System")
  })

  it("meng-escape karakter <, >, dan tanda petik ganda pada tag script", () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;",
    )
  })

  it("meng-escape tag img onerror dengan single quote", () => {
    expect(escapeHtml("<img src=x onerror='alert(1)'>")).toBe(
      "&lt;img src=x onerror=&#039;alert(1)&#039;&gt;",
    )
  })

  it("meng-escape karakter ampersand", () => {
    expect(escapeHtml("R&D Department & Co")).toBe("R&amp;D Department &amp; Co")
  })

  it("menangani string kosong dengan aman", () => {
    expect(escapeHtml("")).toBe("")
  })
})
