import React from "react"
import { describe, it, expect } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import EmployeesLoading from "./loading"

describe("EmployeesLoading (/employees/loading.tsx)", () => {
  it("merender EmployeeTableSkeleton dengan heading halaman karyawan", () => {
    const html = renderToStaticMarkup(<EmployeesLoading />)
    expect(html).toContain("Karyawan")
    expect(html).toContain("Kelola data seluruh karyawan")
    expect(html).toContain("Employee ID")
  })
})
