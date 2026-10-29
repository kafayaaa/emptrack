import React from "react"
import { describe, it, expect, vi } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { EmployeeBulkDeleteDialog } from "./employee-bulk-delete-dialog"
import { Progress } from "@/components/ui/progress"

vi.mock("../hooks/use-bulk-delete-employees", () => ({
  useBulkDeleteEmployees: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    progress: { current: 0, total: 0, percentage: 0 },
    resetProgress: vi.fn(),
  }),
}))

describe("EmployeeBulkDeleteDialog component (EMPTRACK-78)", () => {
  const dummyEmployeeIds = ["emp-1", "emp-2", "emp-3"]

  it("renders default trigger button with item count and accessible aria-label", () => {
    const html = renderToStaticMarkup(<EmployeeBulkDeleteDialog employeeIds={dummyEmployeeIds} />)

    expect(html).toContain("Hapus Terpilih (3)")
    expect(html).toContain('aria-label="Hapus 3 karyawan terpilih"')
    expect(html).toContain('data-slot="alert-dialog-trigger"')
  })

  it("renders custom trigger element when provided", () => {
    const html = renderToStaticMarkup(
      <EmployeeBulkDeleteDialog
        employeeIds={dummyEmployeeIds}
        trigger={
          <button type="button" className="custom-bulk-delete-btn">
            Hapus Massal
          </button>
        }
      />,
    )

    expect(html).toContain("Hapus Massal")
    expect(html).toContain("custom-bulk-delete-btn")
  })

  it("renders progress bar markup with correct role and value", () => {
    const html = renderToStaticMarkup(<Progress value={66} />)

    expect(html).toContain('role="progressbar"')
    expect(html).toContain('aria-valuenow="66"')
    expect(html).toContain('data-slot="progress"')
    expect(html).toContain('data-slot="progress-track"')
    expect(html).toContain('data-slot="progress-indicator"')
  })
})
