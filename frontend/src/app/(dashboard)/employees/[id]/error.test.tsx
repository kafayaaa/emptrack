import React from "react"
import { describe, it, expect, vi } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import EmployeeDetailError from "./error"

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
    push: vi.fn(),
  }),
}))

describe("EmployeeDetailError (src/app/(dashboard)/employees/[id]/error.tsx)", () => {
  const dummyError = Object.assign(new Error("Internal Server Error: 500 on employee record"), {
    stack: "Error: 500\n    at getEmployeeDetails (/internal/employee-service.ts:55:10)",
    digest: "ERR_EMP_DETAIL_55",
  })

  it("merender pesan error detail karyawan dengan role alert", () => {
    const html = renderToStaticMarkup(<EmployeeDetailError error={dummyError} reset={vi.fn()} />)

    expect(html).toContain('role="alert"')
    expect(html).toContain('aria-live="assertive"')
    expect(html).toContain("Gagal Memuat Detail Karyawan")
  })

  it("TIDAK membocorkan internal service path atau server stack trace", () => {
    const html = renderToStaticMarkup(<EmployeeDetailError error={dummyError} reset={vi.fn()} />)

    expect(html).not.toContain("Internal Server Error: 500 on employee record")
    expect(html).not.toContain("/internal/employee-service.ts")
  })

  it("merender tombol coba lagi dan navigasi kembali ke /employees", () => {
    const html = renderToStaticMarkup(<EmployeeDetailError error={dummyError} reset={vi.fn()} />)

    expect(html).toContain("Kode Error: ERR_EMP_DETAIL_55")
    expect(html).toContain("Coba Lagi")
    expect(html).toContain('href="/employees"')
    expect(html).toContain("Kembali ke Daftar Karyawan")
  })
})
