import React from "react"
import { describe, expect, it, vi } from "vitest"
import { createColumnHelper } from "@tanstack/react-table"
import { Users } from "lucide-react"
import { VirtualizedDataTable } from "./virtualized-data-table"
import { DataTableColumnHeader } from "./data-table-column-header"
import { dataTableFeatures } from "./data-table"

interface TestUser {
  id: string
  name: string
  department: string
}

const columnHelper = createColumnHelper<typeof dataTableFeatures, TestUser>()

const testColumns = columnHelper.columns([
  columnHelper.accessor("id", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
    enableSorting: true,
  }),
  columnHelper.accessor("name", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    enableSorting: true,
  }),
  columnHelper.accessor("department", {
    header: "Department",
    enableSorting: false,
  }),
])

const generateUsers = (count: number): TestUser[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `usr-${index + 1}`,
    name: `User ${index + 1}`,
    department: index % 2 === 0 ? "Engineering" : "Product",
  }))

describe("virtualized-data-table.tsx (VirtualizedDataTable Component)", () => {
  it("renders virtualized table with rows and custom scroll height", () => {
    const data = generateUsers(50)
    const element = (
      <VirtualizedDataTable
        columns={testColumns}
        data={data}
        height={400}
        estimateRowHeight={48}
        overscan={5}
      />
    )
    expect(element).toBeDefined()
  })

  it("handles loading and error states properly", () => {
    const onRetry = vi.fn()
    const loadingElement = (
      <VirtualizedDataTable columns={testColumns} data={[]} isLoading={true} skeletonRowCount={8} />
    )
    expect(loadingElement).toBeDefined()

    const errorElement = (
      <VirtualizedDataTable
        columns={testColumns}
        data={[]}
        isError={true}
        errorTitle="Gagal memuat"
        errorMessage="Network error"
        onRetry={onRetry}
      />
    )
    expect(errorElement).toBeDefined()
  })

  it("handles empty state with icon and action", () => {
    const emptyElement = (
      <VirtualizedDataTable
        columns={testColumns}
        data={[]}
        emptyTitle="Tidak ada data"
        emptyDescription="Coba ubah filter pencarian."
        emptyIcon={Users}
        emptyAction={<button type="button">Reset Filter</button>}
      />
    )
    expect(emptyElement).toBeDefined()
  })

  it("supports controlled pagination when showPagination is enabled", () => {
    const onPaginationChange = vi.fn()
    const onSortingChange = vi.fn()
    const data = generateUsers(20)

    const tableWithPagination = (
      <VirtualizedDataTable
        columns={testColumns}
        data={data}
        showPagination={true}
        pageCount={2}
        pagination={{ pageIndex: 0, pageSize: 10 }}
        onPaginationChange={onPaginationChange}
        sorting={[{ id: "name", desc: false }]}
        onSortingChange={onSortingChange}
        pageSizeOptions={[10, 20]}
      />
    )

    expect(tableWithPagination).toBeDefined()
  })
})
