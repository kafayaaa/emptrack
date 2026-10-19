import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { useDebounce } from "./use-debounce"

let currentState: unknown
const mockSetState = vi.fn((val: unknown) => {
  currentState = val
})
let effectCleanup: (() => void) | void = undefined
let currentEffect: (() => void | (() => void)) | null = null

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>()
  return {
    ...actual,
    useState: <T>(initial: T | (() => T)) => {
      if (currentState === undefined) {
        currentState = typeof initial === "function" ? (initial as () => T)() : initial
      }
      return [currentState, mockSetState]
    },
    useEffect: (cb: () => void | (() => void)) => {
      currentEffect = cb
    },
  }
})

describe("useDebounce hook", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockSetState.mockClear()
    currentState = undefined
    currentEffect = null
    effectCleanup = undefined
  })

  afterEach(() => {
    if (typeof effectCleanup === "function") {
      effectCleanup()
    }
    vi.useRealTimers()
  })

  it("returns initial value immediately on first call", () => {
    const result = useDebounce("initial-value", 300)
    expect(result).toBe("initial-value")
  })

  it("schedules an update with the specified delay", () => {
    useDebounce("new-value", 500)
    expect(currentEffect).toBeTypeOf("function")

    // Run the effect registered by useDebounce
    effectCleanup = currentEffect?.()

    expect(mockSetState).not.toHaveBeenCalled()

    vi.advanceTimersByTime(499)
    expect(mockSetState).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(mockSetState).toHaveBeenCalledWith("new-value")
  })

  it("clears timeout on cleanup before delay completes", () => {
    useDebounce("cancelled-value", 300)
    effectCleanup = currentEffect?.()

    const clearTimeoutSpy = vi.spyOn(global, "clearTimeout")

    if (typeof effectCleanup === "function") {
      effectCleanup()
    }

    expect(clearTimeoutSpy).toHaveBeenCalled()

    vi.advanceTimersByTime(300)
    expect(mockSetState).not.toHaveBeenCalled()
  })

  it("uses default delay of 300ms when delay parameter is omitted", () => {
    useDebounce("default-delay-value")
    effectCleanup = currentEffect?.()

    vi.advanceTimersByTime(299)
    expect(mockSetState).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(mockSetState).toHaveBeenCalledWith("default-delay-value")
  })
})
