import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { NextRequest } from "next/server"
import { POST } from "./route"

vi.mock("@/env.server", () => ({
  serverEnv: {
    BACKEND_URL: "http://localhost:4000",
  },
}))

describe("POST /api/employees", () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  const validPayload = {
    employeeNumber: "EMP-00100",
    fullName: "Budi Santoso",
    email: "budi.santoso@perusahaan.com",
    phone: "+62 812-3456-7890",
    department: "Engineering",
    position: "Frontend Developer",
    status: "active",
    hireDate: "2024-01-15",
    isManager: false,
    managerId: null,
    projectId: "101",
  }

  it("mengembalikan 400 jika request body bukan JSON yang valid", async () => {
    const request = new NextRequest("http://localhost:3000/api/employees", {
      method: "POST",
      body: "invalid-json",
      headers: { "Content-Type": "application/json" },
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
    const json = await response.json()
    expect(json.error.code).toBe("INVALID_JSON")
  })

  it("mengembalikan 400 jika data tidak memenuhi validasi employeeFormSchema", async () => {
    const request = new NextRequest("http://localhost:3000/api/employees", {
      method: "POST",
      body: JSON.stringify({
        ...validPayload,
        email: "not-an-email",
      }),
      headers: { "Content-Type": "application/json" },
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
    const json = await response.json()
    expect(json.error.code).toBe("INVALID_BODY")
    expect(json.error.details.email).toBeDefined()
  })

  it("mengembalikan 201 dengan data baru saat upstream backend berhasil menyimpan", async () => {
    const upstreamResponse = {
      id: "emp-999",
      ...validPayload,
    }

    const fetchMock = vi.fn().mockImplementation((url: URL | string, options?: RequestInit) => {
      const urlStr = url.toString()
      if (urlStr.includes("email=")) {
        return Promise.resolve(
          new Response(JSON.stringify([]), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
        )
      }
      if (options?.method === "POST") {
        return Promise.resolve(
          new Response(JSON.stringify(upstreamResponse), {
            status: 201,
            headers: { "Content-Type": "application/json" },
          }),
        )
      }
      return Promise.resolve(new Response(null, { status: 404 }))
    })
    globalThis.fetch = fetchMock

    const request = new NextRequest("http://localhost:3000/api/employees", {
      method: "POST",
      body: JSON.stringify(validPayload),
      headers: { "Content-Type": "application/json" },
    })

    const response = await POST(request)
    expect(response.status).toBe(201)
    const json = await response.json()
    expect(json.id).toBe("emp-999")
    expect(json.fullName).toBe("Budi Santoso")
    expect(fetchMock).toHaveBeenCalledWith(
      new URL("http://localhost:4000/employees"),
      expect.objectContaining({
        method: "POST",
      }),
    )
  })

  it("mengembalikan 409 EMAIL_ALREADY_EXISTS jika email sudah digunakan karyawan lain", async () => {
    globalThis.fetch = vi.fn().mockImplementation((url: URL | string) => {
      const urlStr = url.toString()
      if (urlStr.includes("email=")) {
        return Promise.resolve(
          new Response(
            JSON.stringify([
              {
                id: "emp-existing",
                email: validPayload.email,
              },
            ]),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            },
          ),
        )
      }
      return Promise.resolve(new Response(null, { status: 404 }))
    })

    const request = new NextRequest("http://localhost:3000/api/employees", {
      method: "POST",
      body: JSON.stringify(validPayload),
      headers: { "Content-Type": "application/json" },
    })

    const response = await POST(request)
    expect(response.status).toBe(409)
    const json = await response.json()
    expect(json.error.code).toBe("EMAIL_ALREADY_EXISTS")
    expect(json.error.details.email).toBeDefined()
  })

  it("mengembalikan 502 jika upstream backend mengembalikan error saat menyimpan", async () => {
    globalThis.fetch = vi.fn().mockImplementation((url: URL | string, options?: RequestInit) => {
      const urlStr = url.toString()
      if (urlStr.includes("email=")) {
        return Promise.resolve(
          new Response(JSON.stringify([]), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
        )
      }
      if (options?.method === "POST") {
        return Promise.resolve(
          new Response("Internal error", {
            status: 500,
          }),
        )
      }
      return Promise.resolve(new Response(null, { status: 500 }))
    })

    const request = new NextRequest("http://localhost:3000/api/employees", {
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
