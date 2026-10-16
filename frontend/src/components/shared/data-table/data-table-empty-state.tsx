import * as React from "react"
import { LucideIcon, SearchX } from "lucide-react"
import { TableRow, TableCell } from "@/components/ui/table"

export interface DataTableEmptyStateProps {
  colSpan: number
  icon?: LucideIcon
  title?: string
  description?: string
  action?: React.ReactNode
}

function BaseDataTableEmptyState({
  colSpan,
  icon: Icon = SearchX,
  title = "No data found",
  description = "No results match your criteria. Try adjusting your filters or search keywords.",
  action,
}: DataTableEmptyStateProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-64 text-center">
        <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
          <div className="rounded-full bg-muted/60 p-3 text-muted-foreground">
            <Icon className="h-6 w-6 stroke-[1.75]" />
          </div>
          <div className="max-w-sm space-y-1">
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            {description ? (
              <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {action ? <div className="mt-2 flex items-center gap-2">{action}</div> : null}
        </div>
      </TableCell>
    </TableRow>
  )
}

export const DataTableEmptyState = React.memo(BaseDataTableEmptyState)
