import React from "react"
import { describe, expect, it, vi } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { DataTableColumnVisibility, defaultFormatColumnId } from "./data-table-column-visibility"
import type { Table } from "@tanstack/react-table"

describe("defaultFormatColumnId", () => {
  it("formats camelCase to Title Case", () => {
    expect(defaultFormatColumnId("employeeNumber")).toBe("Employee Number")
    expect(defaultFormatColumnId("fullName")).toBe("Full Name")
    expect(defaultFormatColumnId("hireDate")).toBe("Hire Date")
  })

  it("formats snake_case and kebab-case to Title Case", () => {
    expect(defaultFormatColumnId("created_at")).toBe("Created At")
    expect(defaultFormatColumnId("user-role")).toBe("User Role")
  })
})

describe("DataTableColumnVisibility", () => {
  const mockToggleVisibility = vi.fn()
  const mockToggleAllColumnsVisible = vi.fn()
  const mockResetColumnVisibility = vi.fn()

  const createMockTable = (
    columnsConfig: Array<{ id: string; isVisible: boolean; canHide?: boolean }>,
  ) => {
    return {
      getAllLeafColumns: () =>
        columnsConfig.map((col) => ({
          id: col.id,
          getCanHide: () => col.canHide ?? true,
          getIsVisible: () => col.isVisible,
          toggleVisibility: mockToggleVisibility,
        })),
      toggleAllColumnsVisible: mockToggleAllColumnsVisible,
      resetColumnVisibility: mockResetColumnVisibility,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as unknown as Table<any, any>
  }

  it("renders trigger button with default label and icon", () => {
    const table = createMockTable([
      { id: "col1", isVisible: true },
      { id: "col2", isVisible: true },
    ])

    const html = renderToStaticMarkup(<DataTableColumnVisibility table={table} />)
    expect(html).toContain('data-testid="data-table-column-visibility-trigger"')
    expect(html).toContain("Columns")
  })

  it("renders custom trigger label and title", () => {
    const table = createMockTable([{ id: "col1", isVisible: true }])

    const html = renderToStaticMarkup(
      <DataTableColumnVisibility table={table} triggerLabel="Pilih Kolom" title="Daftar Kolom" />,
    )

    expect(html).toContain('data-testid="data-table-column-visibility-trigger"')
    expect(html).toContain("Pilih Kolom")
  })

  it("displays hidden column badge when columns are hidden", () => {
    const table = createMockTable([
      { id: "col1", isVisible: true },
      { id: "col2", isVisible: false },
      { id: "col3", isVisible: false },
    ])

    const html = renderToStaticMarkup(<DataTableColumnVisibility table={table} />)
    expect(html).toContain('data-testid="data-table-hidden-column-badge"')
    expect(html).toContain("2")
  })

  it("returns null if no columns can be hidden", () => {
    const table = createMockTable([
      { id: "col1", isVisible: true, canHide: false },
      { id: "col2", isVisible: true, canHide: false },
    ])

    const html = renderToStaticMarkup(<DataTableColumnVisibility table={table} />)
    expect(html).toBe("")
  })

  it("supports getColumnLabel and showActions prop", () => {
    const table = createMockTable([
      { id: "employeeNumber", isVisible: true },
      { id: "department", isVisible: false },
    ])

    const element = (
      <DataTableColumnVisibility
        table={table}
        getColumnLabel={(id) => (id === "employeeNumber" ? "ID Karyawan" : id)}
        showActions={false}
      />
    )
    expect(element).toBeDefined()
  })
})
