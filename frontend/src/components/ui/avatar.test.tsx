import React from "react"
import { describe, it, expect } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { Avatar, AvatarFallback, AvatarImage, AvatarBadge } from "./avatar"

describe("Avatar UI Components", () => {
  it("renders Avatar with default size, fallback initials, and badge", () => {
    const html = renderToStaticMarkup(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
        <AvatarBadge />
      </Avatar>,
    )

    expect(html).toContain('data-slot="avatar"')
    expect(html).toContain('data-size="default"')
    expect(html).toContain('data-slot="avatar-fallback"')
    expect(html).toContain("JD")
    expect(html).toContain('data-slot="avatar-badge"')
  })

  it("supports xl size with large dimensions for hero cards", () => {
    const html = renderToStaticMarkup(
      <Avatar size="xl">
        <AvatarFallback>ET</AvatarFallback>
      </Avatar>,
    )

    expect(html).toContain('data-slot="avatar"')
    expect(html).toContain('data-size="xl"')
    expect(html).toContain("data-[size=xl]:size-16")
    expect(html).toContain("ET")
  })

  it("renders AvatarImage correctly with keepMounted", () => {
    const html = renderToStaticMarkup(
      <Avatar>
        <AvatarImage src="/avatar.png" alt="User Avatar" keepMounted />
        <AvatarFallback>ET</AvatarFallback>
      </Avatar>,
    )

    expect(html).toContain('data-slot="avatar-image"')
    expect(html).toContain('src="/avatar.png"')
    expect(html).toContain('alt="User Avatar"')
  })
})
