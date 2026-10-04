import type { MetadataRoute } from "next"
import { env } from "@/lib/env"

export default function sitemap(): MetadataRoute.Sitemap {
  // Hanya halaman publik. Jangan masukkan halaman dashboard.
  return [{ url: env.NEXT_PUBLIC_APP_URL, lastModified: new Date() }]
}
