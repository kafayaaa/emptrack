import * as React from "react"
import Link from "next/link"
import { Box, Calendar, Laptop, Monitor, Smartphone, User } from "lucide-react"
import { cn } from "cn"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { formatDate } from "@/lib/date"
import { usePrefetchEmployee } from "@/features/employees/hooks"
import { usePrefetchAsset } from "../hooks"
import type { Asset, AssetCategory } from "../types"
import { AssetStatusBadge } from "./asset-status-badge"

export interface AssetMobileCardProps {
  asset: Asset
  isSelected?: boolean
  onSelectChange?: (selected: boolean) => void
}

function getCategoryIcon(category: AssetCategory) {
  switch (category) {
    case "Laptop":
      return <Laptop className="size-4" />
    case "Monitor":
      return <Monitor className="size-4" />
    case "Mobile Device":
      return <Smartphone className="size-4" />
    default:
      return <Box className="size-4" />
  }
}

function BaseAssetMobileCard({ asset, isSelected = false, onSelectChange }: AssetMobileCardProps) {
  const { prefetchEmployee } = usePrefetchEmployee()
  const { prefetchAsset } = usePrefetchAsset()

  return (
    <div
      data-testid={`asset-mobile-card-${asset.id}`}
      data-selected={isSelected ? "true" : undefined}
      className={cn(
        "flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-2xs transition-colors",
        isSelected
          ? "border-primary/80 bg-primary/5 ring-1 ring-primary/30"
          : "border-border hover:border-border/80",
      )}
    >
      {/* Top Header: Name, Asset Tag, and Status Badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2.5">
          {onSelectChange ? (
            <div className="flex shrink-0 pt-1">
              <Checkbox
                checked={isSelected}
                onCheckedChange={onSelectChange}
                aria-label={`Pilih aset ${asset.name}`}
                data-testid={`asset-mobile-checkbox-${asset.id}`}
              />
            </div>
          ) : (
            <div
              aria-hidden="true"
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
            >
              {getCategoryIcon(asset.category)}
            </div>
          )}
          <div className="flex min-w-0 flex-col">
            <div className="flex flex-wrap items-center gap-1.5">
              <Link
                href={`/assets/${asset.id}`}
                onMouseEnter={() => prefetchAsset(asset.id)}
                onFocus={() => prefetchAsset(asset.id)}
                className="truncate font-semibold text-foreground transition-colors hover:text-primary hover:underline"
              >
                {asset.name}
              </Link>
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-mono font-medium text-foreground">{asset.assetTag}</span>
              <span>•</span>
              <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                {asset.category}
              </Badge>
            </div>
          </div>
        </div>
        <AssetStatusBadge status={asset.status} className="shrink-0 text-[11px]" />
      </div>

      {/* Model & Specifications */}
      <div className="rounded-md bg-muted/40 px-2.5 py-1.5 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{asset.model}</span>
        {asset.serialNumber && (
          <span className="ml-1.5 font-mono text-[11px] text-muted-foreground/80">
            (SN: {asset.serialNumber})
          </span>
        )}
      </div>

      {/* Bottom Metadata: Assigned To and Purchase Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-2.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <User className="size-3.5 shrink-0 text-muted-foreground/70" />
          <span className="truncate">
            {asset.assignedTo?.fullName ? (
              asset.assignedToId ? (
                <Link
                  href={`/employees/${asset.assignedToId}`}
                  onMouseEnter={() => prefetchEmployee(asset.assignedToId!)}
                  onFocus={() => prefetchEmployee(asset.assignedToId!)}
                  className="font-medium text-foreground transition-colors hover:text-primary hover:underline"
                  data-testid={`asset-mobile-assigned-employee-${asset.id}`}
                >
                  {asset.assignedTo.fullName}
                </Link>
              ) : (
                <span className="font-medium text-foreground">{asset.assignedTo.fullName}</span>
              )
            ) : (
              <span className="text-muted-foreground/60 italic">Unassigned</span>
            )}
          </span>
        </div>

        {asset.purchaseDate && (
          <div className="flex items-center gap-1">
            <Calendar className="size-3 shrink-0 text-muted-foreground/70" />
            <time dateTime={asset.purchaseDate}>{formatDate(asset.purchaseDate)}</time>
          </div>
        )}
      </div>
    </div>
  )
}

export const AssetMobileCard = React.memo(BaseAssetMobileCard)
