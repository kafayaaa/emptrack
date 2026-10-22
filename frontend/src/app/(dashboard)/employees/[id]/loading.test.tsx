import React from "react"
import { describe, it, expect } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import EmployeeDetailLoading from "./loading"

describe("EmployeeDetailLoading (/employees/[id]/loading.tsx)", () => {
  it("merender EmployeeDetailSkeleton dengan atribut role status dan data-testid", () => {
    const html = renderToStaticMarkup(<EmployeeDetailLoading />)
    expect(html).toContain('data-testid="employee-detail-skeleton"')
    expect(html).toContain('role="status"')
    expect(html).toContain('aria-busy="true"')
  })
})
