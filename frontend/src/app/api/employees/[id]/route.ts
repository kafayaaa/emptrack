import { NextResponse, type NextRequest } from "next/server"
import { serverEnv } from "@/env.server"
import { employeeSchema } from "@/features/employees/schema/employee.schema"

// Helper agar semua error punya bentuk yang sama konsisten dengan /api/employees
function errorResponse(status: number, code: string, message: string, details?: unknown) {
  return NextResponse.json({ error: { code, message, details } }, { status })
}

export async function GET(_request: NextRequest, segmentData: { params: Promise<{ id: string }> }) {
  const { id } = await segmentData.params

  // Validasi ID sederhana (non-empty string)
  if (!id || typeof id !== "string" || !id.trim()) {
    return errorResponse(400, "INVALID_ID", "ID karyawan tidak valid.")
  }

  const upstream = new URL(`/employees/${encodeURIComponent(id.trim())}`, serverEnv.BACKEND_URL)

  try {
    const res = await fetch(upstream, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    })

    if (res.status === 404) {
      return errorResponse(404, "NOT_FOUND", "Karyawan tidak ditemukan.")
    }

    if (!res.ok) {
      return errorResponse(502, "UPSTREAM_ERROR", "Backend mengembalikan error.")
    }

    const upstreamJson = await res.json()
    const parsed = employeeSchema.safeParse(upstreamJson)
    if (!parsed.success) {
      return errorResponse(502, "UPSTREAM_INVALID", "Format data backend tidak sesuai.")
    }

    return NextResponse.json(parsed.data, {
      headers: {
        "Cache-Control": "private, max-age=60, stale-while-revalidate=120",
      },
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      return errorResponse(504, "UPSTREAM_TIMEOUT", "Backend terlalu lama merespons.")
    }
    return errorResponse(502, "UPSTREAM_UNREACHABLE", "Backend tidak dapat dihubungi.")
  }
}
