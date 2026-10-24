import * as React from "react"
import { AlertCircle, RefreshCw } from "lucide-react"
import { TableRow, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

export interface DataTableErrorStateProps {
  colSpan: number
  title?: string
  description?: string
  errorMessage?: string
  retryLabel?: string
  onRetry?: () => void
  headingLevel?: "h2" | "h3"
}

function BaseDataTableErrorState({
  colSpan,
  title = "Gagal memuat data",
  description = "Terjadi kesalahan saat memuat atau memproses data tabel.",
  errorMessage,
  retryLabel = "Coba lagi",
  onRetry,
  headingLevel = "h2",
}: DataTableErrorStateProps) {
  const Heading = headingLevel

  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-64 text-center">
        <div
          role="alert"
          aria-live="assertive"
          className="flex flex-col items-center justify-center gap-3 p-6 text-center"
        >
          <div className="rounded-full bg-destructive/10 p-3 text-destructive">
            <AlertCircle className="h-6 w-6 stroke-[1.75]" />
          </div>
          <div className="max-w-md space-y-1">
            <Heading className="text-sm font-semibold text-foreground">{title}</Heading>
            {description ? (
              <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
            ) : null}
            {errorMessage ? (
              <p className="mt-1 font-mono text-[11px] break-all text-destructive/80">
                {errorMessage}
              </p>
            ) : null}
          </div>
          {onRetry ? (
            <div className="mt-2 flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={onRetry}>
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                {retryLabel}
              </Button>
            </div>
          ) : null}
        </div>
      </TableCell>
    </TableRow>
  )
}

export const DataTableErrorState = React.memo(BaseDataTableErrorState)
