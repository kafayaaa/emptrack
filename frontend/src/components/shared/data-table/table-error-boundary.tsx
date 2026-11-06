"use client"

import * as React from "react"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface TableErrorBoundaryProps {
  children: React.ReactNode
  fallback?:
    React.ReactNode | ((props: { error: Error; resetErrorBoundary: () => void }) => React.ReactNode)
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  onReset?: () => void
  title?: string
  description?: string
  retryLabel?: string
}

interface TableErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class TableErrorBoundary extends React.Component<
  TableErrorBoundaryProps,
  TableErrorBoundaryState
> {
  constructor(props: TableErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error): TableErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.props.onError?.(error, errorInfo)
  }

  resetErrorBoundary = (): void => {
    this.props.onReset?.()
    this.setState({
      hasError: false,
      error: null,
    })
  }

  render(): React.ReactNode {
    const { hasError, error } = this.state
    const {
      children,
      fallback,
      title = "Gagal memuat tabel",
      description = "Terjadi kesalahan saat memproses data tabel. Silakan coba muat ulang bagian ini.",
      retryLabel = "Coba lagi",
    } = this.props

    if (hasError && error) {
      if (typeof fallback === "function") {
        return fallback({ error, resetErrorBoundary: this.resetErrorBoundary })
      }

      if (fallback) {
        return fallback
      }

      return (
        <div
          role="alert"
          aria-live="assertive"
          className="flex min-h-64 w-full flex-col items-center justify-center gap-3.5 rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center"
        >
          <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-1 ring-destructive/20">
            <AlertCircle className="size-7 stroke-[1.75]" />
          </div>
          <div className="max-w-md space-y-1">
            <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>
            <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
            {error.message ? (
              <p className="mt-1.5 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-1 font-mono text-[11px] font-medium break-all text-destructive">
                {error.message}
              </p>
            ) : null}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={this.resetErrorBoundary}
            className="mt-2 gap-2"
          >
            <RefreshCw className="size-3.5" />
            {retryLabel}
          </Button>
        </div>
      )
    }

    return children
  }
}
