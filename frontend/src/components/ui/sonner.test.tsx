import React from "react"
import { describe, it, expect, vi } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { Toaster } from "./sonner"

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "dark" }),
}))

describe("Toaster component (sonner)", () => {
  it("renders sonner toaster element without throwing", () => {
    const html = renderToStaticMarkup(<Toaster position="top-right" />)
    expect(html).toBeDefined()
    expect(html).toContain('aria-label="Notifications')
    expect(html).toContain('aria-live="polite"')
  })
})
