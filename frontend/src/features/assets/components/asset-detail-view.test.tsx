import React from "react"
import { describe, it, expect, vi } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { AssetDetailView } from "./asset-detail-view"
import type { Asset } from "../types"

vi.mock("./asset-edit-dialog", () => ({
  AssetEditDialog: ({ trigger }: { trigger?: React.ReactNode }) => (
    <div data-testid="asset-edit-dialog-mock">{trigger || <button>Edit Aset</button>}</div>
  ),
}))

describe("AssetDetailView component (EMPTRACK-92)", () => {
  const dummyAsset: Asset = {
    id: "ast-1",
    assetTag: "AST-00001",
    name: "MacBook Pro 16 M3 Max",
    category: "Laptop",
    model: "M3 Max / 36GB RAM",
    serialNumber: "SN123456",
    status: "assigned",
    purchaseDate: "2024-03-01",
    purchaseCost: 35000000,
    assignedToId: "emp-42",
    assignedTo: {
      id: "emp-42",
      employeeNumber: "EMP-00042",
      fullName: "Siti Rahmawati",
      department: "Engineering",
      email: "siti.rahmawati@emptrack.test",
    },
    notes: "Laptop unit utama engineer",
  }

  it("merender informasi detail aset lengkap dan semantik", () => {
    const html = renderToStaticMarkup(<AssetDetailView asset={dummyAsset} />)

    // Heading utama
    expect(html).toContain("<h1")
    expect(html).toContain("MacBook Pro 16 M3 Max</h1>")

    // Navigasi Kembali
    expect(html).toContain('<nav aria-label="Back navigation"')
    expect(html).toContain("Kembali ke Daftar Aset")

    // Badges & Tag
    expect(html).toContain("AST-00001")
    expect(html).toContain("Laptop")
    expect(html).toContain("Assigned")

    // Spesifikasi Hardware
    expect(html).toContain("Hardware &amp; Identitas Teknis")
    expect(html).toContain("M3 Max / 36GB RAM")
    expect(html).toContain("SN123456")

    // Finansial
    expect(html).toContain("Data Pengadaan &amp; Catatan")
    expect(html).toContain("35.000.000")
    expect(html).toContain('<time dateTime="2024-03-01"')
    expect(html).toContain("Laptop unit utama engineer")

    // Tombol Edit
    expect(html).toContain("Edit Aset")
  })

  it("merender kartu informasi karyawan penerima jika aset ditugaskan (assigned)", () => {
    const html = renderToStaticMarkup(<AssetDetailView asset={dummyAsset} />)

    expect(html).toContain('data-testid="asset-assigned-info"')
    expect(html).toContain("Siti Rahmawati")
    expect(html).toContain('href="/employees/emp-42"')
    expect(html).toContain("EMP-00042")
    expect(html).toContain("Engineering")
    expect(html).toContain("siti.rahmawati@emptrack.test")
    expect(html).toContain("SR") // Initials
  })

  it("merender state unassigned jika aset belum memiliki karyawan penugasan", () => {
    const unassignedAsset: Asset = {
      ...dummyAsset,
      status: "available",
      assignedToId: null,
      assignedTo: null,
    }

    const html = renderToStaticMarkup(<AssetDetailView asset={unassignedAsset} />)

    expect(html).toContain('data-testid="asset-unassigned-info"')
    expect(html).toContain("Aset Belum Ditugaskan (Available)")
    expect(html).toContain("Tugaskan Aset Ini")
  })
})
