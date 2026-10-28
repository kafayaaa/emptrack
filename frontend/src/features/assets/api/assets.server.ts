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

    const upstreamJson = await res.json()
    const parsed = assetSchema.safeParse(upstreamJson)
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}
