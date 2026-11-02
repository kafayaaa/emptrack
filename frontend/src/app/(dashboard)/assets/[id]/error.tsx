"use client"

import { startTransition, useEffect } from "react"
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function AssetDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log internal error untuk monitoring tanpa mengekspos detail stack ke pengguna
    console.error(error)
  }, [error])

  const router = useRouter()

  return (
    <section
      role="alert"
      aria-live="assertive"
      aria-labelledby="asset-detail-error-title"
      className="flex flex-col items-center justify-center gap-4 rounded-xl border border-destructive/20 bg-card p-8 text-center shadow-sm"
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertCircle className="size-6" aria-hidden="true" />
      </div>

      <h1
        id="asset-detail-error-title"
        className="text-xl font-semibold tracking-tight text-foreground"
      >
        Gagal Memuat Detail Aset
      </h1>

      <p className="max-w-md text-sm text-muted-foreground">
        Terjadi kendala teknis saat memuat spesifikasi dan riwayat aset ini. Silakan coba muat ulang
        atau kembali ke daftar aset.
      </p>

      {error.digest && (
        <p className="rounded bg-muted px-2.5 py-1 font-mono text-xs text-muted-foreground">
          Kode Error: {error.digest}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        <Button
          onClick={() => {
            startTransition(() => {
              router.refresh()
              reset()
            })
          }}
          className="gap-2"
        >
          <RefreshCw className="size-4" />
          Coba Lagi
        </Button>
        <Link href="/assets" className={cn(buttonVariants({ variant: "outline" }), "gap-2")}>
          <ArrowLeft className="size-4" />
          Kembali ke Daftar Aset
        </Link>
      </div>
    </section>
  )
}
