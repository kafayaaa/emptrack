import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(request: NextRequest) {
  // Placeholder — logic auth guard akan ditambahkan di sini nanti
  // Contoh nanti: cek token dari cookies, redirect ke /login kalau tidak ada

  return NextResponse.next()
}

// Matcher menentukan route mana saja yang akan melewati middleware ini.
// Penting untuk performa — jangan biarkan middleware jalan di semua request
// (termasuk static file, image, dll) kalau tidak perlu.
export const config = {
  matcher: [
    /*
     * Match semua path KECUALI yang diawali dengan:
     * - api (route handler)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, dll
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
