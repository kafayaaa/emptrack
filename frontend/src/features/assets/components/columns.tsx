import Link from "next/link"
import { createColumnHelper } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader, type dataTableFeatures } from "@/components/shared/data-table"
import { formatDate } from "@/lib/date"
import type { Asset } from "../types"
import { AssetStatusBadge } from "./asset-status-badge"

export const ASSET_COLUMN_LABELS: Record<string, string> = {
  select: "Select",
  assetTag: "Asset Tag",
  name: "Asset Name",
  category: "Category",
  model: "Model / Spec",
  status: "Status",
  assignedTo: "Assigned To",
  purchaseCost: "Purchase Cost",
  purchaseDate: "Purchase Date",
}

export function getAssetColumnLabel(columnId: string): string {
  return ASSET_COLUMN_LABELS[columnId] ?? columnId
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function AssetNameCell({ asset }: { asset: Asset }) {
  return (
    <div className="flex flex-col gap-0.5">
      <Link
        href={`/assets/${asset.id}`}
        className="font-medium text-foreground transition-colors hover:text-primary hover:underline"
      >
        {asset.name}
      </Link>
      <span className="font-mono text-xs text-muted-foreground">{asset.serialNumber}</span>
    </div>
  )
}

const columnHelper = createColumnHelper<typeof dataTableFeatures, Asset>()

export const assetColumns = columnHelper.columns([
  columnHelper.display({
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={table.getIsSomePageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Pilih semua baris pada halaman ini"
          data-testid="select-all-checkbox"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={`Pilih aset ${row.original.name}`}
          data-testid={`select-row-checkbox-${row.original.id}`}
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  }),
  columnHelper.accessor("assetTag", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Asset Tag" />,
    cell: (info) => (
      <span className="font-mono text-xs font-semibold text-foreground">{info.getValue()}</span>
    ),
    enableSorting: true,
  }),
  columnHelper.accessor("name", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Asset Name" />,
    cell: (info) => <AssetNameCell asset={info.row.original} />,
    enableSorting: true,
  }),
  columnHelper.accessor("category", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
    cell: (info) => (
      <Badge variant="outline" className="font-normal">
        {info.getValue()}
      </Badge>
    ),
    enableSorting: true,
  }),
  columnHelper.accessor("model", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Model / Spec" />,
    cell: (info) => <span className="truncate text-xs">{info.getValue()}</span>,
    enableSorting: true,
  }),
  columnHelper.accessor("status", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: (info) => <AssetStatusBadge status={info.getValue()} />,
    enableSorting: true,
  }),
  columnHelper.display({
    id: "assignedTo",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Assigned To" />,
    cell: ({ row }) => {
      const assigned = row.original.assignedTo
      const assignedId = row.original.assignedToId
      if (!assigned && !assignedId) {
        return <span className="text-xs text-muted-foreground italic">Unassigned</span>
      }
      return (
        <div className="flex flex-col gap-0.5 text-xs">
          {assignedId ? (
            <Link
              href={`/employees/${assignedId}`}
              className="font-medium text-foreground hover:text-primary hover:underline"
            >
              {assigned?.fullName ?? "View Employee"}
            </Link>
          ) : (
            <span>{assigned?.fullName}</span>
          )}
          {assigned?.department && (
            <span className="text-[11px] text-muted-foreground">{assigned.department}</span>
          )}
        </div>
      )
    },
    enableSorting: false,
  }),
  columnHelper.accessor("purchaseCost", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Cost" />,
    cell: (info) => (
      <span className="font-mono text-xs text-muted-foreground">
        {formatCurrency(info.getValue())}
      </span>
    ),
    enableSorting: true,
  }),
  columnHelper.accessor("purchaseDate", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Purchase Date" />,
    cell: (info) => (
      <time dateTime={info.getValue()} className="text-xs text-muted-foreground">
        {formatDate(info.getValue())}
      </time>
    ),
    enableSorting: true,
  }),
])
