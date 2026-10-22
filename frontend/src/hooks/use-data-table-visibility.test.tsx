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
    })
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

  it("initializes with empty object by default and isHydrated false during SSR", () => {
    const result = renderHook()
    expect(result.columnVisibility).toEqual({})
    expect(result.isHydrated).toBe(false)
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

  it("does not read localStorage on initial server render to prevent SSR hydration mismatch", () => {
    const getItemSpy = vi.fn().mockReturnValue(JSON.stringify({ status: false }))
    const originalWindow = globalThis.window
    globalThis.window = {
      localStorage: {
        getItem: getItemSpy,
        setItem: vi.fn(),
      },
    } as unknown as Window & typeof globalThis

    try {
      const result = renderHook({
        storageKey: "test-columns",
        initialVisibility: { department: true },
      })

      // Initial server render must match initialVisibility exactly (hydration safe)
      expect(result.columnVisibility).toEqual({ department: true })
      expect(result.isHydrated).toBe(false)
      // getServerSnapshot in useSyncExternalStore is used during SSR without querying localStorage
      expect(getItemSpy).not.toHaveBeenCalled()
    } finally {
      globalThis.window = originalWindow
    }
  })

  it("handles corrupted or invalid JSON in localStorage gracefully without throwing", () => {
    const originalWindow = globalThis.window
    globalThis.window = {
      localStorage: {
        getItem: () => "invalid-json{",
        setItem: vi.fn(),
      },
    } as unknown as Window & typeof globalThis

    try {
      const result = renderHook({
        storageKey: "corrupted-key",
        initialVisibility: { department: true },
      })

      expect(result.columnVisibility).toEqual({ department: true })
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
    const setItemSpy = vi.fn()
    const removeItemSpy = vi.fn()
    const dispatchEventSpy = vi.fn()
    const originalWindow = globalThis.window
    globalThis.window = {
      localStorage: {
        getItem: () => null,
        setItem: setItemSpy,
        removeItem: removeItemSpy,
      },
      dispatchEvent: dispatchEventSpy,
    } as unknown as Window & typeof globalThis

    try {
      const result = renderHook({ storageKey: "table-prefs" })
      expect(() => {
        result.toggleColumnVisibility("hireDate", false)
        result.onColumnVisibilityChange({ hireDate: true })
        result.showAllColumns(["col1", "col2"])
        result.resetColumnVisibility()
      }).not.toThrow()

      expect(setItemSpy).toHaveBeenCalled()
      expect(removeItemSpy).toHaveBeenCalledWith("table-prefs")
    } finally {
      globalThis.window = originalWindow
    }
  })
})
