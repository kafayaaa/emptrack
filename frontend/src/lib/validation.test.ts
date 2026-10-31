import { describe, it, expect } from "vitest"
import { sanitizeText, routeIdSchema, routeIdParamsSchema } from "./validation"

describe("sanitizeText", () => {
  it("menghapus null bytes dan memotong whitespace di awal/akhir", () => {
    const raw = "  halo\0dunia  "
    expect(sanitizeText(raw)).toBe("halodunia")
  })

  it("mengembalikan teks normal tanpa perubahan", () => {
    expect(sanitizeText("EmpTrack 2026")).toBe("EmpTrack 2026")
  })
})

describe("routeIdSchema & routeIdParamsSchema", () => {
  it("berhasil memvalidasi ID valid (alfanumerik, dash, underscore)", () => {
    expect(routeIdSchema.safeParse("123").success).toBe(true)
    expect(routeIdSchema.safeParse("EMP-00123").success).toBe(true)
    expect(routeIdSchema.safeParse("asset_456").success).toBe(true)
    expect(routeIdParamsSchema.safeParse({ id: "101" }).success).toBe(true)
  })

  it("menolak ID kosong atau hanya whitespace", () => {
    expect(routeIdSchema.safeParse("").success).toBe(false)
    expect(routeIdSchema.safeParse("   ").success).toBe(false)
    expect(routeIdParamsSchema.safeParse({ id: " " }).success).toBe(false)
  })

  it("menolak ID melebihi 50 karakter", () => {
    const longId = "a".repeat(51)
    expect(routeIdSchema.safeParse(longId).success).toBe(false)
  })

  it("menolak karakter berbahaya seperti path traversal (..) atau simbol aneh", () => {
    expect(routeIdSchema.safeParse("../admin").success).toBe(false)
    expect(routeIdSchema.safeParse("<script>").success).toBe(false)
    expect(routeIdSchema.safeParse("id with spaces").success).toBe(false)
    expect(routeIdSchema.safeParse("id' OR '1'='1").success).toBe(false)
  })
})
