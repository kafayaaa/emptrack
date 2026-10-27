import React from "react"
import { describe, it, expect } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { Checkbox } from "./checkbox"

describe("Checkbox UI Component (EMPTRACK-77)", () => {
  it("renders default checkbox with data-slot and role='checkbox'", () => {
    const html = renderToStaticMarkup(<Checkbox aria-label="Pilih item" />)

    expect(html).toContain('data-slot="checkbox"')
    expect(html).toContain('role="checkbox"')
    expect(html).toContain('aria-label="Pilih item"')
  })

  it("renders checked state with data-checked and aria-checked='true'", () => {
    const html = renderToStaticMarkup(<Checkbox checked aria-label="Item terpilih" />)

    expect(html).toContain("data-checked")
    expect(html).toContain('aria-checked="true"')
    expect(html).toContain('data-slot="checkbox-indicator"')
  })

  it("renders indeterminate state with data-indeterminate and aria-checked='mixed'", () => {
    const html = renderToStaticMarkup(<Checkbox indeterminate aria-label="Sebagian terpilih" />)

    expect(html).toContain("data-indeterminate")
    expect(html).toContain('aria-checked="mixed"')
    expect(html).toContain('data-slot="checkbox-indicator"')
  })

  it("renders disabled state properly", () => {
    const html = renderToStaticMarkup(<Checkbox disabled aria-label="Tidak dapat dipilih" />)

    expect(html).toContain("disabled")
  })

  it("merges custom className with default styles", () => {
    const html = renderToStaticMarkup(<Checkbox className="custom-check-class" />)

    expect(html).toContain("custom-check-class")
    expect(html).toContain('data-slot="checkbox"')
  })
})
