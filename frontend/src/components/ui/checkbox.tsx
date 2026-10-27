"use client"

import * as React from "react"
import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import { Check, Minus } from "lucide-react"
import { cn } from "cn"

export type CheckboxProps = CheckboxPrimitive.Root.Props

export function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer group/checkbox flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input bg-background text-primary-foreground shadow-2xs transition-colors outline-none",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-checked:border-primary data-checked:bg-primary",
        "data-indeterminate:border-primary data-indeterminate:bg-primary",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex size-full items-center justify-center text-current"
        render={(indicatorProps, state) => (
          <span {...indicatorProps}>
            {state.indeterminate ? (
              <Minus className="size-3 stroke-[2.5]" aria-hidden="true" />
            ) : (
              <Check className="size-3 stroke-[2.5]" aria-hidden="true" />
            )}
          </span>
        )}
      />
    </CheckboxPrimitive.Root>
  )
}
