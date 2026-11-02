import React from "react"
import { describe, it, expect, vi } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import AssetsError from "./error"

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
    push: vi.fn(),
  }),
}))

describe("AssetsError (src/app/(dashboard)/assets/error.tsx)", () => {
  const dummyError = Object.assign(new Error("Database connection timeout on /api/assets"), {
    stack: "Error: DB timeout\n    at queryAssets (/backend/asset-repo.ts:88:14)",
    digest: "ERR_ASSET_LIST_88",
  })

  it("merender pesan kontekstual modul aset dengan role alert", () => {
    const html = renderToStaticMarkup(<AssetsError error={dummyError} reset={vi.fn()} />)

    expect(html).toContain('role="alert"')
    expect(html).toContain('aria-live="assertive"')
    expect(html).toContain("Gagal Memuat Data Aset")
  })

  it("TIDAK membocorkan database query atau internal backend paths", () => {
    const html = renderToStaticMarkup(<AssetsError error={dummyError} reset={vi.fn()} />)

    expect(html).not.toContain("Database connection timeout on /api/assets")
    expect(html).not.toContain("/backend/asset-repo.ts")
  })

  it("merender tombol coba lagi dan navigasi kembali ke dashboard", () => {
    const html = renderToStaticMarkup(<AssetsError error={dummyError} reset={vi.fn()} />)

    expect(html).toContain("Kode Error: ERR_ASSET_LIST_88")
    expect(html).toContain("Coba Lagi")
    expect(html).toContain('href="/dashboard"')
  })
})
