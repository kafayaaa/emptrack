import type { ZodType } from "zod"
import { env } from "@/lib/env"

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

type Primitive = string | number | boolean | null | undefined

interface RequestOptions<T> extends Omit<RequestInit, "body"> {
  params?: Record<string, Primitive>
  body?: unknown
  schema?: ZodType<T>
  timeoutMs?: number
}

function buildUrl(path: string, params?: Record<string, Primitive>) {
  const url = new URL(path, env.NEXT_PUBLIC_API_URL)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value))
      }
    }
  }
  return url.toString()
}

async function request<T>(
  method: string,
  path: string,
  { params, body, schema, timeoutMs = 15_000, signal, headers, ...init }: RequestOptions<T> = {},
): Promise<T> {
  const timeoutSignal = AbortSignal.timeout(timeoutMs)
  const finalSignal = signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal

  const response = await fetch(buildUrl(path, params), {
    ...init,
    method,
    credentials: "include",
    signal: finalSignal,
    headers: {
      Accept: "application/json",
      ...(body !== undefined && { "Content-Type": "application/json" }),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const isJson = response.headers.get("content-type")?.includes("application/json")
  const payload =
    response.status === 204 ? undefined : isJson ? await response.json() : await response.text()

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload && "message" in payload
        ? String(payload.message)
        : response.statusText
    throw new ApiError(response.status, message, payload)
  }

  return schema ? schema.parse(payload) : (payload as T)
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions<T>) => request<T>("GET", path, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions<T>) =>
    request<T>("POST", path, { ...options, body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions<T>) =>
    request<T>("PUT", path, { ...options, body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions<T>) =>
    request<T>("PATCH", path, { ...options, body }),
  delete: <T>(path: string, options?: RequestOptions<T>) => request<T>("DELETE", path, options),
}
