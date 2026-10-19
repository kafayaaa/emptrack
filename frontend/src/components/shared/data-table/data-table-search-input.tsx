"use client"

import * as React from "react"
import { Search, X } from "lucide-react"
import { cn } from "cn"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useDebounce } from "@/hooks"

export interface DataTableSearchInputProps extends Omit<
  React.ComponentProps<"input">,
  "onChange" | "value"
> {
  /**
   * The current search value (can be controlled externally, e.g. from nuqs or parent state).
   */
  value?: string
  /**
   * Default value for uncontrolled usage.
   */
  defaultValue?: string
  /**
   * Callback fired immediately when local input changes (before debounce).
   */
  onChange?: (value: string) => void
  /**
   * Callback fired with the debounced value after user pauses typing.
   */
  onDebouncedChange?: (value: string) => void
  /**
   * Debounce delay in milliseconds. Defaults to 300ms.
   */
  debounceMs?: number
  /**
   * Placeholder text for the search input. Defaults to "Cari karyawan...".
   */
  placeholder?: string
  /**
   * Accessible label for search input and clear button.
   */
  ariaLabel?: string
  /**
   * Optional container className.
   */
  containerClassName?: string
}

/**
 * Reusable search input component with debounce, instant clear button,
 * and keyboard navigation support (Escape to clear).
 */
export function DataTableSearchInput({
  value,
  defaultValue = "",
  onChange,
  onDebouncedChange,
  debounceMs = 300,
  placeholder = "Cari karyawan...",
  ariaLabel = "Cari data",
  containerClassName,
  className,
  onKeyDown,
  ...inputProps
}: DataTableSearchInputProps) {
  const [prevControlledValue, setPrevControlledValue] = React.useState(value)
  const [localValue, setLocalValue] = React.useState<string>(value ?? defaultValue)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const isFirstRender = React.useRef(true)

  // Adjust state directly during rendering when controlled value prop changes
  if (value !== undefined && value !== prevControlledValue) {
    setPrevControlledValue(value)
    setLocalValue(value)
  }

  const debouncedValue = useDebounce(localValue, debounceMs)

  // Trigger onDebouncedChange whenever the debounced value changes (skipping initial mount)
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    onDebouncedChange?.(debouncedValue)
  }, [debouncedValue, onDebouncedChange])

  const handleInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = e.target.value
      setLocalValue(nextValue)
      onChange?.(nextValue)
    },
    [onChange],
  )

  const handleClear = React.useCallback(() => {
    setLocalValue("")
    onChange?.("")
    onDebouncedChange?.("")
    inputRef.current?.focus()
  }, [onChange, onDebouncedChange])

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape" && localValue) {
        e.preventDefault()
        handleClear()
      }
      onKeyDown?.(e)
    },
    [localValue, handleClear, onKeyDown],
  )

  return (
    <div
      role="search"
      className={cn("relative flex w-full max-w-sm items-center", containerClassName)}
    >
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 size-4 text-muted-foreground select-none"
      />
      <Input
        ref={inputRef}
        type="text"
        value={localValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={cn(
          "h-9 pr-9 pl-9 text-sm transition-all placeholder:text-muted-foreground/70",
          className,
        )}
        {...inputProps}
      />
      {localValue ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={handleClear}
          aria-label="Hapus kata kunci pencarian"
          title="Hapus pencarian (Esc)"
          className="absolute right-2 text-muted-foreground transition-opacity hover:text-foreground"
        >
          <X className="size-3.5" />
        </Button>
      ) : null}
    </div>
  )
}
