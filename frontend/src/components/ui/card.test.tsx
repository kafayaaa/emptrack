import React from "react"
import { describe, it, expect } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from "./card"

describe("Card UI Components", () => {
  it("renders Card and subcomponents with correct data-slot attributes and classes", () => {
    const html = renderToStaticMarkup(
      <Card className="custom-card">
        <CardHeader className="custom-header">
          <CardTitle className="custom-title">Card Title</CardTitle>
          <CardDescription className="custom-desc">Card Description</CardDescription>
        </CardHeader>
        <CardContent className="custom-content">
          <p>Card Content Body</p>
        </CardContent>
        <CardFooter className="custom-footer">
          <CardAction className="custom-action">
            <button type="button">Action</button>
          </CardAction>
        </CardFooter>
      </Card>,
    )

    expect(html).toContain('data-slot="card"')
    expect(html).toContain("custom-card")
    expect(html).toContain('data-slot="card-header"')
    expect(html).toContain("custom-header")
    expect(html).toContain('data-slot="card-title"')
    expect(html).toContain("Card Title")
    expect(html).toContain('data-slot="card-description"')
    expect(html).toContain("Card Description")
    expect(html).toContain('data-slot="card-content"')
    expect(html).toContain("Card Content Body")
    expect(html).toContain('data-slot="card-footer"')
    expect(html).toContain('data-slot="card-action"')
  })

  it("supports polymorphism with 'as' prop (e.g. section, header, h2, p)", () => {
    const html = renderToStaticMarkup(
      <Card as="section" aria-labelledby="custom-heading">
        <CardHeader as="header">
          <CardTitle as="h2" id="custom-heading">
            Semantic Heading
          </CardTitle>
          <CardDescription as="p">Semantic Paragraph</CardDescription>
        </CardHeader>
      </Card>,
    )

    expect(html).toContain('<section data-slot="card"')
    expect(html).toContain('aria-labelledby="custom-heading"')
    expect(html).toContain('<header data-slot="card-header"')
    expect(html).toContain('data-slot="card-title"')
    expect(html).toContain('id="custom-heading"')
    expect(html).toContain("Semantic Heading</h2>")
    expect(html).toContain('<p data-slot="card-description"')
    expect(html).toContain("Semantic Paragraph</p>")
  })
})
