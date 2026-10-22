import { describe, expect, it, beforeEach, vi } from "vitest"
import * as React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import {
  useDataTableVisibility,
  type UseDataTableVisibilityOptions,
  type UseDataTableVisibilityReturn,
} from "./use-data-table-visibility"

describe("useDataTableVisibility hook", () => {
  let currentResult: UseDataTableVisibilityReturn | null = null

  function TestHookComponent({
    options,
    triggerAction,
  }: {
    options?: UseDataTableVisibilityOptions
    triggerAction?: (res: UseDataTableVisibilityReturn) => void
  }) {
    const res = useDataTableVisibility(options)
    currentResult = res
    React.useEffect(() => {
      triggerAction?.(res)
    }, [res, triggerAction])
    return <div data-testid="test-visibility-hook" />
  }

  function renderHook(
    options?: UseDataTableVisibilityOptions,
    triggerAction?: (res: UseDataTableVisibilityReturn) => void,
  ): UseDataTableVisibilityReturn {
    currentResult = null
    renderToStaticMarkup(<TestHookComponent options={options} triggerAction={triggerAction} />)
    if (!currentResult) {
      throw new Error("Failed to render TestHookComponent")
    }
    return currentResult
  }

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("exports useDataTableVisibility function", () => {
    expect(typeof useDataTableVisibility).toBe("function")
  })

  it("initializes with empty object by default", () => {
    const result = renderHook()
    expect(result.columnVisibility).toEqual({})
  })

  it("initializes with provided initialVisibility", () => {
    const result = renderHook({
      initialVisibility: { hireDate: false, department: true },
    })
    expect(result.columnVisibility).toEqual({
      hireDate: false,
      department: true,
    })
  })

  it("loads initial state from localStorage when available", () => {
    const mockStorage: Record<string, string> = {
      "test-columns": JSON.stringify({ status: false, position: true }),
    }
    const originalWindow = globalThis.window
    globalThis.window = {
      localStorage: {
        getItem: (key: string) => mockStorage[key] ?? null,
        setItem: vi.fn(),
      },
    } as unknown as Window & typeof globalThis

    try {
      const result = renderHook({
        storageKey: "test-columns",
        initialVisibility: { department: false },
      })

      expect(result.columnVisibility).toEqual({
        department: false,
        status: false,
        position: true,
      })
    } finally {
      globalThis.window = originalWindow
    }
  })

  it("provides callbacks for visibility manipulation", () => {
    const result = renderHook()
    expect(typeof result.onColumnVisibilityChange).toBe("function")
    expect(typeof result.toggleColumnVisibility).toBe("function")
    expect(typeof result.resetColumnVisibility).toBe("function")
    expect(typeof result.showAllColumns).toBe("function")
  })

  it("invokes toggleColumnVisibility, onColumnVisibilityChange, resetColumnVisibility, and showAllColumns without error", () => {
    const result = renderHook({ storageKey: "table-prefs" })
    expect(() => {
      result.toggleColumnVisibility("hireDate", false)
      result.onColumnVisibilityChange({ hireDate: true })
      result.resetColumnVisibility()
      result.showAllColumns(["col1", "col2"])
    }).not.toThrow()
  })
})
