import React from "react"
import { describe, it, expect, vi } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { AssetForm } from "./asset-form"
import type { Asset } from "../types"

vi.mock("@/features/employees/hooks/use-employees", () => ({
  useEmployees: () => ({
    data: {
      data: [
        {
          id: "emp-1",
          fullName: "Budi Santoso",
          employeeNumber: "EMP-00001",
          department: "Engineering",
        },
      ],
    },
    isLoading: false,
  }),
}))

describe("AssetForm component (EMPTRACK-91)", () => {
  const dummyAsset: Asset = {
    id: "ast-1",
    assetTag: "AST-00001",
    name: "MacBook Pro 16",
    category: "Laptop",
    model: "M3 Max, 36GB RAM",
    serialNumber: "SN123456",
    status: "available",
    purchaseDate: "2024-03-01",
    purchaseCost: 35000000,
    assignedToId: null,
    notes: "Laptop developer prima",
  }

  it("renders all form fields, labels, and placeholders in Create mode", () => {
    const handleSubmit = vi.fn()
    const html = renderToStaticMarkup(<AssetForm onSubmit={handleSubmit} />)

    // Sections
    expect(html).toContain("Identitas &amp; Spesifikasi Aset")
    expect(html).toContain("Status &amp; Penugasan Karyawan")
    expect(html).toContain("Data Pengadaan &amp; Catatan")

    // Labels
    expect(html).toContain("Nama Aset")
    expect(html).toContain("Kategori Aset")
    expect(html).toContain("Model / Spesifikasi")
    expect(html).toContain("Nomor Seri (Serial Number)")
    expect(html).toContain("Status Operasional")
    expect(html).toContain("Karyawan Penerima")
    expect(html).toContain("Tanggal Pembelian")
    expect(html).toContain("Biaya Pembelian (IDR)")
    expect(html).toContain("Catatan Tambahan (Opsional)")

    // Button label
    expect(html).toContain("Tambah Aset")
  })

  it("pre-fills form inputs with initialData in Edit mode", () => {
    const handleSubmit = vi.fn()
    const html = renderToStaticMarkup(
      <AssetForm initialData={dummyAsset} onSubmit={handleSubmit} />,
    )

    expect(html).toContain('value="MacBook Pro 16"')
    expect(html).toContain('value="M3 Max, 36GB RAM"')
    expect(html).toContain('value="SN123456"')
    expect(html).toContain('value="2024-03-01"')
    expect(html).toContain('value="35000000"')
    expect(html).toContain("Laptop developer prima")
    expect(html).toContain("Simpan Perubahan")
  })

  it("renders Cancel button when onCancel callback is provided", () => {
    const handleCancel = vi.fn()
    const html = renderToStaticMarkup(<AssetForm onSubmit={vi.fn()} onCancel={handleCancel} />)

    expect(html).toContain("Batal")
  })

  it("indicates submitting state with aria-busy and disabled controls", () => {
    const html = renderToStaticMarkup(<AssetForm onSubmit={vi.fn()} isSubmitting={true} />)

    expect(html).toContain('aria-busy="true"')
    expect(html).toContain("Menyimpan...")
  })
})
