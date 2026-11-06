import * as React from "react"
import { AlertCircle, RefreshCw } from "lucide-react"
import { TableRow, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

export interface DataTableErrorContentProps {
  title?: string
  description?: string
  errorMessage?: string
  retryLabel?: string
  onRetry?: () => void
  headingLevel?: "h2" | "h3"
}

export function DataTableErrorContent({
  title = "Gagal memuat data",
  description = "Terjadi kesalahan saat memuat atau memproses data tabel.",
  errorMessage,
  retryLabel = "Coba lagi",
  onRetry,
  headingLevel = "h2",
}: DataTableErrorContentProps) {
  const Heading = headingLevel

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex flex-col items-center justify-center gap-3.5 p-8 text-center"
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-1 ring-destructive/20">
        <AlertCircle className="size-7 stroke-[1.75]" />
      </div>
      <div className="max-w-md space-y-1">
        <Heading className="text-base font-semibold tracking-tight text-foreground">
          {title}
        </Heading>
        {description ? (
          <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
        {errorMessage ? (
          <p className="mt-1.5 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-1 font-mono text-[11px] font-medium break-all text-destructive">
            {errorMessage}
          </p>
        ) : null}
      </div>
      {onRetry ? (
        <div className="mt-2 flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onRetry} className="gap-2">
            <RefreshCw className="size-3.5" />
            {retryLabel}
          </Button>
        </div>
      ) : null}
    </div>
  )
}

export interface DataTableErrorStateProps extends DataTableErrorContentProps {
  colSpan: number
}

function BaseDataTableErrorState({ colSpan, ...contentProps }: DataTableErrorStateProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-64 text-center">
        <DataTableErrorContent {...contentProps} />
      </TableCell>
    </TableRow>
  )
}

export const DataTableErrorState = React.memo(BaseDataTableErrorState)
