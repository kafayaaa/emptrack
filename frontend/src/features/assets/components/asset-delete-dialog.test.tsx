import React from "react"
import { describe, it, expect, vi } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { AssetDeleteDialog } from "./asset-delete-dialog"
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

vi.mock("../hooks/use-delete-asset", () => ({
  useDeleteAsset: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}))

describe("AssetDeleteDialog component (EMPTRACK-93)", () => {
  const dummyAsset = {
    id: "ast-101",
    assetTag: "AST-00101",
    name: "MacBook Pro 16",
  }

  it("renders default trigger button with Hapus Data label", () => {
    const html = renderToStaticMarkup(<AssetDeleteDialog asset={dummyAsset} />)

    expect(html).toContain("Hapus Data")
    expect(html).toContain('data-slot="alert-dialog-trigger"')
    expect(html).toContain('data-testid="open-delete-asset-dialog-button-ast-101"')
  })

  it("renders custom trigger element when provided", () => {
    const html = renderToStaticMarkup(
      <AssetDeleteDialog
        asset={dummyAsset}
        trigger={
          <button type="button" className="custom-delete-btn">
            Hapus Aset Ini
          </button>
        }
      />,
    )

    expect(html).toContain("Hapus Aset Ini")
    expect(html).toContain("custom-delete-btn")
  })

  it("renders confirmation alert dialog header, asset details, and action buttons", () => {
    const html = renderToStaticMarkup(
      <AlertDialog>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <span>TrashIcon</span>
          </AlertDialogMedia>
          <AlertDialogTitle>Hapus Data Aset</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus data aset <strong>{dummyAsset.name}</strong> (
            {dummyAsset.assetTag})? Tindakan ini bersifat permanen dan data inventaris akan dihapus
            dari sistem.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction variant="destructive">Hapus Aset</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialog>,
    )

    expect(html).toContain("Hapus Data Aset")
    expect(html).toContain("MacBook Pro 16")
    expect(html).toContain("AST-00101")
    expect(html).toContain("Batal")
    expect(html).toContain("Hapus Aset")
    expect(html).toContain('data-slot="alert-dialog-action"')
    expect(html).toContain('data-slot="alert-dialog-cancel"')
  })
})
