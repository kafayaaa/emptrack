"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// Di React 19, next-themes menginjeksi tag <script> internal untuk mencegah FOUC tema.
// React 19 memunculkan warning/error dev overlay karena menganggap script tag di dalam komponen tidak dieksekusi di client,
// padahal script tersebut sengaja dirender untuk blocking execution sebelum hidrasi.
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const originalError = console.error
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].includes("Encountered a script tag")) {
      return
    }
    originalError.apply(console, args)
  }
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
