import { describe, it, expect, vi, afterEach } from "vitest"
import { apiClient, ApiError } from "./api-client"

afterEach(() => vi.restoreAllMocks())

describe("apiClient", () => {
  it("mengembalikan data JSON saat response 200", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ id: 1 }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    )

    const result = await apiClient.get<{ id: number }>("/employees/1")
    expect(result).toEqual({ id: 1 })
  })

  it("melempar ApiError saat response 404", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: "Not found" }), {
        status: 404,
        headers: { "content-type": "application/json" },
      }),
    )

    await expect(apiClient.get("/employees/999")).rejects.toBeInstanceOf(ApiError)
  })
})
