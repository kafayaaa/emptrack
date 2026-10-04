import type { Metadata, Viewport } from "next"
import { DM_Sans, Geist_Mono } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { Providers } from "@/components/shared/providers"
import { env } from "@/lib/env"

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" })

export const metadata: Metadata = {
  // metadataBase wajib agar URL relatif (og:image, canonical) menjadi absolut untuk crawler.
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: {
    default: "EmpTrack - Employee & Asset Management",
    // template
    template: "%s | EmpTrack",
  },
  description: "Dashboard manajemen karyawan dan aset dengan dukungan data skala besar.",
  applicationName: "EmpTrack",
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "EmpTrack",
    title: "EmpTrack — Employee & Asset Management",
    description: "Dashboard manajemen karyawan dan aset dengan dukungan data skala besar.",
  },
  twitter: { card: "summary_large_image" },
}

// themeColor per skema warna membuat address bar mobile mengikuti tema.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  colorScheme: "light dark",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // lang harus sama dengan bahasa UI Anda ("id" atau "en"). Dipakai screen reader & crawler.
    // suppressHydrationWarning di <html> karena next-themes menambah class "dark" sebelum hydration.
    <html lang="id" suppressHydrationWarning>
      <body
        className={cn("min-h-dvh font-sans antialiased", dmSans.variable, geistMono.variable)}
        suppressHydrationWarning
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:ring-2 focus:ring-ring"
        >
          Lewati ke konten utama
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
