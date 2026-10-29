import { z } from "zod"
import { ASSET_CATEGORIES, ASSET_STATUSES } from "./asset.schema"

/**
 * Schema dasar tanpa refinement silang agar bisa diturunkan (mis. .partial() untuk PATCH).
 */
export const baseAssetFormSchema = z.object({
  assetTag: z
    .string()
    .trim()
    .max(30, "Tag aset maksimal 30 karakter")
    .regex(/^[A-Za-z0-9-]*$/, "Format tag aset hanya boleh berisi huruf, angka, dan tanda hubung")
    .optional()
    .or(z.literal("")),
  name: z
    .string()
    .trim()
    .min(3, "Nama aset minimal 3 karakter")
    .max(100, "Nama aset maksimal 100 karakter"),
  category: z.enum(ASSET_CATEGORIES, {
    error: "Pilih kategori aset yang valid",
  }),
  model: z
    .string()
    .trim()
    .min(2, "Model/spesifikasi minimal 2 karakter")
    .max(100, "Model/spesifikasi maksimal 100 karakter"),
  serialNumber: z
    .string()
    .trim()
    .min(3, "Serial number minimal 3 karakter")
    .max(50, "Serial number maksimal 50 karakter"),
  status: z.enum(ASSET_STATUSES, {
    error: "Pilih status aset yang valid",
  }),
  purchaseDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD")
    .refine((val) => !isNaN(Date.parse(val)), "Tanggal pembelian tidak valid"),
  purchaseCost: z.coerce
    .number({ error: "Biaya pembelian harus berupa angka" })
    .min(0, "Biaya pembelian tidak boleh negatif"),
  assignedToId: z.string().trim().nullable().optional(),
  notes: z.string().trim().max(500, "Catatan maksimal 500 karakter").nullable().optional(),
})

/**
 * Schema validasi formulir Create & Edit Asset (EMPTRACK-86 / EMPTRACK-91).
 * Mengimplementasikan validasi relasi kondisional: jika status = 'assigned',
 * maka assignedToId wajib diisi.
 */
export const assetFormSchema = baseAssetFormSchema.refine(
  (data) => {
    if (data.status === "assigned") {
      return Boolean(data.assignedToId && data.assignedToId.length > 0)
    }
    return true
  },
  {
    message: "Aset dengan status 'assigned' wajib memiliki karyawan penerima",
    path: ["assignedToId"],
  },
)

export const patchAssetFormSchema = baseAssetFormSchema.partial()

export type AssetFormValues = z.infer<typeof assetFormSchema>
export type AssetFormInput = z.input<typeof assetFormSchema>

/**
 * Nilai default formulir aset untuk inisialisasi awal mode Create.
 */
export const defaultAssetFormValues: AssetFormInput = {
  assetTag: "",
  name: "",
  category: "Laptop",
  model: "",
  serialNumber: "",
  status: "available",
  purchaseDate: new Date().toISOString().split("T")[0],
  purchaseCost: 0,
  assignedToId: "",
  notes: "",
}
