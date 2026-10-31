import React from "react"
import { describe, it, expect, vi } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { EmployeeDetailView } from "@/features/employees/components/employee-detail-view"
import { AssetDetailView } from "@/features/assets/components/asset-detail-view"
import type { Employee } from "@/features/employees/types"
import type { Asset } from "@/features/assets/types"
import { escapeHtml } from "@/lib/string"

vi.mock("@/features/employees/components/employee-edit-dialog", () => ({
  EmployeeEditDialog: ({ trigger }: { trigger?: React.ReactNode }) => (
    <div data-testid="employee-edit-dialog-mock">{trigger || <button>Edit Data</button>}</div>
  ),
}))

vi.mock("@/features/employees/components/employee-delete-dialog", () => ({
  EmployeeDeleteDialog: ({ trigger }: { trigger?: React.ReactNode }) => (
    <div data-testid="employee-delete-dialog-mock">{trigger || <button>Hapus Data</button>}</div>
  ),
}))

vi.mock("@/features/assets/components/asset-edit-dialog", () => ({
  AssetEditDialog: ({ trigger }: { trigger?: React.ReactNode }) => (
    <div data-testid="asset-edit-dialog-mock">{trigger || <button>Edit Aset</button>}</div>
  ),
}))

vi.mock("@/features/assets/components/asset-delete-dialog", () => ({
  AssetDeleteDialog: ({ trigger }: { trigger?: React.ReactNode }) => (
    <div data-testid="asset-delete-dialog-mock">{trigger || <button>Hapus Aset</button>}</div>
  ),
}))

vi.mock("@/features/assets/components", () => ({
  EmployeeAssignedAssets: () => <div data-testid="employee-assigned-assets-mock" />,
}))

describe("XSS Prevention and Output Escaping Security Tests (EMPTRACK-111)", () => {
  describe("React Output Escaping in EmployeeDetailView", () => {
    const maliciousEmployee: Employee = {
      id: "emp-malicious-1",
      employeeNumber: "EMP-00666",
      fullName: "<script>alert('xss-employee-name')</script>",
      email: "security.test@emptrack.internal",
      phone: "081234567890",
      department: "<img src=x onerror=alert('xss-dept')>",
      position: "<svg onload=alert('xss-pos')>",
      status: "active",
      hireDate: "2024-01-01",
      isManager: false,
      managerId: null,
      projectId: "proj-1",
    }

    it("meng-escape payload script berbahaya pada nama karyawan dan tidak merender tag script mentah", () => {
      const html = renderToStaticMarkup(<EmployeeDetailView employee={maliciousEmployee} />)

      // Pastikan tag script TIDAK pernah muncul dalam bentuk tag mentah executable
      expect(html).not.toContain("<script>alert('xss-employee-name')</script>")
      // Pastikan di-escape menjadi entitas teks HTML yang aman
      expect(html).toContain("&lt;script&gt;alert(&#x27;xss-employee-name&#x27;)&lt;/script&gt;")
    })

    it("meng-escape payload img onerror pada department dan tidak mengeksekusi atribut event handler", () => {
      const html = renderToStaticMarkup(<EmployeeDetailView employee={maliciousEmployee} />)

      // Pastikan tidak ada tag <img> berbahaya yang dieksekusi browser
      expect(html).not.toContain("<img src=x onerror=")
      // Harus di-escape ke entitas aman
      expect(html).toContain("&lt;img src=x onerror=alert(&#x27;xss-dept&#x27;)&gt;")
    })

    it("meng-escape payload svg onload pada position", () => {
      const html = renderToStaticMarkup(<EmployeeDetailView employee={maliciousEmployee} />)

      expect(html).not.toContain("<svg onload=")
      expect(html).toContain("&lt;svg onload=alert(&#x27;xss-pos&#x27;)&gt;")
    })
  })

  describe("React Output Escaping in AssetDetailView", () => {
    const maliciousAsset: Asset = {
      id: "ast-xss-1",
      assetTag: "AST-99999",
      name: "<script>window.location='https://attacker.site'</script>",
      category: "Laptop",
      model: "<iframe src='javascript:alert(1)'></iframe>",
      serialNumber: 'SN-99999"><script>alert(1)</script>',
      status: "available",
      purchaseDate: "2024-01-01",
      purchaseCost: 15000000,
      assignedToId: null,
      notes: "Catatan: <b onmouseover=\"alert('xss')\">Hover Me</b>",
    }

    it("meng-escape payload script berbahaya pada nama aset", () => {
      const html = renderToStaticMarkup(<AssetDetailView asset={maliciousAsset} />)

      expect(html).not.toContain("<script>window.location=")
      expect(html).toContain(
        "&lt;script&gt;window.location=&#x27;https://attacker.site&#x27;&lt;/script&gt;",
      )
    })

    it("meng-escape tag iframe dan model berbahaya", () => {
      const html = renderToStaticMarkup(<AssetDetailView asset={maliciousAsset} />)

      expect(html).not.toContain("<iframe")
      expect(html).toContain("&lt;iframe src=&#x27;javascript:alert(1)&#x27;&gt;&lt;/iframe&gt;")
    })

    it("meng-escape serial number dan catatan tanpa mengeksekusi tag b atau event handler onmouseover", () => {
      const html = renderToStaticMarkup(<AssetDetailView asset={maliciousAsset} />)

      expect(html).not.toContain("<b onmouseover=")
      expect(html).toContain(
        "&lt;b onmouseover=&quot;alert(&#x27;xss&#x27;)&quot;&gt;Hover Me&lt;/b&gt;",
      )
    })
  })

  describe("Manual HTML Escaping Helper (escapeHtml)", () => {
    it("menetralisir seluruh vektor karakter injeksi HTML", () => {
      const payload = `<script>alert('xss & "quotes"')</script>`
      const escaped = escapeHtml(payload)

      expect(escaped).toBe(
        "&lt;script&gt;alert(&#039;xss &amp; &quot;quotes&quot;&#039;)&lt;/script&gt;",
      )
      expect(escaped).not.toContain("<")
      expect(escaped).not.toContain(">")
      expect(escaped).not.toContain('"')
      expect(escaped).not.toContain("'")
    })
  })
})
