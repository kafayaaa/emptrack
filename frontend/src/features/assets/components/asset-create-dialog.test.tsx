import React from "react"
import { describe, it, expect, vi } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { AssetCreateDialog } from "./asset-create-dialog"
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { AssetForm } from "./asset-form"

vi.mock("../hooks/use-create-asset", () => ({
  useCreateAsset: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}))

vi.mock("@/features/employees/hooks/use-employees", () => ({
  useEmployees: () => ({
    data: { data: [] },
    isLoading: false,
  }),
}))

describe("AssetCreateDialog component (EMPTRACK-91)", () => {
  it("renders default trigger button with Tambah Aset label", () => {
    const html = renderToStaticMarkup(<AssetCreateDialog />)

    expect(html).toContain("Tambah Aset")
    expect(html).toContain('data-slot="dialog-trigger"')
    expect(html).toContain('data-testid="open-create-asset-dialog-button"')
  })

  it("renders custom trigger element when provided", () => {
    const html = renderToStaticMarkup(
      <AssetCreateDialog
        trigger={
          <button type="button" className="custom-trigger">
            Entri Hardware Baru
          </button>
        }
      />,
    )

    expect(html).toContain("Entri Hardware Baru")
    expect(html).toContain("custom-trigger")
  })

  it("renders dialog header and embedded form components correctly", () => {
    const html = renderToStaticMarkup(
      <Dialog>
        <DialogHeader>
          <DialogTitle>Tambah Aset Baru</DialogTitle>
          <DialogDescription>
            Masukkan spesifikasi lengkap, nomor seri, status operasional, dan nilai perolehan aset.
          </DialogDescription>
        </DialogHeader>
        <AssetForm onSubmit={vi.fn()} onCancel={vi.fn()} />
      </Dialog>,
    )

    expect(html).toContain("Tambah Aset Baru")
    expect(html).toContain(
      "Masukkan spesifikasi lengkap, nomor seri, status operasional, dan nilai perolehan aset.",
    )
    expect(html).toContain("Nama Aset")
    expect(html).toContain("Kategori Aset")
    expect(html).toContain("Model / Spesifikasi")
    expect(html).toContain("Nomor Seri (Serial Number)")
    expect(html).toContain("Batal")
  })
})
