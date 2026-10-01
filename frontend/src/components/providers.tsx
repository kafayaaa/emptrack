"use client"

import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { NuqsAdapter } from "nuqs/adapters/next/app"

import { ThemeProvider } from "@/components/theme-provider"
import { getQueryClient } from "@/lib/query-client"

export function Providers({ children }: { children: React.ReactNode }) {
  // Tidak perlu useState: getQueryClient() sudah menangani server vs browser.
  const queryClient = getQueryClient()

  return (
    <>
      {/* attribute="class"          -> tema ditandai lewat class "dark" di <html> (cocok dengan Tailwind)
            defaultTheme="system"      -> ikuti OS pada kunjungan pertama
            disableTransitionOnChange  -> matikan transition sesaat saat ganti tema, supaya tidak ada
                                          "kedip" warna di tabel/kartu yang banyak */}
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {/* NuqsAdapter menghubungkan nuqs dengan router App Router Next.js. Tanpanya,
            useQueryState (page, filter, sort di URL) akan error. */}
        <NuqsAdapter>
          <QueryClientProvider client={queryClient}>
            {children}
            {/* Otomatis tidak ikut ke bundle production. */}
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </NuqsAdapter>
      </ThemeProvider>
    </>
  )
}
