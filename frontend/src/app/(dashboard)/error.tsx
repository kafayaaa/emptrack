"use client"

import { startTransition, useEffect } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log internal error untuk monitoring tanpa membocorkan detail sensitif ke UI
    console.error(error)
  }, [error])

  const router = useRouter()

  return (
    <section
      role="alert"
      aria-live="assertive"
      aria-labelledby="dashboard-error-title"
      className="flex flex-col items-center justify-center gap-4 rounded-xl border border-destructive/20 bg-card p-8 text-center shadow-sm"
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-6" aria-hidden="true" />
      </div>

      <h1
        id="dashboard-error-title"
        className="text-xl font-semibold tracking-tight text-foreground"
      >
        Gagal Memuat Halaman Dashboard
      </h1>

      <p className="max-w-md text-sm text-muted-foreground">
        Terjadi kesalahan saat memuat data atau komponen dashboard. Silakan coba muat ulang atau
        kembali ke halaman utama.
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
        <Link href="/dashboard" className={cn(buttonVariants({ variant: "outline" }))}>
          Kembali ke Dashboard
        </Link>
      </div>
    </section>
  )
}
