import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

vi.mock("server-only", () => ({}))
vi.mock("@/env.server", () => ({
  serverEnv: {
    BACKEND_URL: "http://localhost:4000",
  },
}))

import { getEmployeeByIdServer } from "./employees.server"

describe("getEmployeeByIdServer", () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  const sampleEmployee = {
    id: "1",
    employeeNumber: "EMP-00001",
    fullName: "Daruna Daruna Oktovian",
    email: "daruna.daruna.oktovian.1@emptrack.test",
    phone: "0849 938 826",
    department: "Engineering",
    position: "Manager",
    status: "active",
    hireDate: "2017-01-18",
    isManager: true,
    managerId: null,
    projectId: "1281",
  }

  it("mengembalikan null jika ID kosong atau hanya whitespace", async () => {
    expect(await getEmployeeByIdServer("")).toBeNull()
    expect(await getEmployeeByIdServer("   ")).toBeNull()
  })

  it("mengembalikan data Employee saat upstream berhasil", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(sampleEmployee), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    )

    const result = await getEmployeeByIdServer("1")
    expect(result).toEqual(sampleEmployee)
    expect(globalThis.fetch).toHaveBeenCalledWith(
      new URL("/employees/1", "http://localhost:4000"),
      expect.objectContaining({
        next: { revalidate: 60 },
      }),
    )
  })

  it("mengembalikan null jika upstream mengembalikan 404 Not Found", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: "Not Found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }),
    )

    const result = await getEmployeeByIdServer("999999")
    expect(result).toBeNull()
  })

  it("mengembalikan null jika upstream mengembalikan error 500", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response("Server Error", {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      }),
    )

    const result = await getEmployeeByIdServer("1")
    expect(result).toBeNull()
  })

  it("mengembalikan null jika format upstream tidak sesuai skema", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "1" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    )

    const result = await getEmployeeByIdServer("1")
    expect(result).toBeNull()
  })

  it("mengembalikan null saat fetch melempar error timeout atau jaringan", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network Error"))

    const result = await getEmployeeByIdServer("1")
    expect(result).toBeNull()
  })
})
