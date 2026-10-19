"use client"

import * as React from "react"

/**
 * A custom hook that delays updating the state value until after a specified delay has elapsed
 * since the last time the value changed.
 *
 * Useful for scenarios like search inputs, real-time validations, or rate-limiting expensive queries.
 *
 * @param value The value to debounce.
 * @param delay The delay time in milliseconds (default: 300ms).
 * @returns The debounced value.
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value)

  React.useEffect(() => {
    const timer = setTimeout(
      () => {
        setDebouncedValue(value)
      },
      Math.max(0, delay),
    )

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
