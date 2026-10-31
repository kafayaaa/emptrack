import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { isEmployeeEmailUniqueServer } from "@/features/employees/api/employees.server"

const checkEmailQuerySchema = z.object({
  email: z.string().trim().email("Format email tidak valid."),
  excludeId: z
    .string()
    .trim()
    .max(50, "excludeId maksimal 50 karakter")
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
})

function errorResponse(status: number, code: string, message: string, details?: unknown) {
  return NextResponse.json({ error: { code, message, details } }, { status })
}

export async function GET(request: NextRequest) {
  const searchParams = Object.fromEntries(request.nextUrl.searchParams)
  const parsed = checkEmailQuerySchema.safeParse(searchParams)

  if (!parsed.success) {
    return errorResponse(
      400,
      "INVALID_QUERY",
      "Parameter email tidak valid.",
      z.flattenError(parsed.error).fieldErrors,
    )
  }

  const { email, excludeId } = parsed.data

  try {
    const isUnique = await isEmployeeEmailUniqueServer(email, excludeId)
    return NextResponse.json(
      { isUnique },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    )
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      return errorResponse(504, "UPSTREAM_TIMEOUT", "Backend terlalu lama merespons.")
    }
    return errorResponse(502, "UPSTREAM_ERROR", "Gagal memeriksa keunikan email ke backend.")
  }
}
