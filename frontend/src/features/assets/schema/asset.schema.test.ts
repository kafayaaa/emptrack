import { describe, expect, it } from "vitest"
import {
  assetSchema,
  assetAssignedEmployeeSchema,
  assetListQuerySchema,
  jsonServerAssetListSchema,
  ASSET_CATEGORIES,
  ASSET_STATUSES,
  ASSET_SORT_FIELDS,
  type Asset,
} from "./asset.schema"

describe("assetSchema (EMPTRACK-86)", () => {
  const validAsset: Asset = {
    id: "ast-1",
    assetTag: "AST-00001",
    name: "MacBook Pro 16",
    category: "Laptop",
    model: "M3 Max, 36GB RAM, 1TB SSD",
    serialNumber: "C02XYZ123456",
    status: "available",
    purchaseDate: "2024-03-01",
    purchaseCost: 35000000,
    assignedToId: null,
    assignedAt: null,
    assignedTo: null,
    notes: "Unit baru untuk divisi engineering",
    createdAt: "2024-03-01T10:00:00Z",
    updatedAt: "2024-03-01T10:00:00Z",
  }

  it("berhasil memvalidasi data aset yang valid", () => {
    const result = assetSchema.safeParse(validAsset)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.assetTag).toBe("AST-00001")
      expect(result.data.category).toBe("Laptop")
    }
  })

  it("berhasil memvalidasi aset dengan assignedTo (relasi karyawan)", () => {
    const assignedAsset = {
      ...validAsset,
      status: "assigned" as const,
      assignedToId: "emp-101",
      assignedAt: "2024-03-10",
      assignedTo: {
        id: "emp-101",
        employeeNumber: "EMP-00101",
        fullName: "Budi Santoso",
        department: "Engineering",
        email: "budi.santoso@emptrack.test",
      },
    }

    const result = assetSchema.safeParse(assignedAsset)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.assignedTo?.fullName).toBe("Budi Santoso")
      expect(result.data.status).toBe("assigned")
    }
  })

  it("gagal validasi jika kategori di luar ASSET_CATEGORIES", () => {
    const invalidAsset = { ...validAsset, category: "UnknownDevice" }
    const result = assetSchema.safeParse(invalidAsset)
    expect(result.success).toBe(false)
  })

  it("gagal validasi jika status di luar ASSET_STATUSES", () => {
    const invalidAsset = { ...validAsset, status: "broken" }
    const result = assetSchema.safeParse(invalidAsset)
    expect(result.success).toBe(false)
  })

  it("gagal validasi jika purchaseCost bernilai negatif", () => {
    const invalidAsset = { ...validAsset, purchaseCost: -5000 }
    const result = assetSchema.safeParse(invalidAsset)
    expect(result.success).toBe(false)
  })

  it("gagal validasi jika field wajib seperti assetTag atau name hilang", () => {
    const { assetTag: _, ...missingTag } = validAsset
    expect(assetSchema.safeParse(missingTag).success).toBe(false)

    const { name: __, ...missingName } = validAsset
    expect(assetSchema.safeParse(missingName).success).toBe(false)
  })
})

describe("assetAssignedEmployeeSchema", () => {
  it("berhasil memvalidasi info karyawan assigned yang valid", () => {
    const validAssigned = {
      id: "emp-1",
      employeeNumber: "EMP-00001",
      fullName: "Siti Rahma",
      department: "Finance",
      email: "siti.rahma@emptrack.test",
    }
    const result = assetAssignedEmployeeSchema.safeParse(validAssigned)
    expect(result.success).toBe(true)
  })

  it("gagal validasi jika email karyawan tidak valid", () => {
    const invalidAssigned = {
      id: "emp-1",
      employeeNumber: "EMP-00001",
      fullName: "Siti Rahma",
      department: "Finance",
      email: "not-an-email",
    }
    const result = assetAssignedEmployeeSchema.safeParse(invalidAssigned)
    expect(result.success).toBe(false)
  })
})

describe("assetListQuerySchema", () => {
  it("mengisi default page=1, pageSize=20, dan sortOrder=asc jika query kosong", () => {
    const result = assetListQuerySchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.pageSize).toBe(20)
      expect(result.data.sortOrder).toBe("asc")
    }
  })

  it("melakukan coerce tipe data number dari query string URL", () => {
    const result = assetListQuerySchema.safeParse({
      page: "3",
      pageSize: "50",
      search: "ThinkPad",
      sortOrder: "desc",
      category: "Laptop",
      status: "available",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(3)
      expect(result.data.pageSize).toBe(50)
      expect(result.data.search).toBe("ThinkPad")
      expect(result.data.category).toBe("Laptop")
    }
  })

  it("menolak pageSize lebih besar dari 100", () => {
    const result = assetListQuerySchema.safeParse({ pageSize: 500 })
    expect(result.success).toBe(false)
  })

  it("menerima kolom sorting yang ada pada ASSET_SORT_FIELDS", () => {
    for (const field of ASSET_SORT_FIELDS) {
      const result = assetListQuerySchema.safeParse({ sortBy: field })
      expect(result.success).toBe(true)
    }
  })

  it("menolak kolom sorting di luar ASSET_SORT_FIELDS", () => {
    const result = assetListQuerySchema.safeParse({ sortBy: "unknownField" })
    expect(result.success).toBe(false)
  })

  it("memvalidasi dan mensanitasi parameter assignedToId (EMPTRACK-110)", () => {
    const valid = assetListQuerySchema.safeParse({ assignedToId: "  EMP-101  " })
    expect(valid.success).toBe(true)
    if (valid.success) {
      expect(valid.data.assignedToId).toBe("EMP-101")
    }

    const empty = assetListQuerySchema.safeParse({ assignedToId: "" })
    expect(empty.success).toBe(true)
    if (empty.success) {
      expect(empty.data.assignedToId).toBeUndefined()
    }

    const tooLong = assetListQuerySchema.safeParse({ assignedToId: "a".repeat(51) })
    expect(tooLong.success).toBe(false)
  })
})

describe("jsonServerAssetListSchema", () => {
  it("berhasil memvalidasi response pagination upstream json-server", () => {
    const mockResponse = {
      items: 100,
      pages: 5,
      data: [
        {
          id: "ast-1",
          assetTag: "AST-00001",
          name: "Dell UltraSharp 27",
          category: "Monitor",
          model: "U2723QE 4K",
          serialNumber: "DL12345678",
          status: "available",
          purchaseDate: "2024-01-10",
          purchaseCost: 8500000,
          assignedToId: null,
        },
      ],
    }
    const result = jsonServerAssetListSchema.safeParse(mockResponse)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.items).toBe(100)
      expect(result.data.data).toHaveLength(1)
    }
  })
})

describe("Constants", () => {
  it("memiliki daftar kategori dan status aset yang lengkap", () => {
    expect(ASSET_CATEGORIES).toContain("Laptop")
    expect(ASSET_CATEGORIES).toContain("Monitor")
    expect(ASSET_STATUSES).toContain("available")
    expect(ASSET_STATUSES).toContain("assigned")
  })
})
