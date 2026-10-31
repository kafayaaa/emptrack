import { describe, it, expect } from "vitest"
import { securityHeaders, nextConfig, contentSecurityPolicy } from "../../next.config"

describe("Security Headers Configuration (EMPTRACK-112)", () => {
  it("menonaktifkan poweredByHeader untuk menyembunyikan X-Powered-By", () => {
    expect(nextConfig.poweredByHeader).toBe(false)
  })

  it("menerapkan konfigurasi header ke semua route (/(.*))", async () => {
    expect(nextConfig.headers).toBeDefined()
    const headerConfigs = await nextConfig.headers!()
    expect(headerConfigs).toHaveLength(1)
    expect(headerConfigs[0]?.source).toBe("/(.*)")
    expect(headerConfigs[0]?.headers).toEqual(securityHeaders)
  })

  it("menyediakan Content-Security-Policy (CSP) yang membatasi eksekusi sumber tidak tepercaya", () => {
    const cspHeader = securityHeaders.find((h) => h.key === "Content-Security-Policy")
    expect(cspHeader).toBeDefined()
    expect(cspHeader?.value).toBe(contentSecurityPolicy)

    expect(contentSecurityPolicy).toContain("default-src 'self'")
    expect(contentSecurityPolicy).toContain("frame-ancestors 'none'")
    expect(contentSecurityPolicy).toContain("object-src 'none'")
    expect(contentSecurityPolicy).toContain("base-uri 'self'")
    expect(contentSecurityPolicy).toContain("form-action 'self'")
  })

  it("mencegah clickjacking dengan X-Frame-Options DENY", () => {
    const frameHeader = securityHeaders.find((h) => h.key === "X-Frame-Options")
    expect(frameHeader?.value).toBe("DENY")
  })

  it("mencegah MIME type sniffing dengan X-Content-Type-Options nosniff", () => {
    const nosniffHeader = securityHeaders.find((h) => h.key === "X-Content-Type-Options")
    expect(nosniffHeader?.value).toBe("nosniff")
  })

  it("mengonfigurasi Referrer-Policy strict-origin-when-cross-origin", () => {
    const referrerHeader = securityHeaders.find((h) => h.key === "Referrer-Policy")
    expect(referrerHeader?.value).toBe("strict-origin-when-cross-origin")
  })

  it("mengaktifkan Strict-Transport-Security (HSTS) untuk memaksa koneksi HTTPS", () => {
    const hstsHeader = securityHeaders.find((h) => h.key === "Strict-Transport-Security")
    expect(hstsHeader).toBeDefined()
    expect(hstsHeader?.value).toContain("max-age=63072000")
    expect(hstsHeader?.value).toContain("includeSubDomains")
    expect(hstsHeader?.value).toContain("preload")
  })

  it("membatasi API sensitif perangkat pada Permissions-Policy", () => {
    const permissionsHeader = securityHeaders.find((h) => h.key === "Permissions-Policy")
    expect(permissionsHeader).toBeDefined()
    expect(permissionsHeader?.value).toContain("camera=()")
    expect(permissionsHeader?.value).toContain("microphone=()")
    expect(permissionsHeader?.value).toContain("geolocation=()")
  })

  it("mengisolasi browsing context dengan COOP dan CORP same-origin", () => {
    const coopHeader = securityHeaders.find((h) => h.key === "Cross-Origin-Opener-Policy")
    const corpHeader = securityHeaders.find((h) => h.key === "Cross-Origin-Resource-Policy")
    expect(coopHeader?.value).toBe("same-origin")
    expect(corpHeader?.value).toBe("same-origin")
  })
})
