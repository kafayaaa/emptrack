import React from "react"
import { describe, it, expect } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { DepartmentDistribution } from "./department-distribution"
import type { EmployeeDashboardMetrics } from "../types"

describe("DepartmentDistribution component (EMPTRACK-94)", () => {
  const dummyMetrics: EmployeeDashboardMetrics = {
    total: 200,
    active: 190,
    onLeave: 8,
    inactive: 2,
    departments: [
      { department: "Engineering", count: 120, percentage: 60 },
      { department: "Product", count: 50, percentage: 25 },
      { department: "Marketing", count: 30, percentage: 15 },
    ],
  }

  it("merender daftar departemen terurut dengan nilai persentase", () => {
    const html = renderToStaticMarkup(<DepartmentDistribution metrics={dummyMetrics} />)

    expect(html).toContain('data-testid="department-distribution"')
    expect(html).toContain("Distribusi Departemen")
    expect(html).toContain('data-testid="department-row-engineering"')
    expect(html).toContain("Engineering")
    expect(html).toContain("120")
    expect(html).toContain("60%")
    expect(html).toContain('data-testid="department-row-product"')
    expect(html).toContain("Product")
    expect(html).toContain("25%")
  })
})
