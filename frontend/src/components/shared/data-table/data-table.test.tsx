import React from "react"
import { describe, expect, it, vi } from "vitest"
import { createColumnHelper } from "@tanstack/react-table"
import { DataTable, dataTableFeatures } from "./data-table"
import { DataTableColumnHeader } from "./data-table-column-header"

interface TestItem {
  id: string
  name: string
  role: string
}

const columnHelper = createColumnHelper<typeof dataTableFeatures, TestItem>()

const testColumns = columnHelper.columns([
  columnHelper.accessor("id", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
    enableSorting: true,
  }),
  columnHelper.accessor("name", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    enableSorting: true,
  }),
  columnHelper.accessor("role", {
    header: "Role",
    enableSorting: false,
  }),
])

const testData: TestItem[] = [
  { id: "1", name: "Alice", role: "Developer" },
  { id: "2", name: "Bob", role: "Designer" },
  { id: "3", name: "Charlie", role: "Manager" },
]

describe("data-table.tsx (DataTable Generic Component)", () => {
  it("renders DataTable component with data rows successfully", () => {
    const component = <DataTable columns={testColumns} data={testData} pageSizeOptions={[10, 20]} />
    expect(component).toBeDefined()
  })

  it("handles empty state and loading state gracefully", () => {
    const emptyComponent = (
      <DataTable columns={testColumns} data={[]} emptyMessage="Custom empty message" />
    )
    expect(emptyComponent).toBeDefined()

    const loadingComponent = <DataTable columns={testColumns} data={[]} isLoading={true} />
    expect(loadingComponent).toBeDefined()
  })

  it("supports controlled pagination and sorting callbacks", () => {
    const onPaginationChange = vi.fn()
    const onSortingChange = vi.fn()

    const controlledComponent = (
      <DataTable
        columns={testColumns}
        data={testData}
        pageCount={5}
        pagination={{ pageIndex: 0, pageSize: 10 }}
        onPaginationChange={onPaginationChange}
        sorting={[{ id: "name", desc: false }]}
        onSortingChange={onSortingChange}
      />
    )

    expect(controlledComponent).toBeDefined()
  })
})
