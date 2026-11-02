"use client"

import { useEffect } from "react"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log internal error untuk monitoring tanpa mengekspos ke UI pengguna
    console.error(error)
  }, [error])

  return (
    <html lang="id">
      <body className="flex min-h-screen flex-col items-center justify-center bg-background p-4 font-sans text-foreground antialiased">
        <section
          role="alert"
          aria-live="assertive"
          aria-labelledby="global-error-title"
          className="flex max-w-md flex-col items-center gap-4 rounded-xl border border-destructive/20 bg-card p-8 text-center shadow-lg"
        >
          <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="size-7" aria-hidden="true" />
          </div>

          <h1 id="global-error-title" className="text-2xl font-bold tracking-tight">
            Terjadi Kesalahan Sistem
          </h1>

          <p className="text-sm text-muted-foreground">
            Aplikasi mengalami kendala tak terduga. Tim teknis telah mencatat masalah ini untuk
            segera diperbaiki.
          </p>

          {error.digest && (
            <p className="rounded bg-muted px-2.5 py-1 font-mono text-xs text-muted-foreground">
              Kode Error: {error.digest}
            </p>
          )}

          <div className="mt-2 flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
            >
              Coba Lagi
            </button>
            <Link
              href="/"
              className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
            >
              Ke Beranda
            </Link>
          </div>
        </section>
      </body>
    </html>
  )
}
