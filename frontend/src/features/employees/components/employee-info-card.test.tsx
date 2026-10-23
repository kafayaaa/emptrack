import React from "react"
import { describe, it, expect } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { Building2 } from "lucide-react"
import { EmployeeInfoCard } from "./employee-info-card"

describe("EmployeeInfoCard Component", () => {
  it("renders with section semantics, icon, heading, and children content", () => {
    const html = renderToStaticMarkup(
      <EmployeeInfoCard
        id="test-card-title"
        title="Test Information"
        icon={Building2}
        action={<button type="button">Edit</button>}
      >
        <div data-testid="card-child">Information Details</div>
      </EmployeeInfoCard>,
    )

    expect(html).toContain('<section data-slot="card"')
    expect(html).toContain('aria-labelledby="test-card-title"')
    expect(html).toContain('data-slot="card-title"')
    expect(html).toContain('id="test-card-title"')
    expect(html).toContain("Test Information</h2>")
    expect(html).toContain("Information Details")
    expect(html).toContain("Edit")
  })
})
