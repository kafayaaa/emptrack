import React from "react"
import { describe, it, expect, vi } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { EmployeeCreateDialog } from "./employee-create-dialog"
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { EmployeeForm } from "./employee-form"

vi.mock("../hooks/use-create-employee", () => ({
  useCreateEmployee: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}))

describe("EmployeeCreateDialog component", () => {
  it("renders default trigger button with Tambah Karyawan label", () => {
    const html = renderToStaticMarkup(<EmployeeCreateDialog />)

    expect(html).toContain("Tambah Karyawan")
    expect(html).toContain('data-slot="dialog-trigger"')
  })

  it("renders custom trigger element when provided", () => {
    const html = renderToStaticMarkup(
      <EmployeeCreateDialog
        trigger={
          <button type="button" className="custom-trigger">
            Daftarkan Pegawai
          </button>
        }
      />,
    )

    expect(html).toContain("Daftarkan Pegawai")
    expect(html).toContain("custom-trigger")
  })

  it("renders dialog header and embedded form components correctly", () => {
    const html = renderToStaticMarkup(
      <Dialog>
        <DialogHeader>
          <DialogTitle>Tambah Karyawan Baru</DialogTitle>
          <DialogDescription>
            Isi data lengkap di bawah ini untuk mendaftarkan karyawan baru ke dalam sistem EmpTrack.
          </DialogDescription>
        </DialogHeader>
        <EmployeeForm onSubmit={vi.fn()} onCancel={vi.fn()} />
      </Dialog>,
    )

    expect(html).toContain("Tambah Karyawan Baru")
    expect(html).toContain(
      "Isi data lengkap di bawah ini untuk mendaftarkan karyawan baru ke dalam sistem EmpTrack.",
    )
    expect(html).toContain("Nomor Pegawai")
    expect(html).toContain("Nama Lengkap")
    expect(html).toContain("Email Perusahaan")
    expect(html).toContain("Departemen")
    expect(html).toContain("Batal")
  })
})
