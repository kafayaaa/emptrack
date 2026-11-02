import React from "react"
import { describe, it, expect, vi } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import DashboardError from "./error"

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
    push: vi.fn(),
  }),
}))

describe("DashboardError (src/app/(dashboard)/error.tsx)", () => {
  const dummyError = Object.assign(new Error("FATAL: relation users does not exist"), {
    stack:
      "Error: FATAL: relation users does not exist\n    at pgClient.query (/var/app/db.ts:100:12)",
    digest: "ERR_DASH_4091",
  })

  it("merender pesan error semantik dengan role alert", () => {
    const html = renderToStaticMarkup(<DashboardError error={dummyError} reset={vi.fn()} />)

    expect(html).toContain('role="alert"')
    expect(html).toContain('aria-live="assertive"')
    expect(html).toContain("Gagal Memuat Halaman Dashboard")
  })

  it("TIDAK membocorkan database error message dan stack trace ke UI", () => {
    const html = renderToStaticMarkup(<DashboardError error={dummyError} reset={vi.fn()} />)

    expect(html).not.toContain("FATAL: relation users does not exist")
    expect(html).not.toContain("/var/app/db.ts")
  })

  it("merender error digest dan tombol aksi navigasi", () => {
    const html = renderToStaticMarkup(<DashboardError error={dummyError} reset={vi.fn()} />)

    expect(html).toContain("Kode Error: ERR_DASH_4091")
    expect(html).toContain("Coba Lagi")
    expect(html).toContain('href="/dashboard"')
  })
})
