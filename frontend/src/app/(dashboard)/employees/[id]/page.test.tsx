import React from "react"
import { describe, it, expect, vi } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import EmployeeDetailPage, { generateMetadata } from "./page"

vi.mock("@/features/employees", () => ({
  EmployeeDetailContainer: ({ id }: { id: string }) => (
    <div data-testid="mock-employee-detail-container">Container ID: {id}</div>
  ),
  EmployeeDetailSkeleton: () => <div data-testid="mock-skeleton">Skeleton</div>,
}))

describe("EmployeeDetailPage (/employees/[id])", () => {
  it("generateMetadata menghasilkan title dan description yang tepat sesuai ID", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ id: "101" }),
    })

    expect(metadata.title).toBe("Detail Employee #101 | EmpTrack")
    expect(metadata.description).toContain("101")
  })

  it("merender EmployeeDetailContainer dengan ID yang di-resolve dari params", async () => {
    const pageJsx = await EmployeeDetailPage({
      params: Promise.resolve({ id: "101" }),
    })

    const html = renderToStaticMarkup(pageJsx)
    expect(html).toContain("Container ID: 101")
    expect(html).toContain('data-testid="mock-employee-detail-container"')
  })
})
