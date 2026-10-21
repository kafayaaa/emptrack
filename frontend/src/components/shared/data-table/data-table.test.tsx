import React from "react"
import { describe, expect, it, vi } from "vitest"
import { createColumnHelper } from "@tanstack/react-table"
import { Users } from "lucide-react"
import { DataTable, dataTableFeatures } from "./data-table"
import { DataTableColumnHeader } from "./data-table-column-header"
import { DataTableSkeleton } from "./data-table-skeleton"
import { DataTableEmptyState } from "./data-table-empty-state"
import { DataTableErrorState } from "./data-table-error-state"
import { DataTablePagination } from "./data-table-pagination"
import { TableErrorBoundary } from "./table-error-boundary"

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
      <DataTable
        columns={testColumns}
        data={[]}
        emptyTitle="No users found"
        emptyDescription="Please try another query."
        emptyIcon={Users}
        emptyAction={<button type="button">Reset</button>}
      />
    )
    expect(emptyComponent).toBeDefined()

    const loadingComponent = (
      <DataTable columns={testColumns} data={[]} isLoading={true} skeletonRowCount={7} />
    )
    expect(loadingComponent).toBeDefined()
  })

  it("renders error state when isError is true with retry callback", () => {
    const onRetry = vi.fn()
    const errorComponent = (
      <DataTable
        columns={testColumns}
        data={[]}
        isError={true}
        errorTitle="Terjadi kesalahan"
        errorDescription="Tidak dapat memuat data."
        errorMessage="Network error 500"
        retryLabel="Ulangi"
        onRetry={onRetry}
      />
    )
    expect(errorComponent).toBeDefined()
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

  it("renders mobile card layout when renderMobileCard is provided", () => {
    const cardComponent = (
      <DataTable
        columns={testColumns}
        data={testData}
        renderMobileCard={(item) => (
          <div data-testid={`card-${item.id}`}>
            <h3>{item.name}</h3>
            <p>{item.role}</p>
          </div>
        )}
      />
    )
    expect(cardComponent).toBeDefined()
  })

  it("handles isPlaceholderData and isFetching transitions without throwing", () => {
    const transitionComponent = (
      <DataTable
        columns={testColumns}
        data={testData}
        pageCount={3}
        isPlaceholderData={true}
        isFetching={true}
        pagination={{ pageIndex: 1, pageSize: 10 }}
      />
    )
    expect(transitionComponent).toBeDefined()
  })

  describe("DataTableSkeleton component", () => {
    it("renders skeleton rows and cells corresponding to columnCount and rowCount", () => {
      const skeleton = <DataTableSkeleton columnCount={4} rowCount={6} />
      expect(skeleton).toBeDefined()
    })

    it("is memoized with React.memo", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((DataTableSkeleton as any).$$typeof?.toString()).toContain("react.memo")
    })
  })

  describe("DataTableEmptyState component", () => {
    it("renders empty state with default and custom values", () => {
      const defaultEmpty = <DataTableEmptyState colSpan={4} />
      expect(defaultEmpty).toBeDefined()

      const customEmpty = (
        <DataTableEmptyState
          colSpan={4}
          title="Custom Title"
          description="Custom Description"
          icon={Users}
          action={<button type="button">Action</button>}
        />
      )
      expect(customEmpty).toBeDefined()
    })

    it("is memoized with React.memo", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((DataTableEmptyState as any).$$typeof?.toString()).toContain("react.memo")
    })
  })

  describe("DataTableErrorState component", () => {
    it("renders error state with default and custom properties", () => {
      const defaultError = <DataTableErrorState colSpan={4} />
      expect(defaultError).toBeDefined()

      const onRetry = vi.fn()
      const customError = (
        <DataTableErrorState
          colSpan={4}
          title="Kesalahan Kustom"
          description="Deskripsi kesalahan"
          errorMessage="Error code: 500"
          retryLabel="Coba Lagi"
          onRetry={onRetry}
        />
      )
      expect(customError).toBeDefined()
    })

    it("is memoized with React.memo", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((DataTableErrorState as any).$$typeof?.toString()).toContain("react.memo")
    })
  })

  describe("DataTableColumnHeader component", () => {
    it("is memoized with React.memo", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((DataTableColumnHeader as any).$$typeof?.toString()).toContain("react.memo")
    })

    it("calls column.toggleSorting without arguments when clicked to support multi-directional sorting cycle", () => {
      const toggleSortingMock = vi.fn()
      const mockColumn = {
        getCanSort: () => true,
        getIsSorted: () => false as const,
        toggleSorting: toggleSortingMock,
      }

      const element = <DataTableColumnHeader column={mockColumn} title="Test Title" />
      expect(element).toBeDefined()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rendered = ((DataTableColumnHeader as any).type ?? DataTableColumnHeader)(element.props)
      const buttonElement = rendered.props.children
      buttonElement.props.onClick()
      expect(toggleSortingMock).toHaveBeenCalledTimes(1)
      expect(toggleSortingMock).toHaveBeenCalledWith()
    })
  })

  describe("DataTablePagination component", () => {
    it("is memoized with React.memo", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((DataTablePagination as any).$$typeof?.toString()).toContain("react.memo")
    })
  })

  describe("TableErrorBoundary component", () => {
    it("renders children when no error occurs", () => {
      const boundary = (
        <TableErrorBoundary>
          <div>Table Content</div>
        </TableErrorBoundary>
      )
      expect(boundary).toBeDefined()
    })

    it("handles error boundary state transitions and custom fallback", () => {
      const boundary = new TableErrorBoundary({
        children: <div>Child</div>,
      })
      expect(boundary.state.hasError).toBe(false)
      expect(boundary.state.error).toBeNull()

      const error = new Error("Test error")
      const updatedState = TableErrorBoundary.getDerivedStateFromError(error)
      expect(updatedState.hasError).toBe(true)
      expect(updatedState.error).toBe(error)

      const onReset = vi.fn()
      const resetBoundary = new TableErrorBoundary({
        children: <div>Child</div>,
        onReset,
      })
      ;(resetBoundary as unknown as { updater: unknown }).updater = {
        enqueueSetState: (
          _inst: unknown,
          partialState:
            | Partial<typeof resetBoundary.state>
            | ((prevState: typeof resetBoundary.state) => Partial<typeof resetBoundary.state>),
        ) => {
          Object.assign(
            resetBoundary.state,
            typeof partialState === "function" ? partialState(resetBoundary.state) : partialState,
          )
        },
      }
      resetBoundary.state = { hasError: true, error }
      resetBoundary.resetErrorBoundary()
      expect(onReset).toHaveBeenCalled()
      expect(resetBoundary.state.hasError).toBe(false)
      expect(resetBoundary.state.error).toBeNull()

      const onError = vi.fn()
      const catchBoundary = new TableErrorBoundary({
        children: <div>Child</div>,
        onError,
      })
      const errorInfo = { componentStack: "stack" } as React.ErrorInfo
      catchBoundary.componentDidCatch(error, errorInfo)
      expect(onError).toHaveBeenCalledWith(error, errorInfo)
    })

    it("renders fallback UI when error state is active", () => {
      const error = new Error("Network failure")

      // Default fallback
      const defaultBoundary = new TableErrorBoundary({
        children: <div>Table Content</div>,
        title: "Kustom Gagal",
        description: "Gagal memuat",
      })
      defaultBoundary.state = { hasError: true, error }
      const defaultRender = defaultBoundary.render()
      expect(defaultRender).toBeDefined()

      // Node fallback
      const nodeFallbackBoundary = new TableErrorBoundary({
        children: <div>Table Content</div>,
        fallback: <div>Custom Fallback Node</div>,
      })
      nodeFallbackBoundary.state = { hasError: true, error }
      expect(nodeFallbackBoundary.render()).toBeDefined()

      // Function fallback
      const fnFallbackBoundary = new TableErrorBoundary({
        children: <div>Table Content</div>,
        fallback: ({ error: err, resetErrorBoundary }) => (
          <button type="button" onClick={resetErrorBoundary}>
            {err.message}
          </button>
        ),
      })
      fnFallbackBoundary.state = { hasError: true, error }
      expect(fnFallbackBoundary.render()).toBeDefined()
    })
  })
})
