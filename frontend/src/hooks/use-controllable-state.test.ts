import { describe, it, expect, vi, beforeEach } from "vitest"
import { useControllableState } from "./use-controllable-state"

let currentState: unknown
const mockSetState = vi.fn((val: unknown) => {
  currentState = typeof val === "function" ? (val as (prev: unknown) => unknown)(currentState) : val
})

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
    useCallback: vi.fn((fn) => fn),
  }
})

describe("useControllableState", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    currentState = undefined
  })

  it("bekerja dalam mode uncontrolled dengan defaultValue", () => {
    const [value, setValue] = useControllableState({
      defaultValue: false,
    })

    expect(value).toBe(false)

    setValue(true)
    expect(mockSetState).toHaveBeenCalledWith(true)
  })

  it("memanggil callback onChange saat nilai berubah pada mode uncontrolled", () => {
    const handleChange = vi.fn()
    const [, setValue] = useControllableState({
      defaultValue: "initial",
      onChange: handleChange,
    })

    setValue("updated")
    expect(handleChange).toHaveBeenCalledWith("updated")
  })

  it("bekerja dalam mode controlled saat value disediakan", () => {
    const handleChange = vi.fn()
    const [value, setValue] = useControllableState({
      value: true,
      defaultValue: false,
      onChange: handleChange,
    })

    expect(value).toBe(true)

    setValue(false)
    // Pada mode controlled, internal state tidak diubah, namun onChange dipanggil
    expect(mockSetState).not.toHaveBeenCalled()
    expect(handleChange).toHaveBeenCalledWith(false)
  })

  it("mendukung fungsi updater (prev => next)", () => {
    const handleChange = vi.fn()
    const [, setValue] = useControllableState({
      defaultValue: 10,
      onChange: handleChange,
    })

    setValue((prev: number) => prev + 5)
    expect(handleChange).toHaveBeenCalledWith(15)
  })
})
