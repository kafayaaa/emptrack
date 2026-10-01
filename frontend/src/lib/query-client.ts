import { QueryClient, isServer } from "@tanstack/react-query"

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data dianggap "segar" selama 60 detik. Selama itu, kembali ke page-1
        // langsung dari cache TANPA request ke server.
        staleTime: 60 * 1000,

        // Data yang tidak dipakai komponen manapun dibuang dari memori setelah 10 menit.
        // Batas ini penting untuk dataset besar agar memori browser tidak membengkak.
        gcTime: 10 * 60 * 1000,

        // Jangan refetch tiap user pindah tab. Untuk tabel puluhan ribu data,
        // refetch otomatis itu mahal. Refresh dilakukan lewat tombol atau invalidate setelah mutasi.
        refetchOnWindowFocus: false,

        // Retry 1 kali saja. Default 3 kali membuat error terasa lambat.
        retry: 1,
      },
    },
  })
}

// Client singleton khusus browser.
let browserQueryClient: QueryClient | undefined

export function getQueryClient() {
  // Di server: SELALU buat client baru per request. Kalau dibagi antar request,
  // cache satu user bisa bocor ke user lain (masalah keamanan).
  if (isServer) return makeQueryClient()

  // Di browser: pakai satu instance saja. Kalau dibuat ulang tiap render,
  // cache hilang (terutama saat React suspend di render pertama).
  if (!browserQueryClient) browserQueryClient = makeQueryClient()
  return browserQueryClient
}
