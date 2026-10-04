"use client"

import { startTransition, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  const router = useRouter()

  return (
    <section
      aria-labelledby="error-title"
      className="flex flex-col items-center gap-4 p-6 text-center"
    >
      <h1 id="error-title" className="text-2xl font-semibold">
        Terjadi kesalahan
      </h1>
      {error.digest && <p className="text-sm text-muted-foreground">Kode: {error.digest}</p>}
      <Button
        onClick={() => {
          startTransition(() => {
            router.refresh()
            reset()
          })
        }}
      >
        Coba lagi
      </Button>
    </section>
  )
}
