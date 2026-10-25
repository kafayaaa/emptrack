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

/**
 * Memeriksa apakah suatu email sudah digunakan oleh karyawan lain di upstream database.
 * Jika excludeId diberikan, karyawan dengan ID tersebut akan diabaikan (untuk mode Edit).
 * Mengembalikan true jika email unik (tersedia), false jika sudah digunakan.
 */
export async function isEmployeeEmailUniqueServer(
  email: string,
  excludeId?: string,
): Promise<boolean> {
  const normalizedEmail = email?.trim().toLowerCase()
  if (!normalizedEmail) {
    return false
  }

  try {
    const upstream = new URL("/employees", serverEnv.BACKEND_URL)
    upstream.searchParams.set("email", normalizedEmail)
    const res = await fetch(upstream, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    })

    if (!res.ok) {
      throw new Error(`Upstream error saat memeriksa email: HTTP ${res.status}`)
    }

    const raw = await res.json()
    const employees: Employee[] = Array.isArray(raw)
      ? raw
      : raw && typeof raw === "object" && Array.isArray((raw as { data: unknown }).data)
        ? (raw as { data: Employee[] }).data
        : []

    const duplicate = employees.find((emp) => {
      const isSameEmail = emp.email?.trim().toLowerCase() === normalizedEmail
      if (!isSameEmail) return false
      if (excludeId && emp.id === excludeId.trim()) return false
      return true
    })

    return !duplicate
  } catch (error) {
    throw error
  }
}
