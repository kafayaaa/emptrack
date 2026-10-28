import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

vi.mock("server-only", () => ({}))
vi.mock("@/env.server", () => ({
  serverEnv: {
    BACKEND_URL: "http://localhost:4000",
  },
}))

import { getAssetByIdServer } from "./assets.server"

describe("getAssetByIdServer (EMPTRACK-92)", () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  const sampleAsset = {
    id: "ast-1",
    assetTag: "AST-00001",
    name: "MacBook Pro 16 M3 Max",
    category: "Laptop",
    model: "M3 Max / 36GB RAM",
    serialNumber: "SN123456",
    status: "available",
    purchaseDate: "2024-03-01",
    purchaseCost: 35000000,
    assignedToId: null,
  }

  it("mengembalikan null jika ID kosong atau hanya whitespace", async () => {
    expect(await getAssetByIdServer("")).toBeNull()
    expect(await getAssetByIdServer("   ")).toBeNull()
  })

  it("mengembalikan data Asset saat upstream berhasil", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(sampleAsset), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    )

    const result = await getAssetByIdServer("ast-1")
    expect(result).toEqual(sampleAsset)
    expect(globalThis.fetch).toHaveBeenCalledWith(
      new URL("/assets/ast-1", "http://localhost:4000"),
      expect.objectContaining({
        next: { revalidate: 60 },
      }),
    )
  })

  it("mengembalikan null jika upstream mengembalikan status 404 atau 500", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(new Response("Not Found", { status: 404 }))
    expect(await getAssetByIdServer("ast-999")).toBeNull()
  })

  it("mengembalikan null saat fetch melempar network exception", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network connection lost"))
    expect(await getAssetByIdServer("ast-1")).toBeNull()
  })
})
