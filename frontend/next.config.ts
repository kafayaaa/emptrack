import type { NextConfig } from "next"

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" }, // cegah browser menebak MIME type
  { key: "X-Frame-Options", value: "DENY" }, // cegah app dimuat di iframe (clickjacking)
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }, // batasi kebocoran URL ke situs lain
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" }, // matikan API yang tidak dipakai
]

const nextConfig: NextConfig = {
  poweredByHeader: false, // sembunyikan header "X-Powered-By: Next.js"
  async headers() {
    // Terapkan ke semua route.
    return [{ source: "/(.*)", headers: securityHeaders }]
  },
}

export default nextConfig
