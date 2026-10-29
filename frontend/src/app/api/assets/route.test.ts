import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { NextRequest } from "next/server"
import { GET, POST } from "./route"

vi.mock("@/env.server", () => ({
  serverEnv: {
    BACKEND_URL: "http://localhost:4000",
  },
}))

describe("GET /api/assets", () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  const mockAsset = {
    id: "1",
    assetTag: "AST-00001",
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

  const mockUpstreamResponse = {
    items: 1,
    pages: 1,
    data: [mockAsset],
  }

  it("berhasil mengembalikan daftar aset dengan struktur AssetListResponse dan header cache yang benar", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockUpstreamResponse,
    })

    const request = new NextRequest("http://localhost:3000/api/assets?page=1&pageSize=10")
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(response.headers.get("Cache-Control")).toBe("no-store, no-cache, must-revalidate")

    const json = await response.json()
    expect(json.data).toHaveLength(1)
    expect(json.data[0].assetTag).toBe("AST-00001")
    expect(json.meta).toEqual({
      page: 1,
      pageSize: 10,
      total: 1,
      totalPages: 1,
    })
  })

  it("berhasil menormalisasi item upstream yang tidak memiliki assetTag atau berisi string kosong pada assignedToId", async () => {
    const rawAssetMissingTag = {
      id: "99",
      name: "Legacy Asset",
      category: "Laptop",
      model: "ThinkPad X1",
      serialNumber: "SN-99999",
      status: "available",
      purchaseDate: "2024-01-01",
      purchaseCost: 15000000,
      assignedToId: "",
      notes: "",
    }

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        items: 1,
        pages: 1,
        data: [rawAssetMissingTag],
      }),
    })

    const request = new NextRequest(
      "http://localhost:3000/api/assets?sortBy=assetTag&sortOrder=desc",
    )
    const response = await GET(request)

    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json.data[0].assetTag).toBe("AST-00099")
    expect(json.data[0].assignedToId).toBeNull()
    expect(json.data[0].notes).toBeNull()
  })

  it("meneruskan query search, sort, dan filter ke URL upstream dengan benar", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockUpstreamResponse,
    })
    globalThis.fetch = fetchMock

    const request = new NextRequest(
      "http://localhost:3000/api/assets?page=2&pageSize=25&search=MacBook&sortBy=purchaseCost&sortOrder=desc&category=Laptop&status=available",
    )
    await GET(request)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const calledUrl = fetchMock.mock.calls[0][0] as URL
    expect(calledUrl.searchParams.get("_page")).toBe("2")
    expect(calledUrl.searchParams.get("_per_page")).toBe("25")
    expect(calledUrl.searchParams.get("name:contains")).toBe("MacBook")
    expect(calledUrl.searchParams.get("_sort")).toBe("-purchaseCost")
    expect(calledUrl.searchParams.get("category")).toBe("Laptop")
    expect(calledUrl.searchParams.get("status")).toBe("available")
  })

  it("mengembalikan 400 INVALID_QUERY jika parameter query tidak valid", async () => {
    const request = new NextRequest("http://localhost:3000/api/assets?category=InvalidCategory")
    const response = await GET(request)

    expect(response.status).toBe(400)
    const json = await response.json()
    expect(json.error.code).toBe("INVALID_QUERY")
  })

  it("mengembalikan 404 PAGE_OUT_OF_RANGE jika page melebihi total halaman upstream", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        items: 5,
        pages: 1,
        data: [mockAsset],
      }),
    })

    const request = new NextRequest("http://localhost:3000/api/assets?page=99")
    const response = await GET(request)

    expect(response.status).toBe(404)
    const json = await response.json()
    expect(json.error.code).toBe("PAGE_OUT_OF_RANGE")
  })

  it("mengembalikan 502 UPSTREAM_ERROR jika backend mengembalikan respons tidak ok", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    })

    const request = new NextRequest("http://localhost:3000/api/assets")
    const response = await GET(request)

    expect(response.status).toBe(502)
    const json = await response.json()
    expect(json.error.code).toBe("UPSTREAM_ERROR")
  })

  it("mengembalikan 502 UPSTREAM_INVALID jika backend mengembalikan bentuk data tidak valid", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ wrong: "data" }),
    })

    const request = new NextRequest("http://localhost:3000/api/assets")
    const response = await GET(request)

    expect(response.status).toBe(502)
    const json = await response.json()
    expect(json.error.code).toBe("UPSTREAM_INVALID")
  })

  it("mengembalikan 504 UPSTREAM_TIMEOUT jika permintaan ke backend timeout", async () => {
    const timeoutError = new DOMException("The operation timed out.", "TimeoutError")
    globalThis.fetch = vi.fn().mockRejectedValue(timeoutError)

    const request = new NextRequest("http://localhost:3000/api/assets")
    const response = await GET(request)

    expect(response.status).toBe(504)
    const json = await response.json()
    expect(json.error.code).toBe("UPSTREAM_TIMEOUT")
  })

  it("mengembalikan 502 UPSTREAM_UNREACHABLE jika koneksi ke backend gagal", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Connection refused"))

    const request = new NextRequest("http://localhost:3000/api/assets")
    const response = await GET(request)

    expect(response.status).toBe(502)
    const json = await response.json()
    expect(json.error.code).toBe("UPSTREAM_UNREACHABLE")
  })
})

describe("POST /api/assets", () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  const validPayload = {
    assetTag: "AST-00999",
    name: "Dell UltraSharp 27",
    category: "Monitor",
    model: "U2723QE",
    serialNumber: "MON-ABC12345",
    status: "available",
    purchaseDate: "2024-02-10",
    purchaseCost: 8500000,
    assignedToId: null,
    notes: "Pengadaan IT 2024",
  }

  it("mengembalikan 400 INVALID_JSON jika body bukan format JSON valid", async () => {
    const request = new NextRequest("http://localhost:3000/api/assets", {
      method: "POST",
      body: "not a json string",
      headers: { "Content-Type": "application/json" },
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
    const json = await response.json()
    expect(json.error.code).toBe("INVALID_JSON")
  })

  it("mengembalikan 400 INVALID_BODY jika data body gagal validasi assetFormSchema", async () => {
    const request = new NextRequest("http://localhost:3000/api/assets", {
      method: "POST",
      body: JSON.stringify({
        ...validPayload,
        purchaseCost: -100, // Invalid: negatif
      }),
      headers: { "Content-Type": "application/json" },
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
    const json = await response.json()
    expect(json.error.code).toBe("INVALID_BODY")
    expect(json.error.details.purchaseCost).toBeDefined()
  })

  it("berhasil menyimpan data aset baru dan mengembalikan status 201", async () => {
    const mockCreated = {
      id: "999",
      ...validPayload,
      assignedAt: null,
      assignedTo: null,
      createdAt: "2024-02-10",
      updatedAt: "2024-02-10",
    }

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => mockCreated,
    })
    globalThis.fetch = fetchMock

    const request = new NextRequest("http://localhost:3000/api/assets", {
      method: "POST",
      body: JSON.stringify(validPayload),
      headers: { "Content-Type": "application/json" },
    })

    const response = await POST(request)
    expect(response.status).toBe(201)
    const json = await response.json()
    expect(json.id).toBe("999")
    expect(json.assetTag).toBe("AST-00999")
    expect(fetchMock).toHaveBeenCalledWith(
      new URL("http://localhost:4000/assets"),
      expect.objectContaining({
        method: "POST",
      }),
    )
  })

  it("berhasil membuat assetTag otomatis saat client tidak mengirimkan assetTag", async () => {
    const payloadWithoutTag = {
      name: "Dell UltraSharp 27",
      category: "Monitor",
      model: "U2723QE",
      serialNumber: "MON-ABC12345",
      status: "available",
      purchaseDate: "2024-02-10",
      purchaseCost: 8500000,
      assignedToId: "",
      notes: "",
    }

    const fetchMock = vi.fn().mockImplementation(async (url: URL | string) => {
      const urlStr = url.toString()
      if (urlStr.includes("_sort=-assetTag") || urlStr.includes("_sort=-id")) {
        return {
          ok: true,
          json: async () => ({
            items: 1,
            data: [{ id: "100", assetTag: "AST-00100" }],
          }),
        }
      }
      return {
        ok: true,
        status: 201,
        json: async () => ({
          id: "101",
          name: "Dell UltraSharp 27",
          category: "Monitor",
          model: "U2723QE",
          serialNumber: "MON-ABC12345",
          status: "available",
          purchaseDate: "2024-02-10",
          purchaseCost: 8500000,
          // Upstream without assetTag
        }),
      }
    })
    globalThis.fetch = fetchMock

    const request = new NextRequest("http://localhost:3000/api/assets", {
      method: "POST",
      body: JSON.stringify(payloadWithoutTag),
      headers: { "Content-Type": "application/json" },
    })

    const response = await POST(request)
    expect(response.status).toBe(201)
    const json = await response.json()
    expect(json.id).toBe("101")
    expect(json.assetTag).toBe("AST-00101")
    expect(json.assignedToId).toBeNull()
    expect(json.notes).toBeNull()
  })

  it("mengembalikan 502 UPSTREAM_ERROR jika backend upstream gagal", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    })

    const request = new NextRequest("http://localhost:3000/api/assets", {
      method: "POST",
      body: JSON.stringify(validPayload),
      headers: { "Content-Type": "application/json" },
    })

    const response = await POST(request)
    expect(response.status).toBe(502)
    const json = await response.json()
    expect(json.error.code).toBe("UPSTREAM_ERROR")
  })
})
