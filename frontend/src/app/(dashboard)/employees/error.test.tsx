import React from "react"
import { describe, it, expect, vi } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import EmployeesError from "./error"

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
    push: vi.fn(),
  }),
}))

describe("EmployeesError (src/app/(dashboard)/employees/error.tsx)", () => {
  const dummyError = Object.assign(new Error("Network timeout on /api/employees"), {
    stack: "Error: Network timeout\n    at fetchEmployees (/internal/api.ts:22:9)",
    digest: "ERR_EMP_LIST_102",
  })

  it("merender pesan kontekstual modul karyawan dengan role alert", () => {
    const html = renderToStaticMarkup(<EmployeesError error={dummyError} reset={vi.fn()} />)

    expect(html).toContain('role="alert"')
    expect(html).toContain('aria-live="assertive"')
    expect(html).toContain("Gagal Memuat Data Karyawan")
  })

  it("TIDAK membocorkan internal stack trace atau detail URL server", () => {
    const html = renderToStaticMarkup(<EmployeesError error={dummyError} reset={vi.fn()} />)

    expect(html).not.toContain("Network timeout on /api/employees")
    expect(html).not.toContain("/internal/api.ts")
  })

  it("merender tombol coba lagi dan tombol kembali ke dashboard", () => {
    const html = renderToStaticMarkup(<EmployeesError error={dummyError} reset={vi.fn()} />)

    expect(html).toContain("Kode Error: ERR_EMP_LIST_102")
    expect(html).toContain("Coba Lagi")
    expect(html).toContain('href="/dashboard"')
  })
})
