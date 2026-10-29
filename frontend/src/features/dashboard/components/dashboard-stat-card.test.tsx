import React from "react"
import { describe, it, expect } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { Users } from "lucide-react"
import { DashboardStatCard } from "./dashboard-stat-card"
import { Badge } from "@/components/ui/badge"

describe("DashboardStatCard component", () => {
  it("merender judul, nilai, deskripsi, dan ikon", () => {
    const html = renderToStaticMarkup(
      <DashboardStatCard
        title="Total Karyawan"
        value="1.250"
        description="1.200 aktif • 50 nonaktif"
        icon={Users}
        data-testid="stat-card"
      />,
    )

    expect(html).toContain("Total Karyawan")
    expect(html).toContain("1.250")
    expect(html).toContain("1.200 aktif • 50 nonaktif")
    expect(html).toContain('data-testid="stat-card"')
  })

  it("merender badge dan link navigasi jika href diberikan", () => {
    const html = renderToStaticMarkup(
      <DashboardStatCard
        title="Aset Tersedia"
        value="45"
        icon={Users}
        href="/assets?status=available"
        badge={<Badge>Siap Pakai</Badge>}
      />,
    )

    expect(html).toContain('href="/assets?status=available"')
    expect(html).toContain("Siap Pakai")
    expect(html).toContain("Lihat detail")
  })
})
