import type { Metadata, Viewport } from "next"
import { DM_Sans, Geist_Mono } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { Providers } from "@/components/providers"
import { env } from "@/lib/env"

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export const metadata: Metadata = {
  // metadataBase wajib agar URL relatif (og:image, canonical) menjadi absolut untuk crawler.
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "EmpTrack",
    // template
    template: "%s | EmpTrack",
  },
  description: "Employee & asset management dashboard.",
}

// themeColor per skema warna membuat address bar mobile mengikuti tema.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // lang harus sama dengan bahasa UI Anda ("id" atau "en"). Dipakai screen reader & crawler.
    // suppressHydrationWarning di <html> karena next-themes menambah class "dark" sebelum hydration.
    <html
      lang="id"
      suppressHydrationWarning
      className={cn("h-full font-sans antialiased", dmSans.variable, geistMono.variable)}
    >
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
