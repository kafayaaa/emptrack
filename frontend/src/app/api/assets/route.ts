import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { serverEnv } from "@/env.server"
import {
  assetListQuerySchema,
  jsonServerAssetListSchema,
  assetSchema,
  type AssetListResponse,
} from "@/features/assets/schema/asset.schema"
import { assetFormSchema } from "@/features/assets/schema/asset-form.schema"

// Helper agar semua error punya bentuk yang sama konsisten dengan standar EmpTrack.
function errorResponse(status: number, code: string, message: string, details?: unknown) {
  return NextResponse.json({ error: { code, message, details } }, { status })
}

export async function GET(request: NextRequest) {
  // 1. VALIDASI INPUT QUERY PARAMS
  const parsed = assetListQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams))
  if (!parsed.success) {
    return errorResponse(
      400,
      "INVALID_QUERY",
      "Parameter query tidak valid.",
      z.flattenError(parsed.error).fieldErrors,
    )
  }

  const { page, pageSize, search, sortBy, sortOrder, ...filters } = parsed.data

  // 2. SUSUN URL UPSTREAM KE JSON-SERVER
  const upstream = new URL("/assets", serverEnv.BACKEND_URL)
  upstream.searchParams.set("_page", String(page))
  upstream.searchParams.set("_per_page", String(pageSize))

  // Sintaks sort json-server v1: "-field" berarti descending.
  if (sortBy) {
    upstream.searchParams.set("_sort", sortOrder === "desc" ? `-${sortBy}` : sortBy)
  }

  // Search sebagian teks pada nama aset.
  if (search) {
    upstream.searchParams.set("name:contains", search)
  }

  // Filter exact match (category, status, assignedToId); lewati yang tidak dikirim.
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined) {
      upstream.searchParams.set(key, value)
    }
  }

  // 3. PANGGIL BACKEND UPSTREAM
  try {
    const res = await fetch(upstream, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    })

    if (!res.ok) {
      return errorResponse(502, "UPSTREAM_ERROR", "Backend mengembalikan error.")
    }

    // 4. VALIDASI RESPONSE UPSTREAM DENGAN ZOD
    const upstreamData = jsonServerAssetListSchema.safeParse(await res.json())
    if (!upstreamData.success) {
      return errorResponse(502, "UPSTREAM_INVALID", "Format data backend tidak sesuai.")
    }

    const { items, pages, data } = upstreamData.data

    // Halaman di luar jangkauan (mis. page=999999).
    if (items > 0 && page > pages) {
      return errorResponse(404, "PAGE_OUT_OF_RANGE", "Halaman tidak ditemukan.")
    }

    // 5. PETAKAN KE KONTRAK RESPONSE
    const body: AssetListResponse = {
      data,
      meta: { page, pageSize, total: items, totalPages: pages },
    }

    return NextResponse.json(body, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      return errorResponse(504, "UPSTREAM_TIMEOUT", "Backend terlalu lama merespons.")
    }
    return errorResponse(502, "UPSTREAM_UNREACHABLE", "Backend tidak dapat dihubungi.")
  }
}

export async function POST(request: NextRequest) {
  let bodyJson: unknown
  try {
    bodyJson = await request.json()
  } catch {
    return errorResponse(400, "INVALID_JSON", "Format body request bukan JSON yang valid.")
  }

  // 1. VALIDASI INPUT DENGAN FORM SCHEMA
  const parsed = assetFormSchema.safeParse(bodyJson)
  if (!parsed.success) {
    return errorResponse(
      400,
      "INVALID_BODY",
      "Data aset tidak valid.",
      z.flattenError(parsed.error).fieldErrors,
    )
  }

  // 2. FORWARD KE UPSTREAM BACKEND
  const upstream = new URL("/assets", serverEnv.BACKEND_URL)
  try {
    // Generate atau gunakan assetTag yang disediakan
    let finalAssetTag = parsed.data.assetTag?.trim()
    if (!finalAssetTag) {
      try {
        const lastAssetUrl = new URL("/assets?_sort=-id&_per_page=1", serverEnv.BACKEND_URL)
        const lastRes = await fetch(lastAssetUrl, { signal: AbortSignal.timeout(3000) })
        if (lastRes.ok) {
          const lastJson = await lastRes.json()
          const lastItem = Array.isArray(lastJson.data) ? lastJson.data[0] : null
          const lastNum = lastItem?.id ? parseInt(String(lastItem.id), 10) : 0
          const nextNum = !isNaN(lastNum) && lastNum > 0 ? lastNum + 1 : 1
          finalAssetTag = `AST-${String(nextNum).padStart(5, "0")}`
        }
      } catch {
        // Fallback jika query sort gagal
      }
    }

    if (!finalAssetTag) {
      const timestampSuffix = Date.now().toString().slice(-6)
      finalAssetTag = `AST-${timestampSuffix}`
    }

    const now = new Date().toISOString().split("T")[0]
    const isAssigned = parsed.data.status === "assigned" && Boolean(parsed.data.assignedToId)
    const normalizedAssignedToId = isAssigned ? parsed.data.assignedToId : null

    const payload = {
      ...parsed.data,
      assetTag: finalAssetTag,
      assignedToId: normalizedAssignedToId,
      assignedAt: isAssigned ? now : null,
      assignedTo: null,
      notes: parsed.data.notes?.trim() || null,
      createdAt: now,
      updatedAt: now,
    }

    const res = await fetch(upstream, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    })

    if (!res.ok) {
      return errorResponse(502, "UPSTREAM_ERROR", "Backend mengembalikan error saat menyimpan.")
    }

    const rawData = await res.json()
    if (!rawData.assetTag) {
      rawData.assetTag = finalAssetTag
    }
    if (rawData.assignedToId === undefined || rawData.assignedToId === "") {
      rawData.assignedToId = null
    }
    if (rawData.notes === undefined || rawData.notes === "") {
      rawData.notes = null
    }
    if (rawData.assignedAt === undefined) {
      rawData.assignedAt = null
    }
    if (rawData.assignedTo === undefined) {
      rawData.assignedTo = null
    }

    const parsedAsset = assetSchema.safeParse(rawData)
    if (!parsedAsset.success) {
      return errorResponse(
        502,
        "UPSTREAM_INVALID",
        "Data aset yang disimpan tidak sesuai spesifikasi schema.",
        z.flattenError(parsedAsset.error).fieldErrors,
      )
    }

    return NextResponse.json(parsedAsset.data, { status: 201 })
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      return errorResponse(504, "UPSTREAM_TIMEOUT", "Backend terlalu lama merespons.")
    }
    return errorResponse(502, "UPSTREAM_UNREACHABLE", "Backend tidak dapat dihubungi.")
  }
}
