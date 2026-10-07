import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { serverEnv } from "@/env.server"
import {
  employeeListQuerySchema,
  jsonServerEmployeeListSchema,
  type EmployeeListResponse,
} from "@/features/employees/schema/employee.schema"

// Helper agar semua error punya bentuk yang sama.
function errorResponse(status: number, code: string, message: string, details?: unknown) {
  return NextResponse.json({ error: { code, message, details } }, { status })
}

export async function GET(request: NextRequest) {
  // 1. VALIDASI INPUT
  // Object.fromEntries mengubah ?a=1&b=2 menjadi { a: "1", b: "2" }
  const parsed = employeeListQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams))
  if (!parsed.success) {
    return errorResponse(
      400,
      "INVALID_QUERY",
      "Parameter query tidak valid.",
      z.flattenError(parsed.error).fieldErrors,
    )
  }

  // Parameter yang tidak ada di skema otomatis dibuang oleh zod,
  // jadi sisa objek `filters` hanya berisi filter yang di-whitelist.
  const { page, pageSize, search, sortBy, sortOrder, ...filters } = parsed.data

  // 2. SUSUN URL UPSTREAM KE JSON-SERVER
  // new URL + searchParams.set meng-encode nilai otomatis (aman dari injeksi query).
  const upstream = new URL("/employees", serverEnv.BACKEND_URL)
  upstream.searchParams.set("_page", String(page))
  upstream.searchParams.set("_per_page", String(pageSize))

  // Sintaks sort json-server v1: "-field" berarti descending.
  if (sortBy) {
    upstream.searchParams.set("_sort", sortOrder === "desc" ? `-${sortBy}` : sortBy)
  }
  // Search sebagian teks pada nama.
  if (search) upstream.searchParams.set("fullName:contains", search)

  // Filter exact match; lewati yang tidak dikirim.
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined) upstream.searchParams.set(key, value)
  }

  // 3. PANGGIL BACKEND (server ke server)
  try {
    const res = await fetch(upstream, {
      cache: "no-store", // data mock berubah, jangan di-cache Next
      signal: AbortSignal.timeout(5000), // batalkan jika >5 detik
    })
    if (!res.ok) {
      return errorResponse(502, "UPSTREAM_ERROR", "Backend mengembalikan error.")
    }

    // 4. VALIDASI RESPONSE UPSTREAM (jangan percaya data dari luar)
    const upstreamData = jsonServerEmployeeListSchema.safeParse(await res.json())
    if (!upstreamData.success) {
      return errorResponse(502, "UPSTREAM_INVALID", "Format data backend tidak sesuai.")
    }
    const { items, pages, data } = upstreamData.data

    // Halaman di luar jangkauan (mis. page=999999).
    if (items > 0 && page > pages) {
      return errorResponse(404, "PAGE_OUT_OF_RANGE", "Halaman tidak ditemukan.")
    }

    // 5. PETAKAN KE KONTRAK KITA
    const body: EmployeeListResponse = {
      data,
      meta: { page, pageSize, total: items, totalPages: pages },
    }

    return NextResponse.json(body, {
      headers: {
        // private: hanya cache browser, bukan CDN/proxy bersama.
        // max-age=30: 30 detik dianggap segar tanpa request ulang.
        // stale-while-revalidate=60: boleh pakai data lama sambil refresh di belakang.
        "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
      },
    })
  } catch (error) {
    // TimeoutError dilempar oleh AbortSignal.timeout
    if (error instanceof DOMException && error.name === "TimeoutError") {
      return errorResponse(504, "UPSTREAM_TIMEOUT", "Backend terlalu lama merespons.")
    }
    // Backend mati / koneksi ditolak. Detail error tidak dikirim ke client.
    return errorResponse(502, "UPSTREAM_UNREACHABLE", "Backend tidak dapat dihubungi.")
  }
}
