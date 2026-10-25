import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { NextRequest } from "next/server"
import { GET, PATCH } from "./route"

vi.mock("@/env.server", () => ({
  serverEnv: {
    BACKEND_URL: "http://localhost:4000",
  },
}))

describe("GET /api/employees/[id]", () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  const validEmployee = {
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

  it("mengembalikan 400 jika ID kosong atau hanya whitespace", async () => {
    const request = new NextRequest("http://localhost:3000/api/employees/%20")
    const response = await GET(request, {
      params: Promise.resolve({ id: "   " }),
    })

    expect(response.status).toBe(400)
    const json = await response.json()
    expect(json.error.code).toBe("INVALID_ID")
  })

  it("mengembalikan 200 dengan data employee dan Cache-Control yang sesuai saat upstream sukses", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(validEmployee), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    )
    globalThis.fetch = fetchMock

    const request = new NextRequest("http://localhost:3000/api/employees/1")
    const response = await GET(request, {
      params: Promise.resolve({ id: "1" }),
    })

    expect(fetchMock).toHaveBeenCalledWith(
      new URL("/employees/1", "http://localhost:4000"),
      expect.objectContaining({
        cache: "no-store",
      }),
    )
    expect(response.status).toBe(200)
    expect(response.headers.get("Cache-Control")).toBe(
      "private, max-age=60, stale-while-revalidate=120",
    )
    const json = await response.json()
    expect(json).toEqual(validEmployee)
  })

  it("mengembalikan 404 jika employee tidak ditemukan di upstream", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: "Not Found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }),
    )

    const request = new NextRequest("http://localhost:3000/api/employees/999999")
    const response = await GET(request, {
      params: Promise.resolve({ id: "999999" }),
    })

    expect(response.status).toBe(404)
    const json = await response.json()
    expect(json.error.code).toBe("NOT_FOUND")
  })

  it("mengembalikan 502 UPSTREAM_ERROR jika upstream mengembalikan status error selain 404", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response("Internal Server Error", {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      }),
    )

    const request = new NextRequest("http://localhost:3000/api/employees/1")
    const response = await GET(request, {
      params: Promise.resolve({ id: "1" }),
    })

    expect(response.status).toBe(502)
    const json = await response.json()
    expect(json.error.code).toBe("UPSTREAM_ERROR")
  })

  it("mengembalikan 502 UPSTREAM_INVALID jika response upstream tidak valid sesuai employeeSchema", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "1" }), {
        // field wajib tidak lengkap
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    )

    const request = new NextRequest("http://localhost:3000/api/employees/1")
    const response = await GET(request, {
      params: Promise.resolve({ id: "1" }),
    })

    expect(response.status).toBe(502)
    const json = await response.json()
    expect(json.error.code).toBe("UPSTREAM_INVALID")
  })

  it("mengembalikan 504 UPSTREAM_TIMEOUT jika upstream mengalami timeout", async () => {
    const timeoutError = new DOMException("The operation timed out", "TimeoutError")
    globalThis.fetch = vi.fn().mockRejectedValue(timeoutError)

    const request = new NextRequest("http://localhost:3000/api/employees/1")
    const response = await GET(request, {
      params: Promise.resolve({ id: "1" }),
    })

    expect(response.status).toBe(504)
    const json = await response.json()
    expect(json.error.code).toBe("UPSTREAM_TIMEOUT")
  })

  it("mengembalikan 502 UPSTREAM_UNREACHABLE jika backend tidak dapat dihubungi", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("ECONNREFUSED"))

    const request = new NextRequest("http://localhost:3000/api/employees/1")
    const response = await GET(request, {
      params: Promise.resolve({ id: "1" }),
    })

    expect(response.status).toBe(502)
    const json = await response.json()
    expect(json.error.code).toBe("UPSTREAM_UNREACHABLE")
  })
})

describe("PATCH /api/employees/[id]", () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  const validPayload = {
    employeeNumber: "EMP-00001",
    fullName: "Daruna Daruna Oktovian Update",
    email: "daruna.update@emptrack.test",
    phone: "+62 812-3456-7890",
    department: "Engineering",
    position: "Frontend Developer",
    status: "active",
    hireDate: "2017-01-18",
    isManager: false,
    managerId: null,
    projectId: "101",
  }

  it("mengembalikan 400 jika ID kosong", async () => {
    const request = new NextRequest("http://localhost:3000/api/employees/%20", {
      method: "PATCH",
      body: JSON.stringify(validPayload),
      headers: { "Content-Type": "application/json" },
    })
    const response = await PATCH(request, {
      params: Promise.resolve({ id: "   " }),
    })

    expect(response.status).toBe(400)
    const json = await response.json()
    expect(json.error.code).toBe("INVALID_ID")
  })

  it("mengembalikan 400 jika body bukan JSON valid", async () => {
    const request = new NextRequest("http://localhost:3000/api/employees/1", {
      method: "PATCH",
      body: "not-json",
      headers: { "Content-Type": "application/json" },
    })
    const response = await PATCH(request, {
      params: Promise.resolve({ id: "1" }),
    })

    expect(response.status).toBe(400)
    const json = await response.json()
    expect(json.error.code).toBe("INVALID_JSON")
  })

  it("mengembalikan 400 jika data tidak valid", async () => {
    const request = new NextRequest("http://localhost:3000/api/employees/1", {
      method: "PATCH",
      body: JSON.stringify({ ...validPayload, email: "invalid-email" }),
      headers: { "Content-Type": "application/json" },
    })
    const response = await PATCH(request, {
      params: Promise.resolve({ id: "1" }),
    })

    expect(response.status).toBe(400)
    const json = await response.json()
    expect(json.error.code).toBe("INVALID_BODY")
  })

  it("mengembalikan 404 jika karyawan tidak ditemukan di upstream", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(new Response("Not found", { status: 404 }))

    const request = new NextRequest("http://localhost:3000/api/employees/999", {
      method: "PATCH",
      body: JSON.stringify(validPayload),
      headers: { "Content-Type": "application/json" },
    })
    const response = await PATCH(request, {
      params: Promise.resolve({ id: "999" }),
    })

    expect(response.status).toBe(404)
    const json = await response.json()
    expect(json.error.code).toBe("NOT_FOUND")
  })

  it("mengembalikan 200 dengan data terupdate saat upstream berhasil", async () => {
    const updatedEmployee = { id: "1", ...validPayload }
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(updatedEmployee), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    )
    globalThis.fetch = fetchMock

    const request = new NextRequest("http://localhost:3000/api/employees/1", {
      method: "PATCH",
      body: JSON.stringify(validPayload),
      headers: { "Content-Type": "application/json" },
    })
    const response = await PATCH(request, {
      params: Promise.resolve({ id: "1" }),
    })

    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json.fullName).toBe("Daruna Daruna Oktovian Update")
    expect(fetchMock).toHaveBeenCalledWith(
      new URL("/employees/1", "http://localhost:4000"),
      expect.objectContaining({
        method: "PATCH",
      }),
    )
  })
})
