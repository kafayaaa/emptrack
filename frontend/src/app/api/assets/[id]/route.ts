import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { serverEnv } from "@/env.server"
import { assetSchema } from "@/features/assets/schema/asset.schema"
import { patchAssetFormSchema } from "@/features/assets/schema/asset-form.schema"

// Helper agar semua error punya bentuk yang sama konsisten dengan /api/assets
function errorResponse(status: number, code: string, message: string, details?: unknown) {
  return NextResponse.json({ error: { code, message, details } }, { status })
}

export async function GET(_request: NextRequest, segmentData: { params: Promise<{ id: string }> }) {
  const { id } = await segmentData.params

  // Validasi ID sederhana (non-empty string)
  if (!id || typeof id !== "string" || !id.trim()) {
    return errorResponse(400, "INVALID_ID", "ID aset tidak valid.")
  }

  const upstream = new URL(`/assets/${encodeURIComponent(id.trim())}`, serverEnv.BACKEND_URL)

  try {
    const res = await fetch(upstream, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    })

    if (res.status === 404) {
      return errorResponse(404, "NOT_FOUND", "Aset tidak ditemukan.")
    }

    if (!res.ok) {
      return errorResponse(502, "UPSTREAM_ERROR", "Backend mengembalikan error.")
    }

    const upstreamJson = await res.json()
    const parsed = assetSchema.safeParse(upstreamJson)
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

export async function PATCH(
  request: NextRequest,
  segmentData: { params: Promise<{ id: string }> },
) {
  const { id } = await segmentData.params

  if (!id || typeof id !== "string" || !id.trim()) {
    return errorResponse(400, "INVALID_ID", "ID aset tidak valid.")
  }

  let bodyJson: unknown
  try {
    bodyJson = await request.json()
  } catch {
    return errorResponse(400, "INVALID_JSON", "Format body request bukan JSON yang valid.")
  }

  const parsed = patchAssetFormSchema.safeParse(bodyJson)
  if (!parsed.success) {
    return errorResponse(
      400,
      "INVALID_BODY",
      "Data aset tidak valid.",
      z.flattenError(parsed.error).fieldErrors,
    )
  }

  const upstream = new URL(`/assets/${encodeURIComponent(id.trim())}`, serverEnv.BACKEND_URL)

  try {
    const patchData: Record<string, unknown> = { ...parsed.data }
    const now = new Date().toISOString().split("T")[0]
    patchData.updatedAt = now

    // Normalisasi relasi penugasan
    if (parsed.data.status) {
      if (parsed.data.status !== "assigned") {
        patchData.assignedToId = null
        patchData.assignedAt = null
        patchData.assignedTo = null
      } else if (parsed.data.assignedToId) {
        patchData.assignedAt = now
      }
    } else if (parsed.data.assignedToId !== undefined) {
      if (!parsed.data.assignedToId) {
        patchData.assignedToId = null
        patchData.assignedAt = null
        patchData.assignedTo = null
      }
    }

    if (parsed.data.notes !== undefined && !parsed.data.notes) {
      patchData.notes = null
    }

    const res = await fetch(upstream, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patchData),
      signal: AbortSignal.timeout(5000),
    })

    if (res.status === 404) {
      return errorResponse(404, "NOT_FOUND", "Aset tidak ditemukan.")
    }

    if (!res.ok) {
      return errorResponse(502, "UPSTREAM_ERROR", "Backend mengembalikan error saat update.")
    }

    const upstreamJson = await res.json()
    if (upstreamJson.assignedToId === "") {
      upstreamJson.assignedToId = null
    }
    if (upstreamJson.notes === "") {
      upstreamJson.notes = null
    }
    if (upstreamJson.assignedAt === undefined) {
      upstreamJson.assignedAt = null
    }
    if (upstreamJson.assignedTo === undefined) {
      upstreamJson.assignedTo = null
    }

    const parsedAsset = assetSchema.safeParse(upstreamJson)
    if (!parsedAsset.success) {
      return errorResponse(
        502,
        "UPSTREAM_INVALID",
        "Format data backend tidak sesuai.",
        z.flattenError(parsedAsset.error).fieldErrors,
      )
    }

    return NextResponse.json(parsedAsset.data)
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      return errorResponse(504, "UPSTREAM_TIMEOUT", "Backend terlalu lama merespons.")
    }
    return errorResponse(502, "UPSTREAM_UNREACHABLE", "Backend tidak dapat dihubungi.")
  }
}

export async function DELETE(
  _request: NextRequest,
  segmentData: { params: Promise<{ id: string }> },
) {
  const { id } = await segmentData.params

  if (!id || typeof id !== "string" || !id.trim()) {
    return errorResponse(400, "INVALID_ID", "ID aset tidak valid.")
  }

  const upstream = new URL(`/assets/${encodeURIComponent(id.trim())}`, serverEnv.BACKEND_URL)

  try {
    const res = await fetch(upstream, {
      method: "DELETE",
      signal: AbortSignal.timeout(5000),
    })

    if (res.status === 404) {
      return errorResponse(404, "NOT_FOUND", "Aset tidak ditemukan.")
    }

    if (!res.ok) {
      return errorResponse(502, "UPSTREAM_ERROR", "Backend mengembalikan error saat menghapus.")
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      return errorResponse(504, "UPSTREAM_TIMEOUT", "Backend terlalu lama merespons.")
    }
    return errorResponse(502, "UPSTREAM_UNREACHABLE", "Backend tidak dapat dihubungi.")
  }
}
