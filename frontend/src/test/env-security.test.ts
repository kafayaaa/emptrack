import { describe, it, expect } from "vitest"
import fs from "node:fs"
import path from "node:path"
import { envSchema } from "@/lib/env"
import { serverEnvSchema } from "@/env.server"

describe("Environment Variable Security and Audit (EMPTRACK-113)", () => {
  const envExamplePath = path.resolve(__dirname, "../../.env.example")
  const envExampleContent = fs.readFileSync(envExamplePath, "utf-8")

  const envLines = envExampleContent
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))

  const envVariables = envLines.map((line) => {
    const [key, ...values] = line.split("=")
    return { key: key?.trim() ?? "", value: values.join("=").trim() }
  })

  describe("Audit File Template .env.example", () => {
    it("memastikan file .env.example ada dan berisi template variabel", () => {
      expect(fs.existsSync(envExamplePath)).toBe(true)
      expect(envVariables.length).toBeGreaterThan(0)
    })

    it("tidak mengandung secret atau kredensial nyata di dalam .env.example", () => {
      for (const { value } of envVariables) {
        expect(value).not.toMatch(/^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/) // JWT token
        expect(value).not.toMatch(/ghp_[A-Za-z0-9]{36}/) // GitHub token
        expect(value).not.toMatch(/sk_live_[A-Za-z0-9]+/) // Stripe live secret
        expect(value).not.toMatch(/AKIA[0-9A-Z]{16}/) // AWS Access Key
      }
    })
  })

  describe("Audit Pencegahan Kebocoran Secret ke Client Bundle (NEXT_PUBLIC_)", () => {
    const sensitiveKeywords = [
      "SECRET",
      "KEY",
      "PASSWORD",
      "TOKEN",
      "CREDENTIAL",
      "PRIVATE",
      "DATABASE",
      "AUTH",
    ]

    it("tidak ada variabel berawalan NEXT_PUBLIC_ yang mengandung kata kunci sensitif", () => {
      const publicVars = envVariables
        .map((v) => v.key)
        .filter((key) => key.startsWith("NEXT_PUBLIC_"))

      expect(publicVars.length).toBeGreaterThan(0)

      for (const pubVar of publicVars) {
        const withoutPrefix = pubVar.replace("NEXT_PUBLIC_", "").toUpperCase()
        for (const keyword of sensitiveKeywords) {
          expect(withoutPrefix).not.toContain(keyword)
        }
      }
    })

    it("memastikan hanya URL publik aplikasi/API yang menggunakan awalan NEXT_PUBLIC_", () => {
      const publicVarKeys = envVariables
        .map((v) => v.key)
        .filter((key) => key.startsWith("NEXT_PUBLIC_"))

      expect(publicVarKeys.sort()).toEqual(["NEXT_PUBLIC_API_URL", "NEXT_PUBLIC_APP_URL"])
    })

    it("memastikan variabel server-only (BACKEND_URL) TIDAK memiliki awalan NEXT_PUBLIC_", () => {
      const backendVar = envVariables.find((v) => v.key === "BACKEND_URL")
      expect(backendVar).toBeDefined()
      expect(backendVar?.key.startsWith("NEXT_PUBLIC_")).toBe(false)
    })
  })

  describe("Audit Boundary server-only pada Server Environment", () => {
    it("memastikan src/env.server.ts mengimpor modul 'server-only'", () => {
      const serverEnvFile = fs.readFileSync(path.resolve(__dirname, "../env.server.ts"), "utf-8")
      expect(serverEnvFile).toContain('import "server-only"')
    })
  })

  describe("Validasi Schema Zod (Client vs Server)", () => {
    it("envSchema memvalidasi URL publik yang valid", () => {
      const parsed = envSchema.parse({
        NEXT_PUBLIC_APP_URL: "https://emptrack.internal",
        NEXT_PUBLIC_API_URL: "https://emptrack.internal/api",
      })

      expect(parsed.NEXT_PUBLIC_APP_URL).toBe("https://emptrack.internal")
      expect(parsed.NEXT_PUBLIC_API_URL).toBe("https://emptrack.internal/api")
    })

    it("envSchema menggunakan default http://localhost:3000 jika NEXT_PUBLIC_APP_URL kosong", () => {
      const parsed = envSchema.parse({
        NEXT_PUBLIC_API_URL: "http://localhost:3000",
      })

      expect(parsed.NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000")
    })

    it("envSchema menolak nilai URL yang tidak valid", () => {
      const result = envSchema.safeParse({
        NEXT_PUBLIC_APP_URL: "invalid-url-string",
        NEXT_PUBLIC_API_URL: "http://localhost:3000",
      })

      expect(result.success).toBe(false)
    })

    it("serverEnvSchema memvalidasi BACKEND_URL yang valid", () => {
      const parsed = serverEnvSchema.parse({
        BACKEND_URL: "http://localhost:4000",
      })

      expect(parsed.BACKEND_URL).toBe("http://localhost:4000")
    })

    it("serverEnvSchema menolak BACKEND_URL yang tidak valid", () => {
      const result = serverEnvSchema.safeParse({
        BACKEND_URL: "bukan-url",
      })

      expect(result.success).toBe(false)
    })
  })
})
