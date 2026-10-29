import React from "react"
import { describe, it, expect, vi } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import EmployeePage, { metadata } from "./page"

vi.mock("@/features/employees", () => ({
  EmployeeViewContainer: () => (
    <div data-testid="employee-view-container">EmployeeViewContainer</div>
  ),
  EmployeeTableSkeleton: () => <div data-testid="employee-table-skeleton">Skeleton</div>,
  EmployeeCreateDialog: () => <button type="button">Tambah Karyawan</button>,
}))

vi.mock("@/features/employees/components/employee-create-dialog", () => ({
  EmployeeCreateDialog: () => <button type="button">Tambah Karyawan</button>,
}))

describe("EmployeePage", () => {
  it("has correct page title metadata", () => {
    expect(metadata.title).toBe("Employees")
  })

  it("renders heading, description, create dialog button, and benchmark link", () => {
    const html = renderToStaticMarkup(<EmployeePage />)

    expect(html).toContain("Employees</h1>")
    expect(html).toContain("Manage and monitor all organization members")
    expect(html).toContain("Tambah Karyawan")
    expect(html).toContain("Virtualization Benchmark (10k)")
    expect(html).toContain("/employees/benchmark")
  })
})
