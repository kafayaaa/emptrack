import React from "react"
import { describe, it, expect } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs"

describe("Tabs UI Components", () => {
  it("renders Tabs with ARIA roles, data-slots, and proper active states", () => {
    const html = renderToStaticMarkup(
      <Tabs defaultValue="tab1" className="custom-tabs">
        <TabsList className="custom-list">
          <TabsTrigger value="tab1">First Tab</TabsTrigger>
          <TabsTrigger value="tab2">Second Tab</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" keepMounted>
          First Content
        </TabsContent>
        <TabsContent value="tab2" keepMounted>
          Second Content
        </TabsContent>
      </Tabs>,
    )

    // Slots
    expect(html).toContain('data-slot="tabs"')
    expect(html).toContain('data-slot="tabs-list"')
    expect(html).toContain('data-slot="tabs-trigger"')
    expect(html).toContain('data-slot="tabs-content"')

    // Accessibility roles
    expect(html).toContain('role="tablist"')
    expect(html).toContain('role="tab"')
    expect(html).toContain('role="tabpanel"')

    // Tab items & active selection
    expect(html).toContain('aria-selected="true"')
    expect(html).toContain("First Tab")
    expect(html).toContain('aria-selected="false"')
    expect(html).toContain("Second Tab")

    // Panel content
    expect(html).toContain("First Content")
    expect(html).toContain("Second Content")
  })
})
