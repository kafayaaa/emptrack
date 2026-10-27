import { z } from "zod"

/**
 * Daftar kategori aset yang didukung dalam sistem EmpTrack.
 */
export const ASSET_CATEGORIES = [
  "Laptop",
  "Monitor",
  "Peripheral",
  "Mobile Device",
  "Furniture",
  "Vehicle",
  "Other",
] as const

export type AssetCategory = (typeof ASSET_CATEGORIES)[number]

/**
 * Status lifecycle dari sebuah aset inventaris.
 */
export const ASSET_STATUSES = ["available", "assigned", "maintenance", "retired"] as const

export type AssetStatus = (typeof ASSET_STATUSES)[number]

/**
 * Kolom yang diizinkan untuk pengurutan data aset (whitelist sorting).
 */
export const ASSET_SORT_FIELDS = [
  "assetTag",
  "name",
  "category",
  "model",
  "status",
  "purchaseDate",
  "purchaseCost",
] as const

export type AssetSortField = (typeof ASSET_SORT_FIELDS)[number]

/**
 * Schema ringkasan data karyawan penerima aset (relasi assigned-to).
 */
export const assetAssignedEmployeeSchema = z.object({
  id: z.string(),
  employeeNumber: z.string(),
  fullName: z.string(),
  department: z.string(),
  email: z.string().email(),
})

export type AssetAssignedEmployee = z.infer<typeof assetAssignedEmployeeSchema>

/**
 * Schema utama data aset inventaris (EMPTRACK-86).
 * Merepresentasikan entity asset di database/upstream dan response API.
 */
export const assetSchema = z.object({
  id: z.string(),
  assetTag: z.string(),
  name: z.string(),
  category: z.enum(ASSET_CATEGORIES),
  model: z.string(),
  serialNumber: z.string(),
  status: z.enum(ASSET_STATUSES),
  purchaseDate: z.string(), // ISO format YYYY-MM-DD
  purchaseCost: z.number().nonnegative(),
  assignedToId: z.string().nullable(),
  assignedAt: z.string().nullable().optional(),
  assignedTo: assetAssignedEmployeeSchema.nullable().optional(),
  notes: z.string().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export type Asset = z.infer<typeof assetSchema>

/**
 * Schema query string parameter untuk filtering, searching, sorting,
 * dan pagination pada list aset.
 */
export const assetListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().min(1).max(100).optional(),
  sortBy: z.enum(ASSET_SORT_FIELDS).optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  category: z.enum(ASSET_CATEGORIES).optional(),
  status: z.enum(ASSET_STATUSES).optional(),
  assignedToId: z.string().optional(),
})

export type AssetListQuery = z.infer<typeof assetListQuerySchema>
export type AssetListInputQuery = z.input<typeof assetListQuerySchema>

/**
 * Schema parsing response mentah pagination dari json-server upstream.
 */
export const jsonServerAssetListSchema = z.object({
  items: z.number().int().nonnegative(),
  pages: z.number().int().nonnegative(),
  data: z.array(assetSchema),
})

export type JsonServerAssetList = z.infer<typeof jsonServerAssetListSchema>

/**
 * Kontrak response list data aset yang dikonsumsi oleh frontend.
 */
export type AssetListResponse = {
  data: Asset[]
  meta: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}
