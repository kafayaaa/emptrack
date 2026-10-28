import React from "react"
import { describe, it, expect, vi } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { AssetBulkDeleteDialog } from "./asset-bulk-delete-dialog"
import { Progress } from "@/components/ui/progress"

vi.mock("../hooks/use-bulk-delete-assets", () => ({
  useBulkDeleteAssets: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    progress: { current: 0, total: 0, percentage: 0 },
    resetProgress: vi.fn(),
  }),
}))

describe("AssetBulkDeleteDialog component (EMPTRACK-93)", () => {
  const dummyAssetIds = ["ast-1", "ast-2", "ast-3"]

  it("renders default trigger button with asset count", () => {
    const html = renderToStaticMarkup(<AssetBulkDeleteDialog assetIds={dummyAssetIds} />)

    expect(html).toContain("Hapus Terpilih (3)")
    expect(html).toContain('data-slot="alert-dialog-trigger"')
    expect(html).toContain('data-testid="open-bulk-delete-asset-dialog-button"')
  })

  it("renders custom trigger element when provided", () => {
    const html = renderToStaticMarkup(
      <AssetBulkDeleteDialog
        assetIds={dummyAssetIds}
        trigger={
          <button type="button" className="custom-bulk-delete-btn">
            Hapus Masal Aset
          </button>
        }
      />,
    )

    expect(html).toContain("Hapus Masal Aset")
    expect(html).toContain("custom-bulk-delete-btn")
  })

  it("renders progress bar markup with correct role and value", () => {
    const html = renderToStaticMarkup(<Progress value={75} />)

    expect(html).toContain('role="progressbar"')
    expect(html).toContain('aria-valuenow="75"')
    expect(html).toContain('data-slot="progress"')
    expect(html).toContain('data-slot="progress-track"')
    expect(html).toContain('data-slot="progress-indicator"')
  })
})
