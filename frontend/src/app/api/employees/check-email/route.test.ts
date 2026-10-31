import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"
import { GET } from "./route"
import * as serverApi from "@/features/employees/api/employees.server"

vi.mock("@/features/employees/api/employees.server", () => ({
  isEmployeeEmailUniqueServer: vi.fn(),
}))

describe("GET /api/employees/check-email", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("mengembalikan status 400 jika email tidak ada atau tidak valid", async () => {
    const req = new NextRequest("http://localhost:3000/api/employees/check-email")
    const res = await GET(req)
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error.code).toBe("INVALID_QUERY")
  })

  it("mengembalikan status 400 jika format email salah", async () => {
    const req = new NextRequest("http://localhost:3000/api/employees/check-email?email=bukan-email")
    const res = await GET(req)
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error.code).toBe("INVALID_QUERY")
  })

  it("mengembalikan status 400 jika excludeId melebihi 50 karakter (EMPTRACK-110)", async () => {
    const longId = "e".repeat(51)
    const req = new NextRequest(
      `http://localhost:3000/api/employees/check-email?email=test@perusahaan.com&excludeId=${longId}`,
    )
    const res = await GET(req)
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error.code).toBe("INVALID_QUERY")
  })

  it("mengembalikan { isUnique: true } saat email belum digunakan", async () => {
    vi.mocked(serverApi.isEmployeeEmailUniqueServer).mockResolvedValue(true)

    const req = new NextRequest(
      "http://localhost:3000/api/employees/check-email?email=baru@perusahaan.com",
    )
    const res = await GET(req)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json).toEqual({ isUnique: true })
    expect(serverApi.isEmployeeEmailUniqueServer).toHaveBeenCalledWith(
      "baru@perusahaan.com",
      undefined,
    )
  })

  it("mengirim excludeId ke isEmployeeEmailUniqueServer jika disediakan", async () => {
    vi.mocked(serverApi.isEmployeeEmailUniqueServer).mockResolvedValue(true)

    const req = new NextRequest(
      "http://localhost:3000/api/employees/check-email?email=edit@perusahaan.com&excludeId=emp-5",
    )
    const res = await GET(req)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json).toEqual({ isUnique: true })
    expect(serverApi.isEmployeeEmailUniqueServer).toHaveBeenCalledWith(
      "edit@perusahaan.com",
      "emp-5",
    )
  })

  it("mengembalikan { isUnique: false } saat email sudah digunakan orang lain", async () => {
    vi.mocked(serverApi.isEmployeeEmailUniqueServer).mockResolvedValue(false)

    const req = new NextRequest(
      "http://localhost:3000/api/employees/check-email?email=used@perusahaan.com",
    )
    const res = await GET(req)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json).toEqual({ isUnique: false })
  })

  it("mengembalikan status 502 jika upstream backend error", async () => {
    vi.mocked(serverApi.isEmployeeEmailUniqueServer).mockRejectedValue(
      new Error("Backend unreachable"),
    )

    const req = new NextRequest(
      "http://localhost:3000/api/employees/check-email?email=test@perusahaan.com",
    )
    const res = await GET(req)
    const json = await res.json()

    expect(res.status).toBe(502)
    expect(json.error.code).toBe("UPSTREAM_ERROR")
  })
})
