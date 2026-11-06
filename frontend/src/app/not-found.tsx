import { FileQuestion, Home } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = { title: "Halaman tidak ditemukan" }

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="flex min-h-dvh flex-col items-center justify-center gap-5 p-6 text-center"
    >
      <div
        aria-hidden="true"
        className="flex size-16 items-center justify-center rounded-2xl bg-muted/80 text-muted-foreground ring-1 ring-border/50"
      >
        <FileQuestion className="size-8 stroke-[1.75]" />
      </div>

      <div className="space-y-1.5">
        <span className="inline-block rounded-full bg-primary/10 px-3 py-1 font-mono text-xs font-semibold text-primary">
          404 Not Found
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Halaman tidak ditemukan
        </h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Alamat yang kamu tuju tidak ada atau sudah dipindahkan.
        </p>
      </div>

      <div className="pt-2">
        <Link href="/dashboard" className={cn(buttonVariants({ size: "default" }), "gap-2")}>
          <Home className="size-4" />
          <span>Kembali ke Dashboard</span>
        </Link>
      </div>
    </main>
  )
}
