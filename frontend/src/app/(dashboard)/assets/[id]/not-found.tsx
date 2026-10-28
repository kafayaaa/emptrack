import * as React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Box } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Asset Not Found",
  robots: {
    index: false,
    follow: false,
  },
}

export default function AssetNotFound() {
  return (
    <div
      data-testid="asset-not-found"
      role="region"
      aria-label="Asset not found notice"
      className="flex min-h-100 flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center"
    >
      <div
        aria-hidden="true"
        className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground"
      >
        <Box className="size-7" />
      </div>

      <h1 className="mt-4 text-lg font-semibold text-foreground">Asset Not Found</h1>

      <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
        Data aset yang Anda cari tidak dapat ditemukan atau telah dihapus dari sistem inventaris.
      </p>

      <div className="mt-6">
        <Link href="/assets">
          <Button variant="default" size="sm" className="gap-2">
            <ArrowLeft className="size-4" />
            Kembali ke Daftar Aset
          </Button>
        </Link>
      </div>
    </div>
  )
}
