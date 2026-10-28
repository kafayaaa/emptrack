import * as React from "react"
import { Metadata } from "next"
import { AssetViewContainer, AssetCreateDialog } from "@/features/assets"
import { DataTableSkeleton } from "@/components/shared/data-table"

export const metadata: Metadata = {
  title: "Assets",
}

export default function AssetsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Assets</h1>
          <p className="text-sm text-muted-foreground">
            Track and manage company hardware, equipment, and assets.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AssetCreateDialog />
        </div>
      </div>

      <React.Suspense fallback={<DataTableSkeleton rowCount={10} columnCount={8} />}>
        <AssetViewContainer />
      </React.Suspense>
    </div>
  )
}
