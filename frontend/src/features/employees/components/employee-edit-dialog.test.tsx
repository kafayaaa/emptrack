import React from "react"
import { describe, it, expect, vi } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { EmployeeEditDialog } from "./employee-edit-dialog"
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { EmployeeForm } from "./employee-form"
import type { Employee } from "../types"

vi.mock("../hooks/use-update-employee", () => ({
  useUpdateEmployee: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}))

describe("EmployeeEditDialog component", () => {
  const dummyEmployee: Employee = {
    id: "emp-99",
    employeeNumber: "EMP-00099",
    fullName: "Rendra Kusuma",
    email: "rendra.kusuma@perusahaan.com",
    phone: "+62 813-4455-6677",
    department: "Finance",
    position: "Accountant",
    status: "active",
    hireDate: "2022-08-15",
    isManager: false,
    managerId: null,
    projectId: "12",
  }

  it("renders default trigger button with Edit Data label and accessible aria-label", () => {
    const html = renderToStaticMarkup(<EmployeeEditDialog employee={dummyEmployee} />)

    expect(html).toContain("Edit Data")
    expect(html).toContain('aria-label="Edit data karyawan Rendra Kusuma"')
    expect(html).toContain('data-slot="dialog-trigger"')
  })

  it("renders custom trigger element when provided", () => {
    const html = renderToStaticMarkup(
      <EmployeeEditDialog
        employee={dummyEmployee}
        trigger={
          <button type="button" className="custom-edit-trigger">
            Perbarui Karyawan
          </button>
        }
      />,
    )

    expect(html).toContain("Perbarui Karyawan")
    expect(html).toContain("custom-edit-trigger")
  })

  it("renders dialog header and prefilled EmployeeForm correctly", () => {
    const html = renderToStaticMarkup(
      <Dialog>
        <DialogHeader>
          <DialogTitle>Edit Data Karyawan</DialogTitle>
          <DialogDescription>
            Perbarui rincian informasi data diri, jabatan, atau hierarki untuk{" "}
            {dummyEmployee.fullName}.
          </DialogDescription>
        </DialogHeader>
        <EmployeeForm initialData={dummyEmployee} onSubmit={vi.fn()} onCancel={vi.fn()} />
      </Dialog>,
    )

    expect(html).toContain("Edit Data Karyawan")
    expect(html).toContain("Rendra Kusuma")
    expect(html).toContain('value="EMP-00099"')
    expect(html).toContain('value="rendra.kusuma@perusahaan.com"')
    expect(html).toContain("Simpan Perubahan")
  })
})
