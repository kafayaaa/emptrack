import React from "react"
import { describe, it, expect, vi } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { EmployeeDeleteDialog } from "./employee-delete-dialog"
import {
  AlertDialog,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogMedia,
} from "@/components/ui/alert-dialog"

vi.mock("../hooks/use-delete-employee", () => ({
  useDeleteEmployee: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}))

describe("EmployeeDeleteDialog component", () => {
  const dummyEmployee = {
    id: "emp-99",
    employeeNumber: "EMP-00099",
    fullName: "Rendra Kusuma",
  }

  it("renders default trigger button with Hapus Data label and accessible aria-label", () => {
    const html = renderToStaticMarkup(<EmployeeDeleteDialog employee={dummyEmployee} />)

    expect(html).toContain("Hapus Data")
    expect(html).toContain('aria-label="Hapus data karyawan Rendra Kusuma"')
    expect(html).toContain('data-slot="alert-dialog-trigger"')
  })

  it("renders custom trigger element when provided", () => {
    const html = renderToStaticMarkup(
      <EmployeeDeleteDialog
        employee={dummyEmployee}
        trigger={
          <button type="button" className="custom-delete-btn">
            Hapus Karyawan Ini
          </button>
        }
      />,
    )

    expect(html).toContain("Hapus Karyawan Ini")
    expect(html).toContain("custom-delete-btn")
  })

  it("renders confirmation alert dialog header, employee details, and action buttons", () => {
    const html = renderToStaticMarkup(
      <AlertDialog>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <span>TrashIcon</span>
          </AlertDialogMedia>
          <AlertDialogTitle>Hapus Data Karyawan</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus data karyawan{" "}
            <strong>{dummyEmployee.fullName}</strong> ({dummyEmployee.employeeNumber})? Tindakan ini
            bersifat permanen dan data tidak dapat dipulihkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction variant="destructive">Ya, Hapus Karyawan</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialog>,
    )

    expect(html).toContain("Hapus Data Karyawan")
    expect(html).toContain("Rendra Kusuma")
    expect(html).toContain("EMP-00099")
    expect(html).toContain("Batal")
    expect(html).toContain("Ya, Hapus Karyawan")
    expect(html).toContain('data-slot="alert-dialog-action"')
    expect(html).toContain('data-slot="alert-dialog-cancel"')
  })
})
