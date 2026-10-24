import React from "react"
import { describe, it, expect } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import EmployeeNotFound, { metadata } from "./not-found"

describe("EmployeeNotFound (/employees/[id]/not-found.tsx)", () => {
  it("merender tampilan not found dengan elemen semantik dan tautan kembali ke /employees", () => {
    const html = renderToStaticMarkup(<EmployeeNotFound />)

    expect(html).toContain('data-testid="employee-not-found"')
    expect(html).toContain('role="region"')
    expect(html).toContain('aria-label="Employee not found notice"')
    expect(html).toContain("Employee Not Found</h1>")
    expect(html).toContain('href="/employees"')
    expect(html).toContain("Back to Employees")
  })

  it("memiliki konfigurasi metadata SEO dengan status noindex", () => {
    expect(metadata.title).toBe("Employee Not Found")
    expect(metadata.robots).toEqual({
      index: false,
      follow: false,
    })
  })
})
