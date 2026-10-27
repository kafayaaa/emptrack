import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { Progress } from "./progress"

describe("Progress component (EMPTRACK-78)", () => {
  it("renders progressbar with correct value attributes", () => {
    const html = renderToStaticMarkup(<Progress value={45} />)
    expect(html).toContain('role="progressbar"')
    expect(html).toContain('aria-valuenow="45"')
    expect(html).toContain('data-slot="progress"')
    expect(html).toContain('data-slot="progress-track"')
    expect(html).toContain('data-slot="progress-indicator"')
  })

  it("applies custom className", () => {
    const html = renderToStaticMarkup(<Progress value={60} className="custom-progress" />)
    expect(html).toContain("custom-progress")
  })
})
