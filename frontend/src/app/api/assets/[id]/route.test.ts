import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { NextRequest } from "next/server"
import { GET, PATCH, DELETE } from "./route"

vi.mock("@/env.server", () => ({
  serverEnv: {
    BACKEND_URL: "http://localhost:4000",
  },
}))

describe("GET /api/assets/[id]", () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  const mockAsset = {
    id: "101",
    assetTag: "AST-00101",
    name: "MacBook Pro 14",
    category: "Laptop",
    model: "Apple M3 Pro",
    serialNumber: "LAP-8K29AL1X",
    status: "available",
    purchaseDate: "2024-01-15",
    purchaseCost: 28000000,
    assignedToId: null,
    assignedAt: null,
    assignedTo: null,
    notes: null,
  }

  it("mengembalikan 400 INVALID_ID jika ID kosong", async () => {
    const request = new NextRequest("http://localhost:3000/api/assets/ ")
    const response = await GET(request, { params: Promise.resolve({ id: " " }) })

    expect(response.status).toBe(400)
    const json = await response.json()
    expect(json.error.code).toBe("INVALID_ID")
  })

  it("mengembalikan 404 NOT_FOUND jika aset tidak ditemukan", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    })

    const request = new NextRequest("http://localhost:3000/api/assets/999")
    const response = await GET(request, { params: Promise.resolve({ id: "999" }) })

    expect(response.status).toBe(404)
    const json = await response.json()
    expect(json.error.code).toBe("NOT_FOUND")
  })

  it("mengembalikan 200 dengan data aset dan header cache saat ditemukan", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockAsset,
    })

    const request = new NextRequest("http://localhost:3000/api/assets/101")
    const response = await GET(request, { params: Promise.resolve({ id: "101" }) })

    expect(response.status).toBe(200)
    expect(response.headers.get("Cache-Control")).toBe(
      "private, max-age=60, stale-while-revalidate=120",
    )
    const json = await response.json()
    expect(json.id).toBe("101")
    expect(json.name).toBe("MacBook Pro 14")
  })
})

describe("PATCH /api/assets/[id]", () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it("mengembalikan 400 INVALID_JSON jika body bukan JSON valid", async () => {
    const request = new NextRequest("http://localhost:3000/api/assets/101", {
      method: "PATCH",
      body: "not-json",
      headers: { "Content-Type": "application/json" },
    })
    const response = await PATCH(request, { params: Promise.resolve({ id: "101" }) })

    expect(response.status).toBe(400)
    const json = await response.json()
    expect(json.error.code).toBe("INVALID_JSON")
  })

  it("berhasil mengupdate aset dan mengembalikan 200", async () => {
    const updated = {
      id: "101",
      assetTag: "AST-00101",
      name: "MacBook Pro 14 Updated",
      category: "Laptop",
      model: "Apple M3 Pro",
      serialNumber: "LAP-8K29AL1X",
      status: "maintenance",
      purchaseDate: "2024-01-15",
      purchaseCost: 28000000,
      assignedToId: null,
      assignedAt: null,
      assignedTo: null,
      notes: "Sedang diservis",
    }

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => updated,
    })

    const request = new NextRequest("http://localhost:3000/api/assets/101", {
      method: "PATCH",
      body: JSON.stringify({ status: "maintenance", notes: "Sedang diservis" }),
      headers: { "Content-Type": "application/json" },
    })
    const response = await PATCH(request, { params: Promise.resolve({ id: "101" }) })

    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json.status).toBe("maintenance")
  })
})

describe("DELETE /api/assets/[id]", () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it("berhasil menghapus aset dan mengembalikan status 204", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
    })

    const request = new NextRequest("http://localhost:3000/api/assets/101", {
      method: "DELETE",
    })
    const response = await DELETE(request, { params: Promise.resolve({ id: "101" }) })

    expect(response.status).toBe(204)
  })

  it("mengembalikan 404 NOT_FOUND jika aset tidak ditemukan", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    })

    const request = new NextRequest("http://localhost:3000/api/assets/999", {
      method: "DELETE",
    })
    const response = await DELETE(request, { params: Promise.resolve({ id: "999" }) })

    expect(response.status).toBe(404)
    const json = await response.json()
    expect(json.error.code).toBe("NOT_FOUND")
  })
})
