import { AssetTableSkeleton } from "@/features/assets"

export default function AssetsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Aset &amp; Inventaris
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola inventaris perangkat keras, status operasional, dan alokasi aset karyawan.
          </p>
        </div>
      </div>

      <AssetTableSkeleton rowCount={10} />
    </div>
  )
}
