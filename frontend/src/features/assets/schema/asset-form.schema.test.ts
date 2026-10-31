import { describe, expect, it } from "vitest"
import { assetFormSchema, type AssetFormValues } from "./asset-form.schema"

describe("assetFormSchema (EMPTRACK-86 / EMPTRACK-91)", () => {
  const validFormData: AssetFormValues = {
    name: "ThinkPad T14 Gen 4",
    category: "Laptop",
    model: "Core i7 / 32GB RAM / 1TB SSD",
    serialNumber: "TP14-987654",
    status: "available",
    purchaseDate: "2024-02-15",
    purchaseCost: 22000000,
    assignedToId: null,
    notes: "Unit cadangan IT",
  }

  it("berhasil memvalidasi form aset yang valid saat status available tanpa assignedToId", () => {
    const result = assetFormSchema.safeParse(validFormData)
    expect(result.success).toBe(true)
  })

  it("berhasil memvalidasi form aset saat status assigned dan assignedToId terisi", () => {
    const assignedForm = {
      ...validFormData,
      status: "assigned" as const,
      assignedToId: "emp-55",
    }
    const result = assetFormSchema.safeParse(assignedForm)
    expect(result.success).toBe(true)
  })

  it("gagal validasi jika status assigned namun assignedToId kosong atau null", () => {
    const invalidForm = {
      ...validFormData,
      status: "assigned" as const,
      assignedToId: null,
    }
    const result = assetFormSchema.safeParse(invalidForm)
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes("assignedToId"))
      expect(issue).toBeDefined()
      expect(issue?.message).toContain("wajib memiliki karyawan penerima")
    }
  })

  it("gagal validasi jika nama aset kurang dari 3 karakter", () => {
    const invalidForm = { ...validFormData, name: "PC" }
    const result = assetFormSchema.safeParse(invalidForm)
    expect(result.success).toBe(false)
  })

  it("gagal validasi jika format tanggal bukan YYYY-MM-DD", () => {
    const invalidForm = { ...validFormData, purchaseDate: "15-02-2024" }
    const result = assetFormSchema.safeParse(invalidForm)
    expect(result.success).toBe(false)
  })

  it("gagal validasi jika biaya pembelian negatif", () => {
    const invalidForm = { ...validFormData, purchaseCost: -100 }
    const result = assetFormSchema.safeParse(invalidForm)
    expect(result.success).toBe(false)
  })

  it("memungkinkan trim whitespace pada field teks", () => {
    const formWithSpaces = {
      ...validFormData,
      name: "   Logitech MX Master 3S   ",
      serialNumber: "   SN123456   ",
    }
    const result = assetFormSchema.safeParse(formWithSpaces)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe("Logitech MX Master 3S")
      expect(result.data.serialNumber).toBe("SN123456")
    }
  })

  it("gagal validasi jika terdapat karakter null byte pada name, model, atau notes (EMPTRACK-110)", () => {
    expect(assetFormSchema.safeParse({ ...validFormData, name: "ThinkPad\0T14" }).success).toBe(
      false,
    )
    expect(assetFormSchema.safeParse({ ...validFormData, model: "M3\0Pro" }).success).toBe(false)
    expect(assetFormSchema.safeParse({ ...validFormData, notes: "Unit\0Cadangan" }).success).toBe(
      false,
    )
  })

  it("gagal validasi jika purchaseCost melebihi Rp 1 triliun (EMPTRACK-110)", () => {
    expect(
      assetFormSchema.safeParse({ ...validFormData, purchaseCost: 1_000_000_000_001 }).success,
    ).toBe(false)
  })

  it("gagal validasi jika serialNumber mengandung karakter berbahaya/tidak diizinkan (EMPTRACK-110)", () => {
    expect(
      assetFormSchema.safeParse({ ...validFormData, serialNumber: "SN<script>" }).success,
    ).toBe(false)
    expect(
      assetFormSchema.safeParse({ ...validFormData, serialNumber: "SN' OR 1=1" }).success,
    ).toBe(false)
  })
})
