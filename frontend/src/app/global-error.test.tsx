import React from "react"
import { describe, it, expect, vi } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import GlobalError from "./global-error"

describe("GlobalError (src/app/global-error.tsx)", () => {
  const dummyError = Object.assign(new Error("Database connection timed out"), {
    stack: "Error: Database connection timed out\n    at internalQuery (server.ts:42:15)",
    digest: "ERR_DB_77391",
  })

  it("merender struktur HTML global dengan role alert yang aksesibel", () => {
    const html = renderToStaticMarkup(<GlobalError error={dummyError} reset={vi.fn()} />)

    expect(html).toContain("<html")
    expect(html).toContain("<body")
    expect(html).toContain('role="alert"')
    expect(html).toContain('aria-live="assertive"')
    expect(html).toContain("Terjadi Kesalahan Sistem")
  })

  it("TIDAK membocorkan stack trace sensitif ke pengguna", () => {
    const html = renderToStaticMarkup(<GlobalError error={dummyError} reset={vi.fn()} />)

    expect(html).not.toContain("Database connection timed out")
    expect(html).not.toContain("internalQuery")
    expect(html).not.toContain("server.ts:42:15")
  })

  it("merender kode error digest jika tersedia", () => {
    const html = renderToStaticMarkup(<GlobalError error={dummyError} reset={vi.fn()} />)

    expect(html).toContain("Kode Error: ERR_DB_77391")
  })

  it("menyediakan tombol coba lagi dan navigasi ke beranda", () => {
    const html = renderToStaticMarkup(<GlobalError error={dummyError} reset={vi.fn()} />)

    expect(html).toContain("Coba Lagi")
    expect(html).toContain('href="/"')
  })
})
