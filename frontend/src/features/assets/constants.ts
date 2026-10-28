import {
  ASSET_CATEGORIES,
  ASSET_STATUSES,
  type AssetCategory,
  type AssetStatus,
} from "./schema/asset.schema"

export { ASSET_CATEGORIES, ASSET_STATUSES, type AssetCategory, type AssetStatus }

/**
 * Pilihan opsi kategori aset untuk dropdown filter.
 */
export const ASSET_CATEGORY_OPTIONS = ASSET_CATEGORIES.map((category) => ({
  value: category,
  label: category,
}))

/**
 * Pilihan opsi status aset dengan label bahasa Indonesia yang ramah pengguna.
 */
export const ASSET_STATUS_OPTIONS = [
  { value: "available", label: "Tersedia" },
  { value: "assigned", label: "Digunakan" },
  { value: "maintenance", label: "Perbaikan" },
  { value: "retired", label: "Afkir" },
] as const

/**
 * Pilihan opsi filter penugasan (Assigned To).
 */
export const ASSET_ASSIGNED_OPTIONS = [
  { value: "assigned", label: "Sudah Ditugaskan" },
  { value: "unassigned", label: "Belum Ditugaskan" },
] as const
