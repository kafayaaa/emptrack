import "server-only"
import { serverEnv } from "@/env.server"
import { assetSchema, type Asset } from "../schema/asset.schema"

/**
 * Server-only fetcher to retrieve asset details directly from upstream backend.
 * Designed specifically for Server Components and generateMetadata (EMPTRACK-92).
 */
export async function getAssetByIdServer(id: string): Promise<Asset | null> {
  if (!id || typeof id !== "string" || !id.trim()) {
    return null
  }

  try {
    const upstream = new URL(`/assets/${encodeURIComponent(id.trim())}`, serverEnv.BACKEND_URL)
    const res = await fetch(upstream, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
    })

    if (!res.ok) {
      return null
    }

    const upstreamJson = (await res.json()) as Record<string, unknown>
    const normalized = {
      ...upstreamJson,
      assetTag:
        typeof upstreamJson.assetTag === "string" && upstreamJson.assetTag.trim().length > 0
          ? upstreamJson.assetTag.trim()
          : `AST-${String(upstreamJson.id ?? "0").padStart(5, "0")}`,
      assignedToId:
        upstreamJson.assignedToId === "" || upstreamJson.assignedToId === undefined
          ? null
          : upstreamJson.assignedToId,
      ...(upstreamJson.notes === "" ? { notes: null } : {}),
      ...(upstreamJson.assignedAt === "" ? { assignedAt: null } : {}),
    }
    const parsed = assetSchema.safeParse(normalized)
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}
