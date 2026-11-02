import React from "react"
import { describe, it, expect, vi } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import AssetDetailError from "./error"

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
    push: vi.fn(),
  }),
}))

describe("AssetDetailError (src/app/(dashboard)/assets/[id]/error.tsx)", () => {
  const dummyError = Object.assign(new Error("Redis cache invalidation crash: ECONNREFUSED"), {
    stack: "Error: ECONNREFUSED\n    at RedisClient.get (/cache/redis.ts:12:5)",
    digest: "ERR_ASSET_DETAIL_12",
  })

  it("merender pesan error detail aset dengan role alert", () => {
    const html = renderToStaticMarkup(<AssetDetailError error={dummyError} reset={vi.fn()} />)

    expect(html).toContain('role="alert"')
    expect(html).toContain('aria-live="assertive"')
    expect(html).toContain("Gagal Memuat Detail Aset")
  })

  it("TIDAK membocorkan redis cache error atau server trace", () => {
    const html = renderToStaticMarkup(<AssetDetailError error={dummyError} reset={vi.fn()} />)

    expect(html).not.toContain("Redis cache invalidation crash")
    expect(html).not.toContain("/cache/redis.ts")
  })

  it("merender tombol coba lagi dan navigasi kembali ke /assets", () => {
    const html = renderToStaticMarkup(<AssetDetailError error={dummyError} reset={vi.fn()} />)

    expect(html).toContain("Kode Error: ERR_ASSET_DETAIL_12")
    expect(html).toContain("Coba Lagi")
    expect(html).toContain('href="/assets"')
    expect(html).toContain("Kembali ke Daftar Aset")
  })
})
