import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { NextRequest } from "next/server"
import { z } from "zod"
import { employeeFormSchema } from "@/features/employees/schema/employee-form.schema"
import { assetFormSchema } from "@/features/assets/schema/asset-form.schema"
import { employeeListQuerySchema } from "@/features/employees/schema/employee.schema"
import { escapeHtml } from "@/lib/string"
import { POST as postEmployeeRoute } from "@/app/api/employees/route"
import { POST as postAssetRoute } from "@/app/api/assets/route"
import { GET as checkEmailRoute } from "@/app/api/employees/check-email/route"

vi.mock("@/env.server", () => ({
  serverEnv: {
    BACKEND_URL: "http://localhost:4000",
  },
}))

vi.mock("@/features/employees/api/employees.server", () => ({
  isEmployeeEmailUniqueServer: vi.fn().mockResolvedValue(true),
}))

/**
 * EMPTRACK-118: Manual Security Testing & Adversarial Penetration Test Suite
 *
 * Menguji ketahanan formulir, skema validasi, dan API route handlers terhadap:
 * 1. XSS Vectors (Script Injection, Event Handlers, Pseudo-protocols)
 * 2. SQL Injection & NoSQL Injection Payloads
 * 3. Boundary & Buffer Overflow (Ekstrem >10.000 karakter, Null Bytes)
 * 4. Prototype Pollution & Parameter Tampering (Mass Assignment)
 * 5. Type Juggling & Malformed Data Types
 * 6. Numeric & Financial Anomalies (Negative, NaN, Infinity)
 * 7. Temporal & Date Manipulation
 * 8. HTML Output Sanitization
 * 9. Route Handler Direct Penetration (POST /api/employees, POST /api/assets, GET check-email)
 */

describe("Manual Security Penetration & Adversarial Input Testing (EMPTRACK-118)", () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  // ---------------------------------------------------------------------------
  // 1. XSS PAYLOAD INJECTION
  // ---------------------------------------------------------------------------
  describe("1. XSS Vector Injections across Form Schemas", () => {
    const xssPayloads = [
      "<script>alert('XSS-1')</script>",
      "<img src=x onerror=alert('XSS-2')>",
      '"><script>alert(document.cookie)</script>',
      "javascript:alert(1)",
      "<svg onload=alert(1)>",
      "<iframe src=\"javascript:alert('XSS')\">",
      "<body onload=alert(1)>",
      "<a href=\"javascript:alert('xss')\">Click</a>",
      "';alert(String.fromCharCode(88,83,83))//",
    ]

    it("menolak seluruh varian XSS payload pada field employeeNumber", () => {
      for (const payload of xssPayloads) {
        const result = employeeFormSchema.safeParse({
          employeeNumber: payload,
          fullName: "John Doe",
          email: "john@emptrack.internal",
          phone: "081234567890",
          department: "Engineering",
          position: "Frontend Developer",
          status: "active",
          hireDate: "2024-01-01",
          isManager: false,
          projectId: "1",
        })

        expect(result.success).toBe(false)
        if (!result.success) {
          const fieldErrors = z.flattenError(result.error).fieldErrors
          expect(fieldErrors.employeeNumber).toBeDefined()
        }
      }
    })

    it("menolak seluruh varian XSS payload pada field fullName", () => {
      for (const payload of xssPayloads) {
        const result = employeeFormSchema.safeParse({
          employeeNumber: "EMP-00123",
          fullName: payload,
          email: "john@emptrack.internal",
          phone: "081234567890",
          department: "Engineering",
          position: "Frontend Developer",
          status: "active",
          hireDate: "2024-01-01",
          isManager: false,
          projectId: "1",
        })

        expect(result.success).toBe(false)
        if (!result.success) {
          const fieldErrors = z.flattenError(result.error).fieldErrors
          expect(fieldErrors.fullName).toBeDefined()
        }
      }
    })

    it("menolak XSS payload pada serialNumber aset", () => {
      for (const payload of xssPayloads) {
        const result = assetFormSchema.safeParse({
          name: "MacBook Pro M3",
          category: "Laptop",
          model: "Apple MacBook Pro 16",
          serialNumber: payload,
          status: "available",
          purchaseDate: "2024-01-01",
          purchaseCost: 35000000,
        })

        expect(result.success).toBe(false)
        if (!result.success) {
          const fieldErrors = z.flattenError(result.error).fieldErrors
          expect(fieldErrors.serialNumber).toBeDefined()
        }
      }
    })

    it("menolak XSS payload pada enum kategori atau status yang tidak terdaftar", () => {
      const maliciousStatusResult = assetFormSchema.safeParse({
        name: "MacBook Pro M3",
        category: "Laptop",
        model: "Apple MacBook Pro 16",
        serialNumber: "SN-MBP16-001",
        status: "<script>alert(1)</script>" as unknown as "available",
        purchaseDate: "2024-01-01",
        purchaseCost: 35000000,
      })

      expect(maliciousStatusResult.success).toBe(false)
      if (!maliciousStatusResult.success) {
        const fieldErrors = z.flattenError(maliciousStatusResult.error).fieldErrors
        expect(fieldErrors.status).toBeDefined()
      }
    })

    it("menolak tag HTML (< dan >) pada name dan model aset (EMPTRACK-119)", () => {
      const maliciousNameResult = assetFormSchema.safeParse({
        name: "<script>alert('xss')</script>",
        category: "Laptop",
        model: "Apple MacBook Pro 16",
        serialNumber: "SN-MBP16-001",
        status: "available",
        purchaseDate: "2024-01-01",
        purchaseCost: 35000000,
      })

      expect(maliciousNameResult.success).toBe(false)
      if (!maliciousNameResult.success) {
        const fieldErrors = z.flattenError(maliciousNameResult.error).fieldErrors
        expect(fieldErrors.name).toBeDefined()
      }

      const maliciousModelResult = assetFormSchema.safeParse({
        name: "MacBook Pro M3",
        category: "Laptop",
        model: "MacBook <iframe src=x>",
        serialNumber: "SN-MBP16-001",
        status: "available",
        purchaseDate: "2024-01-01",
        purchaseCost: 35000000,
      })

      expect(maliciousModelResult.success).toBe(false)
      if (!maliciousModelResult.success) {
        const fieldErrors = z.flattenError(maliciousModelResult.error).fieldErrors
        expect(fieldErrors.model).toBeDefined()
      }
    })
  })

  // ---------------------------------------------------------------------------
  // 2. SQL & NOSQL INJECTION ATTEMPTS
  // ---------------------------------------------------------------------------
  describe("2. SQL & NoSQL Injection Vectors", () => {
    const sqliPayloads = [
      "' OR '1'='1",
      "' OR 1=1 --",
      "admin' --",
      "'; DROP TABLE employees; --",
      "1' UNION SELECT null, email, password FROM users --",
      "1; WAITFOR DELAY '0:0:5'--",
      "1 AND 1=1",
      "SLEEP(5)/*",
    ]

    it("menolak SQL injection pada projectId karyawan (harus strictly integer string)", () => {
      for (const payload of sqliPayloads) {
        const result = employeeFormSchema.safeParse({
          employeeNumber: "EMP-00123",
          fullName: "John Doe",
          email: "john@emptrack.internal",
          phone: "081234567890",
          department: "Engineering",
          position: "Frontend Developer",
          status: "active",
          hireDate: "2024-01-01",
          isManager: false,
          projectId: payload,
        })

        expect(result.success).toBe(false)
        if (!result.success) {
          const fieldErrors = z.flattenError(result.error).fieldErrors
          expect(fieldErrors.projectId).toBeDefined()
        }
      }
    })

    it("menolak SQL injection pada email karyawan", () => {
      for (const payload of sqliPayloads) {
        const result = employeeFormSchema.safeParse({
          employeeNumber: "EMP-00123",
          fullName: "John Doe",
          email: `admin${payload}@perusahaan.com`,
          phone: "081234567890",
          department: "Engineering",
          position: "Frontend Developer",
          status: "active",
          hireDate: "2024-01-01",
          isManager: false,
          projectId: "1",
        })

        expect(result.success).toBe(false)
        if (!result.success) {
          const fieldErrors = z.flattenError(result.error).fieldErrors
          expect(fieldErrors.email).toBeDefined()
        }
      }
    })

    it("mengamankan query params pencarian dan sanitasi filter karyawan", () => {
      const maliciousQuery = {
        page: "1",
        pageSize: "10",
        search: "' OR 1=1 --",
        sortBy: "fullName",
        sortOrder: "asc",
        isManager: "invalid-boolean",
      }

      const parsed = employeeListQuerySchema.safeParse(maliciousQuery)
      expect(parsed.success).toBe(false)
      if (!parsed.success) {
        const errors = z.flattenError(parsed.error).fieldErrors
        expect(errors.isManager).toBeDefined()
      }
    })

    it("menolak filter yang tidak di-whitelist pada employeeListQuerySchema", () => {
      const maliciousFilter = {
        department: "Engineering",
        __proto__: { isAdmin: true },
        $where: "function() { return true; }",
      }

      const parsed = employeeListQuerySchema.safeParse(maliciousFilter)
      expect(parsed.success).toBe(true)
      if (parsed.success) {
        // Zod strips untrusted keys
        expect((parsed.data as Record<string, unknown>).$where).toBeUndefined()
        expect(Object.prototype.hasOwnProperty.call(parsed.data, "$where")).toBe(false)
      }
    })
  })

  // ---------------------------------------------------------------------------
  // 3. BOUNDARY OVERFLOW & NULL BYTES
  // ---------------------------------------------------------------------------
  describe("3. Boundary Overflow & Null Byte Injections", () => {
    it("menolak string raksasa (>10.000 karakter) untuk mencegah ReDoS dan Buffer/Memory exhaustion", () => {
      const hugeString = "A".repeat(10000)

      const result = employeeFormSchema.safeParse({
        employeeNumber: "EMP-00123",
        fullName: hugeString,
        email: "test@emptrack.internal",
        phone: "081234567890",
        department: "Engineering",
        position: "Frontend Developer",
        status: "active",
        hireDate: "2024-01-01",
        isManager: false,
        projectId: "1",
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const fieldErrors = z.flattenError(result.error).fieldErrors
        expect(fieldErrors.fullName).toBeDefined()
      }
    })

    it("menolak null byte (\\0) injection pada managerId dan nama aset", () => {
      const maliciousEmployee = employeeFormSchema.safeParse({
        employeeNumber: "EMP-00123",
        fullName: "John Doe",
        email: "john@emptrack.internal",
        phone: "081234567890",
        department: "Engineering",
        position: "Frontend Developer",
        status: "active",
        hireDate: "2024-01-01",
        isManager: false,
        managerId: "EMP-00001\0malicious",
        projectId: "1",
      })

      expect(maliciousEmployee.success).toBe(false)
      if (!maliciousEmployee.success) {
        const fieldErrors = z.flattenError(maliciousEmployee.error).fieldErrors
        expect(fieldErrors.managerId).toBeDefined()
      }

      const maliciousAsset = assetFormSchema.safeParse({
        name: "MacBook Pro\0Injected",
        category: "Laptop",
        model: "Apple M3",
        serialNumber: "SN-12345",
        status: "available",
        purchaseDate: "2024-01-01",
        purchaseCost: 25000000,
      })

      expect(maliciousAsset.success).toBe(false)
      if (!maliciousAsset.success) {
        const fieldErrors = z.flattenError(maliciousAsset.error).fieldErrors
        expect(fieldErrors.name).toBeDefined()
      }
    })

    it("menolak zero-width characters (\\u200B) pada managerId, name, model, dan notes (EMPTRACK-119)", () => {
      const zeroWidthEmployee = employeeFormSchema.safeParse({
        employeeNumber: "EMP-00123",
        fullName: "John Doe",
        email: "john@emptrack.internal",
        phone: "081234567890",
        department: "Engineering",
        position: "Frontend Developer",
        status: "active",
        hireDate: "2024-01-01",
        isManager: false,
        managerId: "EMP-00001\u200Bhidden",
        projectId: "1",
      })

      expect(zeroWidthEmployee.success).toBe(false)
      if (!zeroWidthEmployee.success) {
        const fieldErrors = z.flattenError(zeroWidthEmployee.error).fieldErrors
        expect(fieldErrors.managerId).toBeDefined()
      }

      const zeroWidthAsset = assetFormSchema.safeParse({
        name: "Dell XPS\u200B15",
        category: "Laptop",
        model: "Core\u200Bi7",
        serialNumber: "SN-DELL-001",
        status: "available",
        purchaseDate: "2024-01-01",
        purchaseCost: 20000000,
        notes: "Catatan\u200Ctersembunyi",
      })

      expect(zeroWidthAsset.success).toBe(false)
      if (!zeroWidthAsset.success) {
        const fieldErrors = z.flattenError(zeroWidthAsset.error).fieldErrors
        expect(fieldErrors.name).toBeDefined()
        expect(fieldErrors.model).toBeDefined()
        expect(fieldErrors.notes).toBeDefined()
      }
    })
  })

  // ---------------------------------------------------------------------------
  // 4. PROTOTYPE POLLUTION & PARAMETER TAMPERING (MASS ASSIGNMENT)
  // ---------------------------------------------------------------------------
  describe("4. Prototype Pollution & Parameter Tampering", () => {
    it("menolak parameter tampering / privilege escalation pada input karyawan", () => {
      const payloadWithPrivileges = {
        employeeNumber: "EMP-00123",
        fullName: "John Doe",
        email: "john@emptrack.internal",
        phone: "081234567890",
        department: "Engineering",
        position: "Frontend Developer",
        status: "active",
        hireDate: "2024-01-01",
        isManager: false,
        projectId: "1",
        // Field liar / penyerangan hak akses:
        role: "SUPERADMIN",
        isAdmin: true,
        permissions: ["all", "root"],
        passwordHash: "hacked",
      }

      const parsed = employeeFormSchema.safeParse(payloadWithPrivileges)
      expect(parsed.success).toBe(true)

      if (parsed.success) {
        const cleanData = parsed.data as Record<string, unknown>
        expect(cleanData.role).toBeUndefined()
        expect(cleanData.isAdmin).toBeUndefined()
        expect(cleanData.permissions).toBeUndefined()
        expect(cleanData.passwordHash).toBeUndefined()
      }
    })

    it("tidak membiarkan __proto__ mencemari Object.prototype bawaan", () => {
      const maliciousPayload = JSON.parse(
        '{"employeeNumber":"EMP-00123","fullName":"John Doe","email":"john@emptrack.internal","phone":"081234567890","department":"Engineering","position":"Frontend Developer","status":"active","hireDate":"2024-01-01","isManager":false,"projectId":"1","__proto__":{"isAdmin":true}}',
      )

      const parsed = employeeFormSchema.safeParse(maliciousPayload)
      expect(parsed.success).toBe(true)

      // Pastikan Object prototype global TIDAK tercemar
      const blankObj: Record<string, unknown> = {}
      expect((blankObj as { isAdmin?: boolean }).isAdmin).toBeUndefined()
    })
  })

  // ---------------------------------------------------------------------------
  // 5. TYPE JUGGLING & MALFORMED INPUTS
  // ---------------------------------------------------------------------------
  describe("5. Type Juggling & Malformed Data Types", () => {
    it("menolak objek JSON NoSQL-style operator ($gt, $ne) pada email", () => {
      const malformedPayload = {
        employeeNumber: "EMP-00123",
        fullName: "John Doe",
        email: { $ne: null } as unknown as string,
        phone: "081234567890",
        department: "Engineering",
        position: "Frontend Developer",
        status: "active",
        hireDate: "2024-01-01",
        isManager: false,
        projectId: "1",
      }

      const result = employeeFormSchema.safeParse(malformedPayload)
      expect(result.success).toBe(false)
      if (!result.success) {
        const fieldErrors = z.flattenError(result.error).fieldErrors
        expect(fieldErrors.email).toBeDefined()
      }
    })

    it("menolak boolean atau array pada field teks employeeNumber", () => {
      const resultBoolean = employeeFormSchema.safeParse({
        employeeNumber: true as unknown as string,
        fullName: "John Doe",
        email: "john@emptrack.internal",
        phone: "081234567890",
        department: "Engineering",
        position: "Frontend Developer",
        status: "active",
        hireDate: "2024-01-01",
        isManager: false,
        projectId: "1",
      })
      expect(resultBoolean.success).toBe(false)

      const resultArray = employeeFormSchema.safeParse({
        employeeNumber: ["EMP-001", "EMP-002"] as unknown as string,
        fullName: "John Doe",
        email: "john@emptrack.internal",
        phone: "081234567890",
        department: "Engineering",
        position: "Frontend Developer",
        status: "active",
        hireDate: "2024-01-01",
        isManager: false,
        projectId: "1",
      })
      expect(resultArray.success).toBe(false)
    })
  })

  // ---------------------------------------------------------------------------
  // 6. NUMERIC & FINANCIAL ANOMALIES
  // ---------------------------------------------------------------------------
  describe("6. Numeric Anomalies & Financial Tampering (purchaseCost)", () => {
    it("menolak biaya pembelian negatif pada aset", () => {
      const result = assetFormSchema.safeParse({
        name: "MacBook Pro",
        category: "Laptop",
        model: "Apple M3",
        serialNumber: "SN-12345",
        status: "available",
        purchaseDate: "2024-01-01",
        purchaseCost: -15000000,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const fieldErrors = z.flattenError(result.error).fieldErrors
        expect(fieldErrors.purchaseCost).toBeDefined()
      }
    })

    it("menolak biaya pembelian ekstrem yang melampaui limit wajar (> 1 triliun)", () => {
      const result = assetFormSchema.safeParse({
        name: "MacBook Pro",
        category: "Laptop",
        model: "Apple M3",
        serialNumber: "SN-12345",
        status: "available",
        purchaseDate: "2024-01-01",
        purchaseCost: 999_999_999_999_999,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const fieldErrors = z.flattenError(result.error).fieldErrors
        expect(fieldErrors.purchaseCost).toBeDefined()
      }
    })

    it("menolak string non-numeric dan NaN pada purchaseCost", () => {
      const result = assetFormSchema.safeParse({
        name: "MacBook Pro",
        category: "Laptop",
        model: "Apple M3",
        serialNumber: "SN-12345",
        status: "available",
        purchaseDate: "2024-01-01",
        purchaseCost: "GRATIS" as unknown as number,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const fieldErrors = z.flattenError(result.error).fieldErrors
        expect(fieldErrors.purchaseCost).toBeDefined()
      }
    })
  })

  // ---------------------------------------------------------------------------
  // 7. TEMPORAL & DATE MANIPULATION
  // ---------------------------------------------------------------------------
  describe("7. Temporal & Date Manipulation", () => {
    it("menolak tanggal palsu, format invalid, dan date rollover (EMPTRACK-119)", () => {
      const invalidDateEmployees = [
        "31-12-2024",
        "2024/01/01",
        "invalid-date",
        "1960-01-01", // Tahun di bawah batas minimal (1970)
        "2099-01-01", // Terlalu jauh di masa depan (> 1 tahun)
        "2024-02-31", // Date rollover: 31 Februari tidak ada
        "2023-02-29", // Date rollover: 2023 bukan kabisat
        "2024-04-31", // Date rollover: April hanya 30 hari
      ]

      for (const dateStr of invalidDateEmployees) {
        const result = employeeFormSchema.safeParse({
          employeeNumber: "EMP-00123",
          fullName: "John Doe",
          email: "john@emptrack.internal",
          phone: "081234567890",
          department: "Engineering",
          position: "Frontend Developer",
          status: "active",
          hireDate: dateStr,
          isManager: false,
          projectId: "1",
        })

        expect(result.success).toBe(false)
        if (!result.success) {
          const fieldErrors = z.flattenError(result.error).fieldErrors
          expect(fieldErrors.hireDate).toBeDefined()
        }
      }
    })

    it("menolak tanggal pembelian aset yang mengalami rollover (EMPTRACK-119)", () => {
      const result = assetFormSchema.safeParse({
        name: "MacBook Pro",
        category: "Laptop",
        model: "Apple M3",
        serialNumber: "SN-MBP16-001",
        status: "available",
        purchaseDate: "2024-02-31", // Tanggal tidak sah di kalender
        purchaseCost: 35000000,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const fieldErrors = z.flattenError(result.error).fieldErrors
        expect(fieldErrors.purchaseDate).toBeDefined()
      }
    })
  })

  // ---------------------------------------------------------------------------
  // 8. ESCAPING & STRING ENCODING VERIFICATION
  // ---------------------------------------------------------------------------
  describe("8. Output Sanitization & Entity Encoding", () => {
    it("menjamin seluruh karakter berbahaya (<, >, \", ', &) terkonversi aman oleh escapeHtml", () => {
      const rawAttacks = [
        "<script>alert(1)</script>",
        "Hello & Welcome",
        `" onload="alert(1)`,
        `' onmouseover='alert(2)`,
      ]

      for (const attack of rawAttacks) {
        const sanitized = escapeHtml(attack)
        expect(sanitized).not.toContain("<")
        expect(sanitized).not.toContain(">")
        expect(sanitized).not.toContain('"')
        expect(sanitized).not.toContain("'")
      }
    })
  })

  // ---------------------------------------------------------------------------
  // 9. ROUTE HANDLER DIRECT ADVERSARIAL PENETRATION
  // ---------------------------------------------------------------------------
  describe("9. Route Handler Penetration (POST /api/employees & /api/assets)", () => {
    it("menolak POST /api/employees dengan payload JSON yang rusak (400 INVALID_JSON)", async () => {
      const req = new NextRequest("http://localhost:3000/api/employees", {
        method: "POST",
        body: "{malformed-json: true",
        headers: { "Content-Type": "application/json" },
      })

      const res = await postEmployeeRoute(req)
      expect(res.status).toBe(400)
      const data = await res.json()
      expect(data.error.code).toBe("INVALID_JSON")
    })

    it("menolak POST /api/employees yang berisi XSS payload pada nama lengkap (400 INVALID_BODY)", async () => {
      const req = new NextRequest("http://localhost:3000/api/employees", {
        method: "POST",
        body: JSON.stringify({
          employeeNumber: "EMP-00123",
          fullName: "<script>alert('xss')</script>",
          email: "attacker@test.internal",
          phone: "081234567890",
          department: "Engineering",
          position: "Frontend Developer",
          status: "active",
          hireDate: "2024-01-01",
          isManager: false,
          projectId: "1",
        }),
        headers: { "Content-Type": "application/json" },
      })

      const res = await postEmployeeRoute(req)
      expect(res.status).toBe(400)
      const data = await res.json()
      expect(data.error.code).toBe("INVALID_BODY")
      expect(data.error.details.fullName).toBeDefined()
    })

    it("menolak POST /api/assets dengan status assigned tanpa ID penerima (400 INVALID_BODY)", async () => {
      const req = new NextRequest("http://localhost:3000/api/assets", {
        method: "POST",
        body: JSON.stringify({
          name: "MacBook Pro",
          category: "Laptop",
          model: "Apple M3",
          serialNumber: "SN-MBP16-001",
          status: "assigned", // wajib ada assignedToId
          assignedToId: "",
          purchaseDate: "2024-01-01",
          purchaseCost: 35000000,
        }),
        headers: { "Content-Type": "application/json" },
      })

      const res = await postAssetRoute(req)
      expect(res.status).toBe(400)
      const data = await res.json()
      expect(data.error.code).toBe("INVALID_BODY")
      expect(data.error.details.assignedToId).toBeDefined()
    })

    it("menolak GET /api/employees/check-email dengan XSS payload pada parameter query", async () => {
      const xssEmail = encodeURIComponent("<script>alert('email-xss')</script>")
      const req = new NextRequest(
        `http://localhost:3000/api/employees/check-email?email=${xssEmail}`,
      )

      const res = await checkEmailRoute(req)
      expect(res.status).toBe(400)
      const data = await res.json()
      expect(data.error.code).toBe("INVALID_QUERY")
    })
  })
})
