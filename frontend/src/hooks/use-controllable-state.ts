import * as React from "react"

export interface UseControllableStateOptions<T> {
  value?: T
  defaultValue: T
  onChange?: (value: T) => void
}

/**
 * Custom hook untuk mengelola state yang dapat bersifat controlled maupun uncontrolled (EMPTRACK-82).
 *
 * Mengurangi duplikasi kode logika `isControlled ? controlled : uncontrolled` di modal dialog,
 * popover, sheet, dan komponen form wrapper lainnya.
 */
export function useControllableState<T>({
  value: controlledValue,
  defaultValue,
  onChange,
}: UseControllableStateOptions<T>): [T, (nextValue: T | ((prev: T) => T)) => void] {
  const [uncontrolledValue, setUncontrolledValue] = React.useState<T>(defaultValue)
  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : uncontrolledValue

  const setValue = React.useCallback(
    (nextValue: T | ((prev: T) => T)) => {
      const resolvedValue =
        typeof nextValue === "function" ? (nextValue as (prev: T) => T)(value) : nextValue

      if (!isControlled) {
        setUncontrolledValue(resolvedValue)
      }
      onChange?.(resolvedValue)
    },
    [isControlled, onChange, value],
  )

  return [value, setValue]
}
