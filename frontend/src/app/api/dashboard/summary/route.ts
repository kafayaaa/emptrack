import { NextResponse } from "next/server"
import { getDashboardSummaryServer } from "@/features/dashboard/api/dashboard.server"

export async function GET() {
  try {
    const summary = await getDashboardSummaryServer()

    return NextResponse.json(summary, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    })
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "DASHBOARD_ERROR",
          message: "Gagal memuat ringkasan data dashboard.",
        },
      },
      { status: 500 },
    )
  }
}
