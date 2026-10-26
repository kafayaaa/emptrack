import React from "react"
import { describe, it, expect } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogMedia,
} from "./alert-dialog"

describe("AlertDialog UI Components", () => {
  it("renders trigger with data-slot attribute", () => {
    const html = renderToStaticMarkup(
      <AlertDialog>
        <AlertDialogTrigger>Buka Dialog</AlertDialogTrigger>
      </AlertDialog>,
    )

    expect(html).toContain('data-slot="alert-dialog-trigger"')
    expect(html).toContain("Buka Dialog")
  })

  it("renders header, media, title, description, footer, action, and cancel components inside root", () => {
    const html = renderToStaticMarkup(
      <AlertDialog>
        <AlertDialogHeader className="custom-header">
          <AlertDialogMedia className="custom-media">
            <span>AlertIcon</span>
          </AlertDialogMedia>
          <AlertDialogTitle className="custom-title">Hapus Karyawan</AlertDialogTitle>
          <AlertDialogDescription className="custom-desc">
            Apakah Anda yakin ingin menghapus data ini?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="custom-footer">
          <AlertDialogCancel className="custom-cancel">Batal</AlertDialogCancel>
          <AlertDialogAction className="custom-action">Hapus</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialog>,
    )

    expect(html).toContain('data-slot="alert-dialog-header"')
    expect(html).toContain("custom-header")
    expect(html).toContain('data-slot="alert-dialog-media"')
    expect(html).toContain("AlertIcon")
    expect(html).toContain('data-slot="alert-dialog-title"')
    expect(html).toContain("Hapus Karyawan")
    expect(html).toContain('data-slot="alert-dialog-description"')
    expect(html).toContain("Apakah Anda yakin ingin menghapus data ini?")
    expect(html).toContain('data-slot="alert-dialog-footer"')
    expect(html).toContain('data-slot="alert-dialog-cancel"')
    expect(html).toContain("Batal")
    expect(html).toContain('data-slot="alert-dialog-action"')
    expect(html).toContain("Hapus")
  })
})
