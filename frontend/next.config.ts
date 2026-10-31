import type { NextConfig } from "next"
import bundleAnalyzer from "@next/bundle-analyzer"

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})

/**
 * Content Security Policy (CSP) dasar untuk aplikasi EmpTrack.
 * Disesuaikan untuk Next.js App Router (Turbopack, inline scripts/styles next-themes, local API connect).
 */
export const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ")

export const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" }, // cegah MIME type sniffing
  { key: "X-Frame-Options", value: "DENY" }, // cegah clickjacking via iframe
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }, // batasi kebocoran referrer
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  }, // nonaktifkan browser API yang tidak diperlukan
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  }, // paksa HTTPS selama 2 tahun + subdomains
  { key: "X-DNS-Prefetch-Control", value: "on" }, // optimasi prefetch DNS
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" }, // isolasi browsing context
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" }, // batasi pemuatan resource dari origin lain
]

export const nextConfig: NextConfig = {
  poweredByHeader: false, // sembunyikan header "X-Powered-By: Next.js"
  async headers() {
    // Terapkan ke semua route.
    return [{ source: "/(.*)", headers: securityHeaders }]
  },
}

export default withBundleAnalyzer(nextConfig)
