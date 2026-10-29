import * as React from "react"

export interface DynamicOptions<P = Record<string, unknown>> {
  loader?: () => Promise<React.ComponentType<P> | { default: React.ComponentType<P> }>
  loading?: (props: {
    error?: Error | null
    isLoading?: boolean
    pastDelay?: boolean
  }) => React.ReactNode
  ssr?: boolean
}

/**
 * Vitest mock for Next.js "next/dynamic" to enable synchronous resolution
 * during server-side static markup rendering (renderToStaticMarkup) in unit tests.
 */
export default function dynamic<P extends Record<string, unknown> = Record<string, unknown>>(
  dynamicOptions:
    | (() => Promise<React.ComponentType<P> | { default: React.ComponentType<P> }>)
    | DynamicOptions<P>,
  options?: DynamicOptions<P>,
) {
  let ResolvedComponent: React.ComponentType<P> | null = null

  const loader = typeof dynamicOptions === "function" ? dynamicOptions : dynamicOptions?.loader

  if (typeof loader === "function") {
    try {
      const res = loader()
      if (res && typeof res.then === "function") {
        res
          .then((mod) => {
            ResolvedComponent = (
              "default" in mod && mod.default ? mod.default : mod
            ) as React.ComponentType<P>
          })
          .catch(() => {
            // Ignore loading errors in tests
          })
      }
    } catch {
      // Ignore sync exceptions during loader call
    }
  }

  return function DynamicComponent(props: P) {
    if (ResolvedComponent) {
      return <ResolvedComponent {...props} />
    }
    const LoadingComponent =
      options?.loading || (typeof dynamicOptions === "object" ? dynamicOptions?.loading : undefined)
    if (LoadingComponent) {
      return <LoadingComponent error={null} isLoading={true} pastDelay={true} />
    }
    return null
  }
}
