import * as React from "react"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"

export interface ColumnSortable {
  getCanSort: () => boolean
  getIsSorted: () => false | "asc" | "desc"
  toggleSorting: (desc?: boolean, isMulti?: boolean) => void
}

interface DataTableColumnHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  column: ColumnSortable
  title: string
}

function BaseDataTableColumnHeader({ column, title, className }: DataTableColumnHeaderProps) {
  if (!column.getCanSort()) {
    return (
      <div className={cn("text-xs font-semibold text-muted-foreground", className)}>{title}</div>
    )
  }

  const isSorted = column.getIsSorted()

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        variant="ghost"
        size="xs"
        className="-ml-2 h-7 px-2 font-semibold text-muted-foreground hover:text-foreground data-[state=open]:bg-accent"
        onClick={() => column.toggleSorting(isSorted === "asc")}
        aria-label={`Sort by ${title}`}
      >
        <span>{title}</span>
        {isSorted === "desc" ? (
          <ArrowDown className="ml-1 size-3.5 text-foreground" />
        ) : isSorted === "asc" ? (
          <ArrowUp className="ml-1 size-3.5 text-foreground" />
        ) : (
          <ArrowUpDown className="ml-1 size-3.5 opacity-60" />
        )}
      </Button>
    </div>
  )
}

export const DataTableColumnHeader = React.memo(BaseDataTableColumnHeader)
