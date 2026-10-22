import "server-only"
import { serverEnv } from "@/env.server"
import { employeeSchema, type Employee } from "../schema/employee.schema"

/**
 * Server-only fetcher to retrieve employee details directly from upstream.
 * Designed specifically for Server Components and generateMetadata without
 * making redundant HTTP hops to internal route handlers.
 */
export async function getEmployeeByIdServer(id: string): Promise<Employee | null> {
  if (!id || typeof id !== "string" || !id.trim()) {
    return null
  }

  try {
    const upstream = new URL(`/employees/${encodeURIComponent(id.trim())}`, serverEnv.BACKEND_URL)
    const res = await fetch(upstream, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
    })

    if (!res.ok) {
      return null
    }

    const upstreamJson = await res.json()
    const parsed = employeeSchema.safeParse(upstreamJson)
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}
