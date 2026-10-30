import { describe, it, expect } from "vitest"
import sitemap from "./sitemap"
import { env } from "@/lib/env"

describe("sitemap.xml metadata route", () => {
  it("menghasilkan daftar entri sitemap yang valid dengan atribut SEO lengkap", () => {
    const result = sitemap()
    const expectedBase = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")

    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThanOrEqual(2)

    // Entri root (home)
    const homeEntry = result.find((entry) => entry.url === expectedBase)
    expect(homeEntry).toBeDefined()
    expect(homeEntry?.priority).toBe(1.0)
    expect(homeEntry?.changeFrequency).toBe("daily")
    expect(homeEntry?.lastModified).toBeInstanceOf(Date)

    // Entri employees index
    const employeesEntry = result.find((entry) => entry.url === `${expectedBase}/employees`)
    expect(employeesEntry).toBeDefined()
    expect(employeesEntry?.priority).toBe(0.8)
    expect(employeesEntry?.changeFrequency).toBe("daily")
    expect(employeesEntry?.lastModified).toBeInstanceOf(Date)

    // Entri assets index
    const assetsEntry = result.find((entry) => entry.url === `${expectedBase}/assets`)
    expect(assetsEntry).toBeDefined()
    expect(assetsEntry?.priority).toBe(0.8)
    expect(assetsEntry?.changeFrequency).toBe("daily")
    expect(assetsEntry?.lastModified).toBeInstanceOf(Date)
  })

  it("memastikan URL di sitemap tidak memiliki double-slash", () => {
    const result = sitemap()

    result.forEach((entry) => {
      // Pastikan tidak ada double slash setelah protokol (http:// atau https://)
      const pathPart = entry.url.replace(/^https?:\/\//, "")
      expect(pathPart).not.toContain("//")
    })
  })
})
