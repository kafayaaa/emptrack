import React from "react"
import { describe, it, expect, vi } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { AssetEditDialog } from "./asset-edit-dialog"
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { AssetForm } from "./asset-form"
import type { Asset } from "../types"

vi.mock("../hooks/use-update-asset", () => ({
  useUpdateAsset: () => ({
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

describe("AssetEditDialog component (EMPTRACK-91)", () => {
  const dummyAsset: Asset = {
    id: "ast-99",
    assetTag: "AST-00099",
    name: "Dell UltraSharp 32 4K",
    category: "Monitor",
    model: "U3223QE",
    serialNumber: "SN-DEL-32",
    status: "available",
    purchaseDate: "2024-02-15",
    purchaseCost: 11500000,
    assignedToId: null,
  }

  it("renders default trigger button with edit aria-label", () => {
    const html = renderToStaticMarkup(<AssetEditDialog asset={dummyAsset} />)

    expect(html).toContain('data-slot="dialog-trigger"')
    expect(html).toContain('aria-label="Edit data aset Dell UltraSharp 32 4K"')
    expect(html).toContain('data-testid="open-edit-asset-dialog-button-ast-99"')
  })

  it("renders custom trigger element when provided", () => {
    const html = renderToStaticMarkup(
      <AssetEditDialog
        asset={dummyAsset}
        trigger={
          <button type="button" className="custom-edit-trigger">
            Perbarui Spesifikasi
          </button>
        }
      />,
    )

    expect(html).toContain("Perbarui Spesifikasi")
    expect(html).toContain("custom-edit-trigger")
  })

  it("renders dialog header and prefilled AssetForm correctly", () => {
    const html = renderToStaticMarkup(
      <Dialog>
        <DialogHeader>
          <DialogTitle>Edit Data Aset</DialogTitle>
          <DialogDescription>
            Perbarui informasi spesifikasi untuk {dummyAsset.name} ({dummyAsset.assetTag}).
          </DialogDescription>
        </DialogHeader>
        <AssetForm initialData={dummyAsset} onSubmit={vi.fn()} onCancel={vi.fn()} />
      </Dialog>,
    )

    expect(html).toContain("Edit Data Aset")
    expect(html).toContain("Dell UltraSharp 32 4K")
    expect(html).toContain("AST-00099")
    expect(html).toContain('value="Dell UltraSharp 32 4K"')
    expect(html).toContain('value="U3223QE"')
    expect(html).toContain('value="SN-DEL-32"')
    expect(html).toContain("Simpan Perubahan")
  })
})
