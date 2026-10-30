import { describe, it, expect } from "vitest"
import robots from "./robots"
import { env } from "@/lib/env"

describe("robots.txt metadata route", () => {
  it("mengembalikan aturan robots.txt yang valid dengan allow dan disallow", () => {
    const result = robots()

    expect(result).toHaveProperty("rules")
    expect(result).toHaveProperty("sitemap")

    const rules = Array.isArray(result.rules) ? result.rules : [result.rules]
    expect(rules.length).toBeGreaterThan(0)

    const mainRule = rules[0]
    expect(mainRule.userAgent).toBe("*")
    expect(mainRule.allow).toBe("/")
    expect(mainRule.disallow).toContain("/api")
    expect(mainRule.disallow).toContain("/employees/benchmark")
    expect(mainRule.disallow).not.toContain("/dashboard")
  })

  it("menghasilkan URL sitemap yang valid berdasarkan NEXT_PUBLIC_APP_URL tanpa trailing slash ganda", () => {
    const result = robots()
    const expectedBase = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")

    expect(result.sitemap).toBe(`${expectedBase}/sitemap.xml`)
    expect(result.sitemap).not.toContain("//sitemap.xml")
  })
})
