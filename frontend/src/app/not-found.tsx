import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = { title: "Halaman tidak ditemukan" }

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center"
    >
      <h1 className="text-2xl font-semibold">Halaman tidak ditemukan</h1>
      <p className="text-muted-foreground">
        Alamat yang kamu tuju tidak ada atau sudah dipindahkan.
      </p>
      <Link href="/dashboard" className={cn(buttonVariants({ size: "lg" }))}>
        Kembali ke Dashboard
      </Link>
    </main>
  )
}
