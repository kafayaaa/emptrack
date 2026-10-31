import { z } from "zod"

/**
 * Menghapus null bytes (\0) dari teks masukan.
 */
export function sanitizeText(val: string): string {
  return val.replace(/\0/g, "").trim()
}

/**
 * Schema Zod untuk memvalidasi dan mensanitasi parameter ID pada route Next.js ([id]).
 * Memastikan ID non-empty, tidak mengandung whitespace tersembunyi, null byte,
 * path traversal (..), dan memiliki batas panjang yang aman (maks 50 karakter).
 */
export const routeIdSchema = z
  .string({ error: "ID wajib diisi" })
  .trim()
  .min(1, "ID tidak boleh kosong")
  .max(50, "ID maksimal 50 karakter")
  .regex(/^[A-Za-z0-9_-]+$/, "Format ID hanya boleh berupa alfanumerik, dash, atau underscore")

export const routeIdParamsSchema = z.object({
  id: routeIdSchema,
})

export type RouteIdParams = z.infer<typeof routeIdParamsSchema>
